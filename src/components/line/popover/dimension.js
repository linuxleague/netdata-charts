import React from "react"
import Flex from "@netdata/netdata-ui/lib/components/templates/flex"
import Color from "@/components/line/dimensions/color"
import Name from "@/components/line/dimensions/name"
import Value from "@/components/line/dimensions/value"
import { useVisibleDimensionId } from "@/components/provider"

const Dimension = ({ id, strong }) => {
  const visible = useVisibleDimensionId(id)

  return (
    <Flex
      gap={1}
      data-testid="chartPopover-dimension"
      alignItems="center"
      opacity={visible ? null : "weak"}
    >
      <Color id={id} height="12px" />
      <Flex as={Name} flex id={id} margin={[0, "auto"]} strong={strong} />
      <Value id={id} strong={strong} visible={visible} />
    </Flex>
  )
}

export default Dimension