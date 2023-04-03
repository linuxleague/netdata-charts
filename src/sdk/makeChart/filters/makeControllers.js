import deepEqual from "@/helpers/deepEqual"
import pristine, { pristineKey } from "@/sdk/pristine"
import getInitialFilterAttributes, { stackedAggregations } from "./getInitialAttributes"

export default chart => {
  const chartType = chart.getAttribute("chartType")
  let prevChartType = chartType
  const onGroupChange = groupBy => {
    chart.updateAttribute("selectedLegendDimensions", [])
    if (chart.getAttribute("selectedChartType")) return

    if (groupBy.length > 1 || groupBy[0] !== "dimension") {
      prevChartType = prevChartType || chart.getAttribute("chartType")
      const aggregationMethod = chart.getAttribute("aggregationMethod")
      return chart.updateAttribute(
        "chartType",
        stackedAggregations[aggregationMethod] ? "stacked" : chartType
      )
    } else {
      chart.updateAttribute("chartType", prevChartType)
    }
    prevChartType = chartType
  }

  const allowedGroupByValues = {
    node: true,
    instance: true,
    dimension: true,
  }

  const updateGroupByAttribute = selected => {
    const selectedLabels = selected.filter(sel => sel.isLabel)
    const groupByLabel = selectedLabels.map(sel => sel.value)

    let groupBy = selected.reduce((h, sel) => {
      if (!allowedGroupByValues[sel.value]) return h
      h.push(sel.value)
      return h
    }, [])

    if (selectedLabels.length) groupBy.push("label")

    if (!groupBy.length) groupBy = ["dimension"]

    if (
      deepEqual(groupBy, chart.getAttribute("groupBy")) &&
      deepEqual(groupByLabel, chart.getAttribute("groupByLabel"))
    )
      return

    chart.updateAttributes({
      groupByLabel: groupByLabel,
      groupBy: groupBy,
    })

    chart.updateAttributes(getInitialFilterAttributes(chart))
    chart.fetch().then(() => onGroupChange(chart.getAttribute("groupBy")))
  }

  const updateNodesAttribute = selected => {
    const { selectedNodes, selectedInstances } = selected.reduce(
      (h, sel) => {
        if (sel.isInstance) {
          h.selectedInstances.push(sel.value)
        } else {
          h.selectedNodes.push(sel.value)
        }
        return h
      },
      { selectedNodes: [], selectedInstances: [] }
    )

    const nodesHaveChanges = !deepEqual(selectedNodes, chart.getAttribute("selectedNodes"))
    if (nodesHaveChanges) chart.updateAttribute("selectedNodes", selectedNodes)

    const instancesHaveChanges = !deepEqual(
      selectedInstances,
      chart.getAttribute("selectedInstances")
    )
    if (instancesHaveChanges) chart.updateAttribute("selectedInstances", selectedInstances)

    if (instancesHaveChanges || nodesHaveChanges) chart.trigger("fetch")
  }

  const updateInstancesAttribute = selected => {
    const selectedInstances = selected.map(sel => sel.value)

    if (deepEqual(selectedInstances, chart.getAttribute("selectedInstances"))) return

    chart.updateAttribute("selectedInstances", selectedInstances)

    chart.trigger("fetch")
  }

  const updateDimensionsAttribute = selected => {
    const selectedDimensions = selected.map(sel => sel.value)

    if (deepEqual(selectedDimensions, chart.getAttribute("selectedDimensions"))) return

    chart.updateAttribute("selectedDimensions", selectedDimensions)

    chart.trigger("fetch")
  }

  const updateLabelsAttribute = selected => {
    const selectedLabels = selected.map(sel => sel.value)

    if (deepEqual(selectedLabels, chart.getAttribute("selectedLabels"))) return

    chart.updateAttribute("selectedLabels", selectedLabels)

    chart.trigger("fetch")
  }

  const updateAggregationMethodAttribute = value => {
    if (chart.getAttribute("aggregationMethod") === value) return

    chart.updateAttribute("aggregationMethod", value)

    chart.trigger("fetch")
  }

  const updateContextScopeAttribute = value => {
    if (chart.getAttribute("contextScope")[0] === value) return

    chart.updateAttribute("contextScope", [value])
    chart.updateAttributes(getInitialFilterAttributes(chart))

    chart.trigger("fetch")
  }

  const updateTimeAggregationMethodAttribute = ({ alias, method }) => {
    const value = alias ? `${method}${alias}` : method

    if (chart.getAttribute("groupingMethod") === value) return

    chart.updateAttribute("groupingMethod", value)
    chart.trigger("fetch")
  }

  const resetPristine = () => {
    const attributes = chart.getAttributes()
    const prev = { ...attributes[pristineKey] }
    pristine.reset(attributes)
    chart.attributeListeners.trigger(pristineKey, attributes[pristineKey], prev)
    chart.sdk.trigger("pristineChanged", chart, pristineKey, attributes[pristineKey], prev)
    Object.keys(prev).forEach(key =>
      chart.attributeListeners.trigger(key, attributes[key], prev[key])
    )
    chart.trigger("fetch")
  }

  const removePristine = () => {
    const prev = chart.getAttribute(pristineKey)
    const next = {}
    chart.updateAttribute(pristineKey, next)
    chart.sdk.trigger("pristineChanged", chart, pristineKey, next, prev)
  }

  return {
    updateGroupByAttribute,
    updateNodesAttribute,
    updateInstancesAttribute,
    updateDimensionsAttribute,
    updateLabelsAttribute,
    updateAggregationMethodAttribute,
    updateTimeAggregationMethodAttribute,
    updateContextScopeAttribute,
    resetPristine,
    removePristine,
  }
}
