import makePristine from "@/helpers/makePristine"

export const pristineKey = "pristine"

const { updatePristine, resetPristine } = makePristine(pristineKey, [
  "aggregationMethod",
  "selectedDimensions",
  "groupBy",
  "groupByLabel",
  "groupingMethod",
  "chartType",
  "selectedLabels",
  "selectedHosts",
  "selectedInstances",
])

export default { update: updatePristine, reset: resetPristine }