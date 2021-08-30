import getInitialFilterAttributes from "./getInitialAttributes"
import pristineComposite, { pristineCompositeKey } from "@/sdk/pristineComposite"

export default chart => {
  const updateGroupByAttribute = value => {
    chart.updateAttribute("groupBy", value)
    const attributes = getInitialFilterAttributes(chart)
    chart.updateAttributes(attributes)
    chart.fetchAndRender()
  }

  const getNextDimensionsAttribute = nextValue => {
    const value = chart.getAttribute("dimensions")

    if (nextValue === "all") return []

    const nextAttribute = value.includes(nextValue)
      ? value.filter(v => v !== nextValue)
      : [...value, nextValue]

    const { dimensions } = chart.getMetadata()

    if (nextAttribute.length === 0 || nextAttribute.length === Object.keys(dimensions).length)
      return []

    return nextAttribute
  }

  const updateDimensionsAttribute = nextValue => {
    const value = getNextDimensionsAttribute(nextValue)
    chart.updateAttribute("dimensions", value)
    chart.fetchAndRender()
  }

  const updateAggregationMethodAttribute = value => {
    chart.updateAttribute("aggregationMethod", value)
    chart.fetchAndRender()
  }

  const resetPristineComposite = () => {
    const attributes = chart.getAttributes()
    const prev = { ...attributes[pristineCompositeKey] }
    pristineComposite.reset(attributes)
    chart.attributeListeners.trigger(pristineCompositeKey, attributes[pristineCompositeKey], prev)
    chart.sdk.trigger(
      "pristineChanged",
      chart,
      pristineCompositeKey,
      attributes[pristineCompositeKey],
      prev
    )
    Object.keys(prev).forEach(key =>
      chart.attributeListeners.trigger(key, attributes[key], prev[key])
    )
  }

  const removePristineComposite = () => {
    const prev = chart.getAttribute(pristineCompositeKey)
    const next = {}
    chart.updateAttribute(pristineCompositeKey, next)
    chart.sdk.trigger("pristineChanged", chart, pristineCompositeKey, next, prev)
  }

  return {
    updateGroupByAttribute,
    updateDimensionsAttribute,
    updateAggregationMethodAttribute,
    resetPristineComposite,
    removePristineComposite,
  }
}