import { trigger, getArea } from "./helpers"

export default (chartUI, id) => {
  const dygraph = chartUI.getDygraph()

  const [, before] = dygraph.xAxisRange()

  const firstEntry = chartUI.chart.getFirstEntry()

  if (!firstEntry || firstEntry > before / 1000) return

  const area = getArea(dygraph, [firstEntry, firstEntry])

  trigger(chartUI, id, area)
}
