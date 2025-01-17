import React from "react"
import plugins from "@netdata/netdata-ui/lib/components/icon/assets/plugins.svg"
import { TextSmall } from "@netdata/netdata-ui/lib/components/typography"
import Flex from "@netdata/netdata-ui/lib/components/templates/flex"
import Icon from "@/components/icon"
import { useAttributeValue } from "@/components/provider"
import Row from "./row"

const Info = ({ title, children }) => (
  <Flex gap={2}>
    <TextSmall color="textDescription">{title}</TextSmall>
    <Flex as={TextSmall} background="elementBackground">
      {children}
    </Flex>
  </Flex>
)

const Context = () => {
  const contextScope = useAttributeValue("contextScope")

  return (
    <Row
      icon={<Icon svg={plugins} color="key" />}
      title="Plugin and chart context"
      color="key"
      data-testid="cartDetails-context"
    >
      <Info title="Context">{contextScope.join(", ")}</Info>
    </Row>
  )
}

export default Context
