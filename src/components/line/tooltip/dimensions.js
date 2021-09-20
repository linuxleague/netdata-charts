import React, { useMemo, memo } from "react"
import styled from "styled-components"
import Flex from "@netdata/netdata-ui/lib/components/templates/flex"
import { useChart, useAttributeValue } from "@/components/provider"
import { TextNano } from "@netdata/netdata-ui/lib/components/typography"
import UpdateEvery from "./updateEvery"
import Timestamp from "./timestamp"
import Dimension from "./dimension"

const Container = styled(Flex).attrs({
  round: true,
  border: { side: "all", color: "elementBackground" },
  width: "196px",
  background: "dropdown",
  column: true,
  padding: [4],
})`
  box-shadow: 0px 8px 12px rgba(9, 30, 66, 0.15), 0px 0px 1px rgba(9, 30, 66, 0.31);
`

const emptyArray = [null, null]

const maxDimensions = 10
const half = maxDimensions / 2

const getFrom = (total, index) => {
  if (total < maxDimensions) return 0

  if (index < half) return 0

  if (index > total - half) return index - (half + (total - index))

  return index - half
}

const getTo = (total, index) => {
  if (total < maxDimensions) return total

  if (index < half) return index + half + (half - index)

  if (index > total - half) return total

  return index + half
}

const Dimensions = () => {
  const chart = useChart()
  const [x, row] = useAttributeValue("hoverX") || emptyArray

  const [from, to, total, ids] = useMemo(() => {
    const index = chart.getClosestRow(x)
    const dimensionIds = chart.onHoverSortDimensions(index, "valueDesc")

    const rowIndex = dimensionIds.findIndex(id => id === row)

    const total = dimensionIds.length
    const from = getFrom(total, rowIndex)
    const to = getTo(total, rowIndex)
    const ids = dimensionIds.slice(from, to)

    return [from, to, total, ids]
  }, [chart, row, x])

  return (
    <Container data-testid="chartTooltip-dimensions">
      <Flex column>
        {x && <Timestamp value={x} />}
        <UpdateEvery />
      </Flex>
      {from > 0 && <TextNano color="textLite">↑{from} more values</TextNano>}
      <Flex gap={1} column margin={[2, 0, 0]}>
        {ids.map(id => (
          <Dimension key={id} id={id} strong={row === id} />
        ))}
      </Flex>
      {to < total && (
        <TextNano color="textLite" margin={[2, 0, 0]}>
          ↓{total - to} more values
        </TextNano>
      )}
    </Container>
  )
}

export default memo(Dimensions)
