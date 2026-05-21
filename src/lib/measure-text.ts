import { getFontFamily } from "@/lib/fonts"
import { WISH_LINE_GAP, LINE_HEIGHT } from "@/lib/polaroid-typography"

let measureCtx: CanvasRenderingContext2D | null = null

function getMeasureCtx(): CanvasRenderingContext2D {
  if (!measureCtx) {
    const canvas = document.createElement("canvas")
    measureCtx = canvas.getContext("2d")!
  }
  return measureCtx
}

export function wrapTextLines(
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFamily: string,
): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  const ctx = getMeasureCtx()
  ctx.font = `${fontSize}px ${fontFamily}`

  const words = trimmed.split(/\s+/)
  const lines: string[] = []
  let current = ""

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width <= maxWidth) {
      current = test
    } else {
      if (current) lines.push(current)
      if (ctx.measureText(word).width <= maxWidth) {
        current = word
      } else {
        let chunk = ""
        for (const char of word) {
          const testChar = chunk + char
          if (ctx.measureText(testChar).width <= maxWidth) {
            chunk = testChar
          } else {
            if (chunk) lines.push(chunk)
            chunk = char
          }
        }
        current = chunk
      }
    }
  }
  if (current) lines.push(current)
  return lines
}

export function measureWrappedTextHeight(
  text: string,
  maxWidth: number,
  fontSize: number,
  fontId: string,
): number {
  const lines = wrapTextLines(text, maxWidth, fontSize, getFontFamily(fontId))
  if (lines.length === 0) return 0
  return Math.ceil(lines.length * fontSize * LINE_HEIGHT)
}

export function measureCaptionBlock(
  width: number,
  line1: string,
  line2: string,
  line1FontId: string,
  line2FontId: string,
  line1FontSize: number,
  line2FontSize: number,
): { captionHeight: number; line1Height: number; line2Height: number } {
  const padding = Math.round(width * 0.06)
  const innerWidth = width - padding * 2
  const fontSize1 = line1FontSize
  const fontSize2 = line2FontSize
  const lineGap = WISH_LINE_GAP

  const line1Height = measureWrappedTextHeight(
    line1,
    innerWidth,
    fontSize1,
    line1FontId,
  )
  const line2Height = measureWrappedTextHeight(
    line2,
    innerWidth,
    fontSize2,
    line2FontId,
  )

  const has1 = line1.trim().length > 0
  const has2 = line2.trim().length > 0
  const minCaption = Math.round(width * 0.08)
  const verticalPad = Math.round(width * 0.04)

  let captionHeight = verticalPad
  if (has1) captionHeight += line1Height
  if (has1 && has2) captionHeight += lineGap
  if (has2) captionHeight += line2Height
  captionHeight += verticalPad

  if (!has1 && !has2) captionHeight = minCaption

  return { captionHeight, line1Height, line2Height }
}

export { LINE_HEIGHT, WISH_LINE_GAP }
