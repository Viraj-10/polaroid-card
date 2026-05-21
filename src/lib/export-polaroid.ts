import { getFontFamily } from "@/lib/fonts"
import { wrapTextLines, LINE_HEIGHT } from "@/lib/measure-text"
import { WISH_LINE_GAP } from "@/lib/polaroid-typography"
import {
  alignToCanvas,
  alignToCanvasX,
  type TextAlignment,
} from "@/lib/text-align"

/** Minimum export multiplier vs on-screen preview size */
const MIN_EXPORT_SCALE = 2
/** Cap to avoid huge files / memory spikes on very large photos */
const MAX_EXPORT_SCALE = 4

type ExportOptions = {
  imageSrc: string | null
  line1: string
  line2: string
  line1FontId: string
  line2FontId: string
  line1Color: string
  line2Color: string
  line1Align: TextAlignment
  line2Align: TextAlignment
  line1FontSize: number
  line2FontSize: number
  width: number
  imageHeight: number
  captionHeight: number
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  boxX: number,
  boxY: number,
  boxWidth: number,
  fontSize: number,
  fontId: string,
  color: string,
  align: TextAlignment,
) {
  const lines = wrapTextLines(text, boxWidth, fontSize, getFontFamily(fontId))
  if (lines.length === 0) return boxY

  ctx.font = `${fontSize}px ${getFontFamily(fontId)}`
  ctx.fillStyle = color
  ctx.textAlign = alignToCanvas(align)
  ctx.textBaseline = "top"

  const x = alignToCanvasX(align, boxX, boxWidth)
  const lineStep = fontSize * LINE_HEIGHT
  let y = boxY

  for (const line of lines) {
    ctx.fillText(line, x, y)
    y += lineStep
  }
  return y
}

async function resolveExportScale(
  imageSrc: string | null,
  innerWidth: number,
  imageHeight: number,
): Promise<number> {
  if (!imageSrc || innerWidth <= 0 || imageHeight <= 0) {
    return MIN_EXPORT_SCALE
  }

  const img = await loadImage(imageSrc)
  const fromSource = Math.min(
    img.naturalWidth / innerWidth,
    img.naturalHeight / imageHeight,
  )

  if (!Number.isFinite(fromSource) || fromSource <= 0) {
    return MIN_EXPORT_SCALE
  }

  return Math.min(
    MAX_EXPORT_SCALE,
    Math.max(MIN_EXPORT_SCALE, Math.floor(fromSource)),
  )
}

function configureCanvasQuality(ctx: CanvasRenderingContext2D) {
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"
}

export async function exportPolaroidPng(
  options: ExportOptions,
): Promise<string> {
  const {
    imageSrc,
    line1,
    line2,
    line1FontId,
    line2FontId,
    line1Color,
    line2Color,
    line1Align,
    line2Align,
    line1FontSize,
    line2FontSize,
    width,
    imageHeight,
    captionHeight,
  } = options

  const padding = Math.round(width * 0.06)
  const innerWidth = width - padding * 2
  const height = padding + imageHeight + captionHeight + padding
  const scale = await resolveExportScale(imageSrc, innerWidth, imageHeight)

  const canvas = document.createElement("canvas")
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas not supported")

  configureCanvasQuality(ctx)
  ctx.scale(scale, scale)

  ctx.fillStyle = "#faf9f7"
  ctx.fillRect(0, 0, width, height)

  ctx.shadowColor = "rgba(0,0,0,0.12)"
  ctx.shadowBlur = Math.round(width * 0.04)
  ctx.shadowOffsetY = Math.round(width * 0.02)

  const frameX = padding * 0.5
  const frameY = padding * 0.5
  const frameW = width - padding
  const frameH = height - padding
  ctx.fillStyle = "#ffffff"
  roundRect(ctx, frameX, frameY, frameW, frameH, 4)
  ctx.fill()
  ctx.shadowColor = "transparent"

  const imgX = padding
  const imgY = padding
  if (imageSrc) {
    const img = await loadImage(imageSrc)
    ctx.save()
    roundRect(ctx, imgX, imgY, innerWidth, imageHeight, 2)
    ctx.clip()
    configureCanvasQuality(ctx)
    ctx.drawImage(img, imgX, imgY, innerWidth, imageHeight)
    ctx.restore()
  } else {
    ctx.fillStyle = "#e8e6e3"
    roundRect(ctx, imgX, imgY, innerWidth, imageHeight, 2)
    ctx.fill()
  }

  const captionY = imgY + imageHeight + padding * 0.5
  const fontSize1 = line1FontSize
  const fontSize2 = line2FontSize
  const lineGap = WISH_LINE_GAP

  let textY = captionY
  if (line1.trim()) {
    textY = drawWrappedText(
      ctx,
      line1,
      imgX,
      textY,
      innerWidth,
      fontSize1,
      line1FontId,
      line1Color,
      line1Align,
    )
  }
  if (line2.trim()) {
    if (line1.trim()) textY += lineGap
    drawWrappedText(
      ctx,
      line2,
      imgX,
      textY,
      innerWidth,
      fontSize2,
      line2FontId,
      line2Color,
      line2Align,
    )
  }

  return canvas.toDataURL("image/png")
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
