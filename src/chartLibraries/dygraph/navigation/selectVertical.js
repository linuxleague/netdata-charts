import Dygraph from "dygraphs"
import { dragGetY_ } from "dygraphs/src/dygraph-utils"

export default chartUI => {
  let startY
  let endY

  const mousedown = (event, g, context) => {
    chartUI.sdk.trigger("highlightVerticalStart", chartUI.chart)
    context.initializeMouseDown(event, g, context)
    Dygraph.startZoom(event, g, context)
    startY = context.dragStartY
    endY = -1

    chartUI.on("mousemove", mousemove).on("mouseup", mouseup)
  }

  const mousemove = (event, g, context) => {
    if (!context.isZooming) return

    const { canvas_ctx_: ctx, canvas_: canvas } = g
    const rect = canvas.getBoundingClientRect()

    if (event.pageY < rect.top || event.pageY > rect.bottom) return

    context.zoomMoved = true
    context.dragEndY = dragGetY_(event, context)

    const { dragStartY, dragEndY } = context

    const area = g.getArea()

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "rgba(128,128,128,0.3)"
    ctx.fillRect(area.x, Math.min(dragStartY, dragEndY), area.w, Math.abs(dragEndY - dragStartY))

    context.prevEndY = dragEndY
    endY = dragEndY
  }

  const mouseup = (event, g, context) => {
    if (context.isZooming) {
      g.clearZoomRect_()

      context.destroy()

      const range =
        endY === -1 || Math.abs(startY - endY) < 5
          ? null
          : [g.toDataYCoord(startY), g.toDataYCoord(endY)].sort((a, b) => a - b)

      chartUI.sdk.trigger("highlightVerticalEnd", chartUI.chart, range)
    }

    chartUI.off("mousemove", mousemove)
    chartUI.off("mouseup", mouseup)
  }

  return chartUI.on("mousedown", mousedown)
}
