import { useCallback, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ImageCropper } from "@/components/image-cropper"
import {
  PolaroidPreview,
  usePolaroidLayout,
} from "@/components/polaroid-preview"
import { WishLineControls } from "@/components/wish-line-controls"
import { exportPolaroidPng } from "@/lib/export-polaroid"
import {
  DEFAULT_LINE1_FONT_SIZE,
  DEFAULT_LINE2_FONT_SIZE,
} from "@/lib/polaroid-typography"
import "@/lib/fonts"
import {
  Download,
  ImagePlus,
  Crop,
  RotateCcw,
} from "lucide-react"

const MIN_WIDTH = 280
const MAX_WIDTH = 600
const DEFAULT_WIDTH = 360

function loadImageAspect(src: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img.naturalWidth / img.naturalHeight)
    img.onerror = () => resolve(4 / 5)
    img.src = src
  })
}

export function PolaroidCreator() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imageAspect, setImageAspect] = useState<number | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [cropSource, setCropSource] = useState<string | null>(null)

  const [line1, setLine1] = useState("Happy Birthday!")
  const [line2, setLine2] = useState("Wishing you the best day ever")
  const [line1FontId, setLine1FontId] = useState("great-vibes")
  const [line2FontId, setLine2FontId] = useState("caveat")
  const [line1Color, setLine1Color] = useState("#1a1a1a")
  const [line2Color, setLine2Color] = useState("#c45c26")
  const [line1Align, setLine1Align] = useState<"left" | "center" | "right">(
    "center",
  )
  const [line2Align, setLine2Align] = useState<"left" | "center" | "right">(
    "center",
  )
  const [line1FontSize, setLine1FontSize] = useState(DEFAULT_LINE1_FONT_SIZE)
  const [line2FontSize, setLine2FontSize] = useState(DEFAULT_LINE2_FONT_SIZE)

  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [downloading, setDownloading] = useState(false)

  const layout = usePolaroidLayout(
    width,
    imageAspect,
    line1,
    line2,
    line1FontId,
    line2FontId,
    line1FontSize,
    line2FontSize,
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      setRawImageSrc(src)
      setCropSource(src)
      setShowCropper(true)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleCropComplete = useCallback(async (cropped: string) => {
    setImageSrc(cropped)
    setImageAspect(await loadImageAspect(cropped))
    setShowCropper(false)
    setCropSource(null)
  }, [])

  const handleRecrop = () => {
    const source = rawImageSrc ?? imageSrc
    if (!source) return
    setCropSource(source)
    setShowCropper(true)
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const dataUrl = await exportPolaroidPng({
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
        imageHeight: layout.imageHeight,
        captionHeight: layout.captionHeight,
      })
      const link = document.createElement("a")
      link.download = "polaroid-birthday.png"
      link.href = dataUrl
      link.click()
    } finally {
      setDownloading(false)
    }
  }

  const handleReset = () => {
    setRawImageSrc(null)
    setImageSrc(null)
    setImageAspect(null)
    setLine1("Happy Birthday!")
    setLine2("Wishing you the best day ever")
    setLine1FontId("great-vibes")
    setLine2FontId("caveat")
    setLine1Color("#1a1a1a")
    setLine2Color("#c45c26")
    setLine1Align("center")
    setLine2Align("center")
    setLine1FontSize(DEFAULT_LINE1_FONT_SIZE)
    setLine2FontSize(DEFAULT_LINE2_FONT_SIZE)
    setWidth(DEFAULT_WIDTH)
  }

  return (
    <div className="min-h-svh bg-neutral-100 dark:bg-neutral-950">
      {showCropper && cropSource && (
        <ImageCropper
          imageSrc={cropSource}
          onComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false)
            setCropSource(null)
            if (!imageSrc) setRawImageSrc(null)
          }}
        />
      )}

      <div className="mx-auto flex max-w-6xl flex-col gap-8 p-6 lg:flex-row lg:items-start lg:p-10">
        <section className="flex flex-1 flex-col items-center gap-4 lg:sticky lg:top-10">
          <PolaroidPreview
            width={width}
            imageSrc={imageSrc}
            line1={line1}
            line2={line2}
            line1FontId={line1FontId}
            line2FontId={line2FontId}
            line1Color={line1Color}
            line2Color={line2Color}
            line1Align={line1Align}
            line2Align={line2Align}
            line1FontSize={line1FontSize}
            line2FontSize={line2FontSize}
            imageAspect={imageAspect}
          />
          <p className="text-xs text-muted-foreground">
            {width} × {layout.totalHeight}px · height adjusts to your text
          </p>
        </section>

        <aside className="flex w-full max-w-md flex-col gap-5 lg:max-w-sm">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Polaroid Birthday Card
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload a photo, crop freely, add wishes, then download.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Photo
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="size-4" />
                {imageSrc ? "Change photo" : "Upload photo"}
              </Button>
              {imageSrc && (
                <Button variant="outline" onClick={handleRecrop}>
                  <Crop className="size-4" />
                  Re-crop
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Polaroid width
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {width}px
              </span>
            </div>
            <input
              type="range"
              min={MIN_WIDTH}
              max={MAX_WIDTH}
              step={10}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-primary"
            />
            <p className="text-xs text-muted-foreground">
              Height grows automatically with image and birthday text.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium text-muted-foreground">
              Birthday wishes
            </span>
            <WishLineControls
              label="Line 1 (main wish)"
              value={line1}
              onChange={setLine1}
              fontId={line1FontId}
              onFontChange={setLine1FontId}
              fontSize={line1FontSize}
              onFontSizeChange={setLine1FontSize}
              color={line1Color}
              onColorChange={setLine1Color}
              align={line1Align}
              onAlignChange={setLine1Align}
              placeholder="Happy Birthday!"
            />
            <WishLineControls
              label="Line 2 (subtitle)"
              value={line2}
              onChange={setLine2}
              fontId={line2FontId}
              onFontChange={setLine2FontId}
              fontSize={line2FontSize}
              onFontSizeChange={setLine2FontSize}
              color={line2Color}
              onColorChange={setLine2Color}
              align={line2Align}
              onAlignChange={setLine2Align}
              placeholder="Wishing you all the best"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button className="flex-1" onClick={handleDownload} disabled={downloading}>
              <Download className="size-4" />
              {downloading ? "Saving…" : "Download PNG"}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="size-4" />
              Reset
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
