import React, { useEffect, useMemo } from "react"
import md5 from "md5"
import { StyledIcon } from "@netdata/netdata-ui/lib/components/icon/styled"

export { default as Button } from "./button"

const iconsContainerId = "netdata-sdk-svg"

const iconsContainer = `<svg
    id="${iconsContainerId}"
    aria-hidden="true"
    style="position: absolute; width: 0; height: 0; overflow: hidden;"
  >
    <defs />
  </svg>`

const injectContainer = () => {
  if (document.querySelector(`#${iconsContainerId}`)) return

  const container = document.createElement("div")
  container.innerHTML = iconsContainer
  document.body.insertBefore(container.firstChild.cloneNode(true), document.body.firstChild)
}

const getElement = (svg, id) => {
  const container = document.createElement("div")
  container.innerHTML = svg

  if (container.firstChild.tagName === "SVG") {
    container.firstChild.id = id
    return container.firstChild
  }

  const viewbox = container.firstChild.getAttribute("viewBox")
  const xmlns = container.firstChild.getAttribute("xmlns")
  container.innerHTML = `<svg viewbox="${viewbox}" id="${id}" xmlns="${xmlns}">${container.firstChild.innerHTML}</svg>`

  return container.firstChild
}

const Icon = ({ svg, size = "24px", width = size, height = size, ...rest }) => {
  const rowSvg = svg.content || svg
  const id = useMemo(() => md5(rowSvg), [])

  useEffect(() => {
    if (document.getElementById(id)) return

    injectContainer()

    const defs = document.querySelector(`#${iconsContainerId} defs`)

    const element = getElement(rowSvg, id)
    defs.appendChild(element)
  }, [])

  return (
    <StyledIcon width={width} height={height} {...rest}>
      <use xlinkHref={`#${id}`} />
    </StyledIcon>
  )
}

export default Icon