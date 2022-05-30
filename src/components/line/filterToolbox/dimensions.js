import React, { useMemo } from "react"
import Menu from "@netdata/netdata-ui/lib/components/drops/menu"
import { ItemContainer } from "@netdata/netdata-ui/lib/components/drops/menu/dropdownItem"
import { Text } from "@netdata/netdata-ui/lib/components/typography"
import checkmark from "@netdata/netdata-ui/lib/components/icon/assets/checkmark_s.svg"
import { Checkbox } from "@netdata/netdata-ui/lib/components/checkbox"
import { useChart, useAttributeValue, useMetadata } from "@/components/provider"
import Icon from "@/components/icon"
import Label from "./label"

const getItems = dimensions => ["all", ...Object.keys(dimensions)].map(value => ({ value }))

const getLabel = value => {
  if (value.length === 0) return `All dimensions`
  if (value.length === 1) return value[0]
  return `${value.length} dimensions`
}

const CheckboxIcon = props => {
  return <Icon svg={checkmark} {...props} />
}

const iconProps = { as: CheckboxIcon }

const Item = ({ item: { value }, value: selectedValues, onItemClick }) => {
  const isAll = value === "all"
  const checked = selectedValues.includes(value) || (isAll && selectedValues.length === 0)

  return (
    <ItemContainer gap={2}>
      <Checkbox
        iconProps={iconProps}
        checked={checked}
        onChange={() => onItemClick(value)}
        label={<Text>{isAll ? "All dimensions" : value}</Text>}
      />
    </ItemContainer>
  )
}

const renderItem = props => {
  const key = props.item.value || props.item.label
  return <Item key={key} {...props} />
}

const tooltipProps = {
  heading: "Dimensions",
  body:
    "Select one, multiple or all dimensions. A dimension is any value, either raw data or the result of a calculation that Netdata visualizes on a chart.",
}

const Dimensions = ({ labelProps, ...rest }) => {
  const chart = useChart()

  const value = useAttributeValue("dimensions")
  const { dimensions } = useMetadata()

  const options = useMemo(() => getItems(dimensions), [value, dimensions])

  const label = getLabel(value)

  return (
    <Menu
      value={value}
      onChange={chart.updateDimensionsAttribute}
      items={options}
      renderItem={renderItem}
      closeOnClick={false}
      data-track={chart.track("dimensions")}
      dropProps={{
        height: { max: "460px" },
        width: { max: "360px" },
        overflow: { vertical: "auto" },
      }}
      {...rest}
    >
      <Label
        secondaryLabel="of"
        label={label}
        title={tooltipProps.heading}
        tooltipProps={tooltipProps}
        {...labelProps}
      />
    </Menu>
  )
}

export default Dimensions
