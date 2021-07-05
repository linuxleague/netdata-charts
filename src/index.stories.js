import React from "react"
import { ThemeProvider } from "styled-components"
import { DefaultTheme, DarkTheme } from "@netdata/netdata-ui/lib/theme"
import Flex from "@netdata/netdata-ui/lib/components/templates/flex"
import { camelizeKeys } from "@/helpers/objectTransform"
import Chart from "@/components/chart"
import makeMockPayload from "@/helpers/makeMockPayload"
import makeDefaultSDK from "./makeDefaultSDK"

import noData from "@/fixtures/noData"

import systemLoadLineChart from "@/fixtures/systemLoadLineChart"
import systemLoadLine from "@/fixtures/systemLoadLine"

import systemCpuStacked from "@/fixtures/systemCpuStacked"
import systemCpuStackedChart from "@/fixtures/systemCpuStackedChart"

import systemRamStacked from "@/fixtures/systemRamStacked"
import systemRamStackedChart from "@/fixtures/systemRamStackedChart"

import webLogNginxResponseTimeArea from "@/fixtures/webLogNginxResponseTimeArea"
import webLogNginxResponseTimeAreaChart from "@/fixtures/webLogNginxResponseTimeAreaChart"

import systemIpv6Area from "@/fixtures/systemIpv6Area"
import systemIpv6AreaChart from "@/fixtures/systemIpv6AreaChart"

import systemIpArea from "@/fixtures/systemIpArea"
import systemIpAreaChart from "@/fixtures/systemIpAreaChart"

const getChartMetadata = () => camelizeKeys(systemLoadLineChart, { omit: ["dimensions"] })
const getChart = makeMockPayload(systemLoadLine[0], { delay: 600 })

export const SimpleReal = () => {
  const { id, context } = getChartMetadata()
  const sdk = makeDefaultSDK({ getChartMetadata })
  const chart = sdk.makeChart({
    attributes: { host: "http://d1.firehol.org/api/v1/data", id, context },
  })
  sdk.appendChild(chart)

  return (
    <ThemeProvider theme={DefaultTheme}>
      <Chart chart={chart} />
    </ThemeProvider>
  )
}

export const Simple = () => {
  const sdk = makeDefaultSDK({ getChartMetadata })
  const chart = sdk.makeChart({ getChart })
  sdk.appendChild(chart)

  return (
    <ThemeProvider theme={DefaultTheme}>
      <Chart chart={chart} />
    </ThemeProvider>
  )
}

export const SimpleDark = () => {
  const sdk = makeDefaultSDK({ getChartMetadata, attributes: { theme: "dark" } })
  const chart = sdk.makeChart({ getChart })
  sdk.appendChild(chart)

  return (
    <ThemeProvider theme={DarkTheme}>
      <Flex background="mainBackground">
        <Chart chart={chart} />
      </Flex>
    </ThemeProvider>
  )
}

export const NoData = () => {
  const sdk = makeDefaultSDK({ getChartMetadata })
  const chart = sdk.makeChart({
    getChart: () => new Promise(r => setTimeout(() => r(noData), 600)),
  })
  sdk.appendChild(chart)

  return (
    <ThemeProvider theme={DefaultTheme}>
      <Chart chart={chart} />
    </ThemeProvider>
  )
}

export const PrecededData = () => {
  let metadata
  let fromTimestamp
  const sdk = makeDefaultSDK({
    getChartMetadata: () => {
      metadata = getChartMetadata()
      metadata.firstEntry = Math.floor(fromTimestamp / 1000)
      return metadata
    },
  })
  const chart = sdk.makeChart({
    getChart: chart =>
      getChart(chart).then(payload => {
        if (!fromTimestamp) {
          fromTimestamp = payload.result.data[Math.floor(payload.result.data.length / 3)][0]
          metadata.firstEntry = Math.floor(fromTimestamp / 1000)
        }

        return {
          ...payload,
          firstEntry: Math.floor(fromTimestamp / 1000),
          result: {
            ...payload.result,
            data: payload.result.data.filter(d => d[0] > fromTimestamp),
          },
        }
      }),
  })
  sdk.appendChild(chart)

  return (
    <ThemeProvider theme={DefaultTheme}>
      <Chart chart={chart} />
    </ThemeProvider>
  )
}

export const Timeout = () => {
  let requests = 0
  const sdk = makeDefaultSDK({ getChartMetadata })
  const chart = sdk.makeChart({
    getChart: params => {
      if (requests++ % 2 === 1)
        return new Promise(r => setTimeout(() => getChart(params).then(r), 10000))
      return getChart(params)
    },
  })
  sdk.appendChild(chart)

  return (
    <ThemeProvider theme={DefaultTheme}>
      <Chart chart={chart} />
    </ThemeProvider>
  )
}

export const Error = () => {
  let requests = 0
  const sdk = makeDefaultSDK({ getChartMetadata })
  const chart = sdk.makeChart({
    getChart: params => {
      if (requests++ % 2 === 1)
        return new Promise((resolve, reject) => setTimeout(() => reject(), 200))
      return getChart(params)
    },
  })
  sdk.appendChild(chart)

  return (
    <ThemeProvider theme={DefaultTheme}>
      <Chart chart={chart} />
    </ThemeProvider>
  )
}

