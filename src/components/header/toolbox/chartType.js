import React, { memo } from "react"
import Menu from "@netdata/netdata-ui/lib/components/drops/menu"
import lineChart from "@netdata/netdata-ui/lib/components/icon/assets/line_chart2.svg"
import stackedChart from "@netdata/netdata-ui/lib/components/icon/assets/stacked_chart.svg"
import areaChart from "@netdata/netdata-ui/lib/components/icon/assets/area_chart.svg"
import Icon, { Button } from "@/components/icon"
import { useChart, useAttribute } from "@/components/provider"

const iconProps = { color: "border", margin: [0, 2, 0, 0] }

const items = [
  {
    value: "line",
    label: "Line",
    icon: <Icon svg={lineChart} {...iconProps} />,
  },
  {
    value: "stacked",
    label: "Stacked",
    icon: <Icon svg={stackedChart} {...iconProps} />,
  },
  {
    value: "area",
    label: "Area",
    icon: <Icon svg={areaChart} {...iconProps} />,
  },
]

const ChartType = ({ disabled }) => {
  const chart = useChart()
  const { chartType: metaChartType } = chart.getMetadata()
  const [chartTypeAttribute, setChartType] = useAttribute("chartType")
  const chartType = chartTypeAttribute || metaChartType

  const onChange = value => setChartType(chart.getMetadata().chartType === value ? "" : value)

  const { label, icon } = items.find(({ value }) => value === chartType)

  return (
    <Menu
      value={chartType}
      items={items}
      dropProps={{ align: { top: "bottom", right: "right" } }}
      onChange={onChange}
    >
      <Button
        icon={icon}
        title={label}
        disabled={disabled}
        data-testid="chartHeaderToolbox-chartType"
      />
    </Menu>
  )
}

export default memo(ChartType)
