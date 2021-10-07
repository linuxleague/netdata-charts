import React, { useState } from "react"
import styled from "styled-components"
import Flex from "@netdata/netdata-ui/lib/components/templates/flex"
import { Text } from "@netdata/netdata-ui/lib/components/typography"
import ChartContainer from "@/components/chartContainer"
import {
  useChart,
  useTitle,
  useUnitSign,
  useAttributeValue,
  useListener,
  useOnResize,
} from "@/components/provider"
import { getSizeBy } from "@netdata/netdata-ui/lib/theme/utils"
import { withChartProvider } from "@/components/provider"
import withChartTrack from "@/components/hocs/withChartTrack"
import withIntersection from "./withIntersection"
import withDifferedMount from "@/components/hocs/withDifferedMount"

const Label = styled(Text)`
  line-height: 1;
  font-size: ${({ fontSize }) => fontSize};
`

const Title = () => {
  const title = useTitle()

  return (
    <Label color="border" fontSize="1.2em" strong>
      {title}
    </Label>
  )
}

const Value = () => {
  const chart = useChart()

  const getValue = () => {
    const { hoverX, after } = chart.getAttributes()
    if (!hoverX && after > 0) return "-"

    const v = chart.getUI().getValue()
    return chart.getConvertedValue(v)
  }
  const [value, setValue] = useState(getValue)

  useListener(() => chart.getUI().on("rendered", () => setValue(getValue())), [])

  return (
    <Label color="main" fontSize="2.2em" strong>
      {value}
    </Label>
  )
}

const Unit = () => {
  const unit = useUnitSign()
  return (
    <Label color="border" fontSize="1em" alignSelf="start">
      {unit}
    </Label>
  )
}

const useEmptyValue = () => {
  const chart = useChart()

  const getValue = () => {
    const { hoverX, after } = chart.getAttributes()
    return !hoverX && after > 0
  }
  const [value, setValue] = useState(getValue)

  useListener(() => chart.getUI().on("rendered", () => setValue(getValue())), [])

  return value
}

const Bound = ({ bound, empty, ...rest }) => {
  const chart = useChart()
  const value = useAttributeValue(bound)

  return (
    <Label color="main" fontSize="1.7em" {...rest}>
      {empty ? "-" : chart.getConvertedValue(value)}
    </Label>
  )
}

const Bounds = () => {
  const empty = useEmptyValue()

  return (
    <Flex justifyContent="between">
      <Bound bound="min" empty={empty} />
      <Bound bound="max" empty={empty} />
    </Flex>
  )
}

const StatsContainer = styled(Flex).attrs({
  position: "absolute",
  column: true,
  justifyContent: "between",
  alignContent: "center",
})`
  inset: 0 10%;
  text-align: center;
  font-size: ${({ fontSize }) => fontSize};
`

const Stats = () => {
  const width = useOnResize()

  return (
    <StatsContainer fontSize={`${width / 20}px`}>
      <Title />
      <Value />
      <Bounds />
      <Unit />
    </StatsContainer>
  )
}

const Skeleton = styled(Flex).attrs({
  background: "borderSecondary",
  position: "absolute",
})`
  inset: ${getSizeBy(1)} ${getSizeBy(3)} ${getSizeBy(3)};
  border-top-left-radius: 100%;
  border-top-right-radius: 100%;
`

const Container = styled(Flex).attrs({ position: "relative" })`
  padding-bottom: 60%;
`

const ChartWrapper = styled.div`
  position: absolute;
  inset: 0;
`

export const Gauge = props => {
  const loaded = useAttributeValue("loaded")

  return (
    <Container {...props}>
      {!loaded && <Skeleton />}
      {loaded && (
        <ChartWrapper>
          <ChartContainer as="canvas" />
          <Stats />
        </ChartWrapper>
      )}
    </Container>
  )
}

export default withChartProvider(withIntersection(withChartTrack(withDifferedMount(Gauge))))
