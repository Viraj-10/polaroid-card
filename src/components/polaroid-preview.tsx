import { useMemo } from "react"
import { getFontFamily } from "@/lib/fonts"
import { measureCaptionBlock, wrapTextLines } from "@/lib/measure-text"
import { WISH_LINE_GAP, LINE_HEIGHT } from "@/lib/polaroid-typography"
import { alignToFlex, type TextAlignment } from "@/lib/text-align"
import { ImageIcon } from "lucide-react"

type PolaroidPreviewProps = {
  width: number
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
}

export function usePolaroidLayout(
  width: number,
  imageAspect: number | null,
  line1: string,
  line2: string,
  line1FontId: string,
  line2FontId: string,
  line1FontSize: number,
  line2FontSize: number,
) {
  return useMemo(() => {
    const padding = Math.round(width * 0.06)
    const innerWidth = width - padding * 2
    const aspect = imageAspect ?? 4 / 5
    const imageHeight = Math.round(innerWidth / aspect)
    const { captionHeight } = measureCaptionBlock(
      width,
      line1,
      line2,
      line1FontId,
      line2FontId,
      line1FontSize,
      line2FontSize,
    )
    const totalHeight = padding + imageHeight + captionHeight + padding

    return { padding, innerWidth, imageHeight, captionHeight, totalHeight }
  }, [
    width,
    imageAspect,
    line1,
    line2,
    line1FontId,
    line2FontId,
    line1FontSize,
    line2FontSize,
  ])
}

function WishLines({
  line1,
  line2,
  line1FontId,
  line2FontId,
  line1Color,
  line2Color,
  line1Align,
  line2Align,
  innerWidth,
  fontSize1,
  fontSize2,
}: {
  line1: string
  line2: string
  line1FontId: string
  line2FontId: string
  line1Color: string
  line2Color: string
  line1Align: TextAlignment
  line2Align: TextAlignment
  innerWidth: number
  fontSize1: number
  fontSize2: number
}) {
  const lineGap = WISH_LINE_GAP
  const line1Lines = wrapTextLines(
    line1,
    innerWidth,
    fontSize1,
    getFontFamily(line1FontId),
  )
  const line2Lines = wrapTextLines(
    line2,
    innerWidth,
    fontSize2,
    getFontFamily(line2FontId),
  )

  return (
    <>
      {line1Lines.length > 0 && (
        <div
          className={`flex w-full flex-col ${alignToFlex(line1Align)}`}
          style={{ gap: Math.round(fontSize1 * (LINE_HEIGHT - 1)) }}
        >
          {line1Lines.map((line, i) => (
            <p
              key={`l1-${i}`}
              className="w-full leading-none wrap-break-word"
              style={{
                fontFamily: getFontFamily(line1FontId),
                fontSize: fontSize1,
                color: line1Color,
                lineHeight: LINE_HEIGHT,
              }}
            >
              {line}
            </p>
          ))}
        </div>
      )}
      {line2Lines.length > 0 && (
        <div
          className={`flex w-full flex-col ${alignToFlex(line2Align)}`}
          style={{
            marginTop: line1Lines.length > 0 ? lineGap : 0,
            gap: Math.round(fontSize2 * (LINE_HEIGHT - 1)),
          }}
        >
          {line2Lines.map((line, i) => (
            <p
              key={`l2-${i}`}
              className="w-full leading-none wrap-break-word"
              style={{
                fontFamily: getFontFamily(line2FontId),
                fontSize: fontSize2,
                color: line2Color,
                lineHeight: LINE_HEIGHT,
              }}
            >
              {line}
            </p>
          ))}
        </div>
      )}
    </>
  )
}

export function PolaroidPreview({
  width,
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
  imageAspect,
}: PolaroidPreviewProps & { imageAspect: number | null }) {
  const { padding, innerWidth, imageHeight, captionHeight, totalHeight } =
    usePolaroidLayout(
      width,
      imageAspect,
      line1,
      line2,
      line1FontId,
      line2FontId,
      line1FontSize,
      line2FontSize,
    )

  return (
    <div
      className="relative shrink-0 transition-[width,height] duration-200"
      style={{ width, height: totalHeight }}
      id="polaroid-preview"
    >
      <div
        className="absolute inset-0 rounded-sm bg-[#faf9f7] shadow-lg"
        style={{
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)",
        }}
      />

      <div
        className="absolute bg-white"
        style={{
          left: padding * 0.5,
          top: padding * 0.5,
          width: width - padding,
          height: totalHeight - padding,
        }}
      />

      <div
        className="absolute overflow-hidden bg-neutral-200"
        style={{
          left: padding,
          top: padding,
          width: innerWidth,
          height: imageHeight,
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Polaroid"
            className="size-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-neutral-400">
            <ImageIcon className="size-10 opacity-50" />
            <span className="text-xs">Add a photo</span>
          </div>
        )}
      </div>

      <div
        className="absolute flex flex-col justify-start overflow-visible"
        style={{
          left: padding,
          top: padding + imageHeight + padding * 0.5,
          width: innerWidth,
          minHeight: captionHeight,
          paddingBottom: padding,
        }}
      >
        <WishLines
          line1={line1}
          line2={line2}
          line1FontId={line1FontId}
          line2FontId={line2FontId}
          line1Color={line1Color}
          line2Color={line2Color}
          line1Align={line1Align}
          line2Align={line2Align}
          innerWidth={innerWidth}
          fontSize1={line1FontSize}
          fontSize2={line2FontSize}
        />
      </div>
    </div>
  )
}
