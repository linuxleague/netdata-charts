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
  svg = svg.trim()
  const container = document.createElement("div")

  if (/^\<svg /i.test(svg)) {
    container.innerHTML = svg
    container.firstChild.id = id
    return container.firstChild
  }

  svg = svg.replace(/^<symbol /i, "<svg ").replace(/<\/symbol>$/i, "</svg>")
  container.innerHTML = svg

  const viewbox = container.firstChild.getAttribute("viewBox")
  const xmlns = container.firstChild.getAttribute("xmlns")
  const preserveAspectRatio = container.firstChild.getAttribute("preserveAspectRatio") || ""

  container.innerHTML = `<svg viewbox="${viewbox}" id="${id}" xmlns="${xmlns}" preserveAspectRatio="${preserveAspectRatio}">${container.firstChild.innerHTML}</svg>`

  return container.firstChild
}

const Icon = ({ svg, size = "24px", width = size, height = size, ...rest }) => {
  const rowSvg = svg.content || svg
  const id = useMemo(() => md5(rowSvg), [rowSvg])

  useEffect(() => {
    if (document.getElementById(id)) return

    injectContainer()

    const defs = document.querySelector(`#${iconsContainerId} defs`)

    const element = getElement(rowSvg, id)

    defs.appendChild(element)
  }, [rowSvg])

  return (
    <StyledIcon width={width} height={height} {...rest}>
      <use xlinkHref={`#${id}`} />
    </StyledIcon>
  )
}

export default Icon
