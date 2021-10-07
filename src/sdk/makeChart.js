import deepEqual from "@/helpers/deepEqual"
import makeKeyboardListener from "@/helpers/makeKeyboardListener"
import makeNode from "./makeNode"
import initialPayload from "./initialPayload"
import convert from "./unitConversion"
import { fetchChartData } from "./api"
import makeDimensions from "./makeDimensions"
import makeGetClosestRow from "./makeGetClosestRow"
import getInitialFilterAttributes from "./filters/getInitialAttributes"
import makeFilterControllers from "./filters/makeControllers"
import camelizePayload from "./camelizePayload"

const requestTimeoutMs = 5 * 1000
const maxBackoffMs = 30 * 1000

const defaultMakeTrack = () => value => value

export default ({
  sdk,
  parent,
  getChart = fetchChartData,
  chartsMetadata,
  attributes,
  makeTrack = defaultMakeTrack,
} = {}) => {
  let node = makeNode({ sdk, parent, attributes })
  let ui = null
  let abortController = null
  let payload = initialPayload
  let fetchDelayTimeoutId = null
  let fetchTimeoutId = null
  let prevMetadata = null

  let backoffMs = null
  const backoff = ms => {
    if (ms) {
      backoffMs = ms
      return
    }
    const tmpBackoffMs = backoffMs ? backoffMs * 2 : getUpdateEvery()
    backoffMs = tmpBackoffMs > maxBackoffMs ? maxBackoffMs : tmpBackoffMs
  }

  const getMetadataDecorator = () => chartsMetadata || sdk.chartsMetadata

  const getPayload = () => payload

  const { invalidateClosestRowCache, getClosestRow } = makeGetClosestRow(getPayload)

  const cancelFetch = () => abortController && abortController.abort()

  const getMetadata = () => getMetadataDecorator().get(instance)
  const fetchMetadata = () => getMetadataDecorator().fetch(instance)

  const clearFetchDelayTimeout = () => {
    if (fetchDelayTimeoutId === null) node.trigger("timeout", false)
    clearTimeout(fetchDelayTimeoutId)
  }

  const getUpdateEvery = () => {
    const { loaded, updateEvery: updateEveryAttribute } = node.getAttributes()
    if (updateEveryAttribute) return updateEveryAttribute * 1000

    const { viewUpdateEvery } = getPayload()
    if (loaded && viewUpdateEvery) return viewUpdateEvery * 1000

    const { updateEvery = 2 } = getMetadata()
    return updateEvery * 1000
  }

  const startAutofetch = () => {
    const { fetchStartedAt, loading, autofetch, active } = node.getAttributes()

    if (!autofetch || loading || !active) return

    if (fetchStartedAt === 0) return fetch()

    const fetchingPeriod = Date.now() - fetchStartedAt
    const updateEveryMs = getUpdateEvery()
    const div = fetchingPeriod / updateEveryMs
    const updateEveryMultiples = Math.floor(div)

    if (updateEveryMultiples >= 1) return fetch()

    const remaining =
      backoffMs || updateEveryMs - Math.round((div - Math.floor(div)) * updateEveryMs)

    clearTimeout(fetchTimeoutId)
    fetchTimeoutId = setTimeout(() => {
      startAutofetch()
    }, remaining)
  }

  const finishFetch = () => {
    clearFetchDelayTimeout()
    startAutofetch()
    node.trigger("finishFetch")
  }

  const transformResult = ({ viewUpdateEvery, after, result }) => {
    if (!Array.isArray(result)) return result

    const data = result.map((point, index) => [
      (after + viewUpdateEvery * (index + 1)) * 1000,
      point,
    ])

    return { labels: ["time", "sum"], data }
  }

  const doneFetch = nextRawPayload => {
    backoff(null)
    const nextPayload = camelizePayload(nextRawPayload)

    const result = transformResult(nextPayload)

    const { dimensionIds, ...restPayload } = nextPayload

    const prevPayload = payload
    if (deepEqual(payload.dimensionIds, dimensionIds)) {
      payload = {
        ...initialPayload,
        ...payload,
        ...restPayload,
        result,
      }
    } else {
      payload = { ...initialPayload, ...nextPayload, result }
    }

    invalidateClosestRowCache()

    node.updateAttributes({
      loaded: true,
      loading: false,
      updatedAt: Date.now(),
    })

    node.trigger("successFetch", payload, prevPayload)
    finishFetch()
  }

  const failFetch = error => {
    if (!node) return
    backoff()
    node.updateAttribute("loading", false)
    if (!error || error.name !== "AbortError") node.trigger("failFetch", error)
    finishFetch()
  }

  const fetch = () => {
    const { firstEntry } = getMetadata()
    const { after, before } = node.getAttributes()
    const absoluteBefore = after >= 0 ? before : Date.now() / 1000
    if (firstEntry > absoluteBefore) {
      node.updateAttributes({ loaded: true })
      clearFetchDelayTimeout()
      return Promise.resolve()
    }

    node.trigger("startFetch")
    node.updateAttributes({ loading: true, fetchStartedAt: Date.now() })

    clearTimeout(fetchDelayTimeoutId)
    fetchDelayTimeoutId = setTimeout(() => {
      node.trigger("timeout", true)
      fetchDelayTimeoutId = null
    }, requestTimeoutMs)

    abortController = new AbortController()
    const options = { signal: abortController.signal }
    return fetchMetadata()
      .then(() => {
        updateMetadata()
        return getChart(instance, options).then(doneFetch)
      })
      .catch(failFetch)
  }

  const updateMetadata = () => {
    if (getMetadata() === prevMetadata) return
    prevMetadata = getMetadata()
    node.trigger("metadataChanged")

    if (node.getAttribute("composite")) {
      const attributes = getInitialFilterAttributes(instance)
      node.setAttributes(attributes)
    }
  }

  const getUI = () => ui
  const setUI = newUi => {
    ui = newUi
  }

  const fetchAndRender = () => fetch().then(() => ui && ui.render())

  const getConvertedValue = value => {
    const { unitsConversionMethod, unitsConversionDivider, unitsConversionFractionDigits } =
      node.getAttributes()
    const converted = convert(instance, unitsConversionMethod, value, unitsConversionDivider)

    if (unitsConversionFractionDigits === -1) return converted

    return Intl.NumberFormat(undefined, {
      useGrouping: true,
      minimumFractionDigits: unitsConversionFractionDigits,
      maximumFractionDigits: unitsConversionFractionDigits,
    }).format(converted)
  }

  const focus = () => node.updateAttribute("focused", true)
  const blur = () => node.updateAttribute("focused", false)
  const activate = () => {
    node.updateAttribute("active", true)
    sdk.trigger("active", instance, true)
  }
  const deactivate = () => {
    if (!node) return
    node.updateAttribute("active", false)
    sdk.trigger("active", instance, false)
  }

  const stopAutofetch = () => {
    clearTimeout(fetchTimeoutId)

    if (
      !node.getAttribute("active") &&
      node.getAttribute("loaded") &&
      node.getAttribute("loading")
    ) {
      cancelFetch()
    }
  }

  node.onAttributeChange("autofetch", autofetch => {
    if (autofetch) {
      startAutofetch()
    } else {
      stopAutofetch()
    }
  })

  node.onAttributeChange("active", active => {
    if (!active) return stopAutofetch()
    if (node.getAttribute("autofetch")) return startAutofetch()
  })

  const { onKeyChange, onKeyAndMouse, initKeyboardListener, clearKeyboardListener } =
    makeKeyboardListener()

  node.onAttributeChange("focused", focused => {
    focused ? initKeyboardListener() : clearKeyboardListener()
    invalidateClosestRowCache()
  })

  const getApplicableNodes = (attributes, options) => {
    if (!node.match(attributes)) return [instance]

    const ancestor = node.getAncestor(attributes)
    if (!ancestor) return [instance]

    return ancestor.getNodes(attributes, options)
  }

  const destroy = () => {
    cancelFetch()
    stopAutofetch()
    clearFetchDelayTimeout()
    clearKeyboardListener()

    if (ui) ui.unmount()
    ui = null

    const parent = node.getParent()
    if (parent) parent.removeChild(instance)

    node.destroy()
    node = null
    payload = null
    chartsMetadata = null
    attributes = null
    prevMetadata = null
  }

  node.type = "chart"
  node.getApplicableNodes = getApplicableNodes

  const instance = {
    ...node,
    getUI,
    setUI,
    getMetadata,
    getPayload,
    fetch,
    doneFetch,
    cancelFetch,
    fetchAndRender,
    getConvertedValue,
    startAutofetch,
    focus,
    blur,
    activate,
    deactivate,
    getClosestRow,
  }

  onKeyChange(["Alt", "Shift", "KeyF"], () => {
    node.updateAttribute("fullscreen", !node.getAttribute("fullscreen"))
  })

  const dimensions = makeDimensions(instance)

  const onDimensionToggle = onKeyAndMouse(
    ["Shift"],
    id =>
      ({ allPressed: merge }) =>
        dimensions.toggleDimensionId(id, { merge }),
    { allPressed: false }
  )

  const track = makeTrack(instance)

  return {
    ...instance,
    ...dimensions,
    ...makeFilterControllers(instance),
    track,
    destroy,
    onKeyChange,
    onKeyAndMouse,
    onDimensionToggle,
  }
}
