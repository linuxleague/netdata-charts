import React from "react"
import { ThemeProvider } from "styled-components"
import { DefaultTheme, DarkTheme } from "@netdata/netdata-ui/lib/theme"
import { Flex, Text } from "@netdata/netdata-ui"
import Line from "@/components/line"
import GaugeComponent from "@/components/gauge"
import EasyPieComponent from "@/components/easyPie"
import NumberComponent from "@/components/number"
import D3pieComponent from "@/components/d3pie"
import GroupBoxes from "@/components/groupBoxes"
import makeDefaultSDK from "./makeDefaultSDK"

const Popover = ({ children }) => (
  <Flex background="elementBackground" padding={[4]} round border>
    <Text>{children}</Text>
  </Flex>
)

const renderBoxPopover = () => <Popover>Box Popover</Popover>
const renderGroupPopover = () => <Popover>Group Popover</Popover>

const Template = ({ nodesScope, contextScope, contexts, host, theme, singleDimension }) => {
  const sdk = makeDefaultSDK({ attributes: { theme, width: 1000, host } })
  const chart = sdk.makeChart({
    attributes: {
      id: "control",
      selectedContexts: [contexts],
      nodesScope: [nodesScope],
      contextScope: [contextScope],
      aggregationMethod: "avg",
      agent: true,
      syncHover: true,
      groupingMethod: "average",
    },
  })

  sdk.appendChild(chart)

  const chart7 = sdk.makeChart({
    attributes: {
      id: "test",
      selectedContexts: [contexts],
      nodesScope: [nodesScope],
      contextScope: [contextScope],
      aggregationMethod: "avg",
      agent: true,
      syncHover: true,
      groupingMethod: "average",
    },
  })

  sdk.appendChild(chart7)

  const chart2 = sdk.makeChart({
    attributes: {
      selectedContexts: [contexts],
      nodesScope: [nodesScope],
      contextScope: [contextScope],
      selectedDimensions: ["in"],
      agent: true,
      chartLibrary: "easypiechart",
      urlOptions: ["percentage"],
      "group_by[0]": ["percentage-of-instance"],
      syncHover: true,
    },
  })

  sdk.appendChild(chart2)

  const chart3 = sdk.makeChart({
    attributes: {
      selectedContexts: [contexts],
      nodesScope: [nodesScope],
      contextScope: [contextScope],
      selectedDimensions: ["out"],
      agent: true,
      chartLibrary: "gauge",
      syncHover: true,
      urlOptions: ["percentage"],
    },
  })

  sdk.appendChild(chart3)

  const chart4 = sdk.makeChart({
    attributes: {
      selectedContexts: [contexts],
      nodesScope: [nodesScope],
      contextScope: [contextScope],
      agent: true,
      chartLibrary: "groupBoxes",
      groupBy: ["dimension", "node"],
    },
  })
  sdk.appendChild(chart4)

  const chart5 = sdk.makeChart({
    attributes: {
      selectedContexts: [contexts],
      nodesScope: [nodesScope],
      contextScope: [contextScope],
      agent: true,
      chartLibrary: "number",
      syncHover: true,
    },
  })

  sdk.appendChild(chart5)

  const chart6 = sdk.makeChart({
    attributes: {
      selectedContexts: [contexts],
      nodesScope: [nodesScope],
      contextScope: [contextScope],
      aggregationMethod: "avg",
      agent: true,
      syncHover: true,
      groupingMethod: "average",
      chartLibrary: "d3pie",
    },
  })

  sdk.appendChild(chart6)

  const chart8 = sdk.makeChart({
    attributes: {
      selectedContexts: [contexts],
      nodesScope: [nodesScope],
      contextScope: [contextScope],
      host: host,
      aggregationMethod: "avg",
      agent: true,
      syncHover: true,
      groupingMethod: "average",
      chartLibrary: "d3pie",
    },
  })

  sdk.appendChild(chart8)

  const chart9 = sdk.makeChart({
    attributes: {
      selectedContexts: [contexts],
      nodesScope: [nodesScope],
      contextScope: [contextScope],
      host: host,
      aggregationMethod: "avg",
      agent: true,
      syncHover: true,
      groupingMethod: "average",
      chartLibrary: "d3pie",
    },
  })

  sdk.appendChild(chart9)

  return (
    <ThemeProvider theme={theme === "default" ? DefaultTheme : DarkTheme}>
      <Flex background="mainBackground" column gap={2} padding={[3]}>
        <Flex>
          <EasyPieComponent chart={chart2} />
          <GaugeComponent chart={chart3} />
          <NumberComponent chart={chart5} />
          <D3pieComponent chart={chart6} />
        </Flex>
        <Flex>
          <D3pieComponent chart={chart8} />
          <D3pieComponent chart={chart9} />
        </Flex>
        <Line chart={chart} height="315px" />
        <Line chart={chart7} height="315px" />
        <GroupBoxes
          chart={chart4}
          renderBoxPopover={renderBoxPopover}
          renderGroupPopover={renderGroupPopover}
        />
      </Flex>
    </ThemeProvider>
  )
}

export default {
  title: "Agent V2",
  component: OneChart,
  argTypes: {
    host: {
      control: { type: "text" },
    },
    nodesScope: {
      control: { type: "text" },
    },
    contextScope: {
      control: { type: "text" },
    },
    contexts: {
      control: { type: "text" },
    },
    // singleDimension: {
    //   control: { type: "text" },
    // },
    theme: {
      control: { type: "select" },
      options: ["default", "dark"],
    },
  },
}

export const OneChart = Template.bind({})

OneChart.args = {
  nodesScope: "*",
  contextScope: "apps.cpu",
  contexts: "*",
  singleDimension: "*",
  theme: "default",
  host: "http://10.10.11.2:19999/api/v2", // "http://192.168.1.205:19999/api/v2/data",
}