export const InitialLoading = () => {
  const sdk = makeDefaultSDK({ getChartMetadata })
  const chart = sdk.makeChart({ getChart: () => new Promise(() => {}) })
  const darkChart = sdk.makeChart({
    getChart: () => new Promise(() => {}),
    attributes: { theme: "dark" },
  })
  sdk.appendChild(chart)
  sdk.appendChild(darkChart)

  return (
    <div>
      <ThemeProvider theme={DefaultTheme}>
        <Chart chart={chart} />
      </ThemeProvider>
      <ThemeProvider theme={DarkTheme}>
        <Flex background="mainBackground" margin={[10, 0, 0]}>
          <Chart chart={darkChart} />
        </Flex>
      </ThemeProvider>
    </div>
  )
}

export const MultipleReal = () => {
  const { id, context } = getChartMetadata()
  const sdk = makeDefaultSDK({ getChartMetadata })

  const charts = Array.from(Array(10)).map((v, index) => {
    const chart = sdk.makeChart({
      attributes: { id, context, host: "http://d1.firehol.org/api/v1/data" },
    })
    sdk.appendChild(chart)

    return chart
  })

  return (
    <ThemeProvider theme={DefaultTheme}>
      <Flex column gap={20}>
        {charts.map(chart => (
          <Chart key={chart.getUuid()} chart={chart} />
        ))}
      </Flex>
    </ThemeProvider>
  )
}

export const Multiple = () => {
  const sdk = makeDefaultSDK({ getChartMetadata })

  const charts = Array.from(Array(3)).map((v, index) => {
    const chart = sdk.makeChart({ attributes: { id: index }, getChart })
    sdk.appendChild(chart)

    return chart
  })

  return (
    <ThemeProvider theme={DefaultTheme}>
      <Flex column gap={2}>
        {charts.map(chart => (
          <Chart key={chart.getUuid()} chart={chart} />
        ))}
      </Flex>
    </ThemeProvider>
  )
}

export const Sync = () => {
  const sdk = makeDefaultSDK({ getChartMetadata })

  const charts = Array.from(Array(3)).map((v, index) => {
    const chart = sdk.makeChart({ attributes: { id: index, syncHover: index !== 1 }, getChart })
    sdk.appendChild(chart)
    return chart
  })

  return (
    <ThemeProvider theme={DefaultTheme}>
      <Flex column gap={2}>
        {charts.map(chart => (
          <Chart key={chart.getUuid()} chart={chart} />
        ))}
      </Flex>
    </ThemeProvider>
  )
}

export const SystemCpuStackedChart = () => {
  const getChartMetadata = () => camelizeKeys(systemCpuStackedChart, { omit: ["dimensions"] })
  const getChart = makeMockPayload(systemCpuStacked, { delay: 1000 })

  const sdk = makeDefaultSDK({ getChartMetadata })
  const chart = sdk.makeChart({ getChart })
  sdk.appendChild(chart)

  return (
    <ThemeProvider theme={DefaultTheme}>
      <Chart chart={chart} />
    </ThemeProvider>
  )
}

export const SystemRamStacked = () => {
  const getChartMetadata = () => camelizeKeys(systemRamStackedChart, { omit: ["dimensions"] })
  const getChart = makeMockPayload(systemRamStacked, { delay: 1000 })

  const sdk = makeDefaultSDK({ getChartMetadata })
  const chart = sdk.makeChart({ getChart })
  sdk.appendChild(chart)

  return (
    <ThemeProvider theme={DefaultTheme}>
      <Chart chart={chart} />
    </ThemeProvider>
  )
}

export const AreaWebLogNginxResponseTimeArea = () => {
  const getChartMetadata = () =>
    camelizeKeys(webLogNginxResponseTimeAreaChart, { omit: ["dimensions"] })
  const getChart = makeMockPayload(webLogNginxResponseTimeArea, { delay: 1000 })

  const sdk = makeDefaultSDK({ getChartMetadata })
  const chart = sdk.makeChart({ getChart })
  sdk.appendChild(chart)

  return (
    <ThemeProvider theme={DefaultTheme}>
      <Chart chart={chart} />
    </ThemeProvider>
  )
}

export const SystemIpv6Area = () => {
  const getChartMetadata = () => camelizeKeys(systemIpv6AreaChart, { omit: ["dimensions"] })
  const getChart = makeMockPayload(systemIpv6Area, { delay: 1000 })

  const sdk = makeDefaultSDK({ getChartMetadata })
  const chart = sdk.makeChart({ getChart })
  sdk.appendChild(chart)

  return (
    <ThemeProvider theme={DefaultTheme}>
      <Chart chart={chart} />
    </ThemeProvider>
  )
}

export const SystemIpArea = () => {
  const getChartMetadata = () => camelizeKeys(systemIpAreaChart, { omit: ["dimensions"] })
  const getChart = makeMockPayload(systemIpArea, { delay: 1000 })

  const sdk = makeDefaultSDK({ getChartMetadata })
  const chart = sdk.makeChart({ getChart })
  sdk.appendChild(chart)

  return (
    <ThemeProvider theme={DefaultTheme}>
      <Chart chart={chart} />
    </ThemeProvider>
  )
}

export default {
  title: "Charts",
  component: Simple,
}
