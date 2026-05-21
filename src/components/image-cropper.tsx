import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Check } from "lucide-react"

type ImageCropperProps = {
  imageSrc: string
  onComplete: (croppedSrc: string) => void
  onCancel: () => void
}

type CropRect = { x: number; y: number; width: number; height: number }

type Handle =
  | "nw"
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w"
  | "move"

const MIN_CROP = 48

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function cropImageToDataUrl(
  imageSrc: string,
  crop: CropRect,
  naturalWidth: number,
  naturalHeight: number,
  displayWidth: number,
  displayHeight: number,
): Promise<string> {
  const scaleX = naturalWidth / displayWidth
  const scaleY = naturalHeight / displayHeight

  const sx = Math.round(crop.x * scaleX)
  const sy = Math.round(crop.y * scaleY)
  const sw = Math.round(crop.width * scaleX)
  const sh = Math.round(crop.height * scaleY)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = sw
      canvas.height = sh
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Canvas not supported"))
        return
      }
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
      resolve(canvas.toDataURL("image/png"))
    }
    img.onerror = reject
    img.src = imageSrc
  })
}

export function ImageCropper({
  imageSrc,
  onComplete,
  onCancel,
}: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 })
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 })
  const [crop, setCrop] = useState<CropRect | null>(null)
  const [saving, setSaving] = useState(false)

  const dragRef = useRef<{
    handle: Handle
    startX: number
    startY: number
    startCrop: CropRect
  } | null>(null)

  const updateDisplaySize = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const maxW = container.clientWidth
    const maxH = container.clientHeight
    if (!naturalSize.width || !naturalSize.height) return

    const scale = Math.min(
      maxW / naturalSize.width,
      maxH / naturalSize.height,
      1,
    )
    setDisplaySize({
      width: Math.round(naturalSize.width * scale),
      height: Math.round(naturalSize.height * scale),
    })
  }, [naturalSize])

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.src = imageSrc
  }, [imageSrc])

  useEffect(() => {
    updateDisplaySize()
    window.addEventListener("resize", updateDisplaySize)
    return () => window.removeEventListener("resize", updateDisplaySize)
  }, [updateDisplaySize])

  useEffect(() => {
    if (!displaySize.width || !displaySize.height) return
    const margin = Math.min(displaySize.width, displaySize.height) * 0.08
    setCrop({
      x: margin,
      y: margin,
      width: displaySize.width - margin * 2,
      height: displaySize.height - margin * 2,
    })
  }, [displaySize.width, displaySize.height])

  const applyDrag = useCallback(
    (clientX: number, clientY: number) => {
      const drag = dragRef.current
      if (!drag || !displaySize.width) return

      const dx = clientX - drag.startX
      const dy = clientY - drag.startY
    const maxW = displaySize.width
    const maxH = displaySize.height
    const s = drag.startCrop
    let { x, y, width, height } = s

    const applyBounds = () => {
      width = clamp(width, MIN_CROP, maxW)
      height = clamp(height, MIN_CROP, maxH)
      x = clamp(x, 0, maxW - width)
      y = clamp(y, 0, maxH - height)
    }

    switch (drag.handle) {
      case "move":
        x = s.x + dx
        y = s.y + dy
        applyBounds()
        break
      case "e":
        width = s.width + dx
        applyBounds()
        break
      case "w":
        x = s.x + dx
        width = s.width - dx
        applyBounds()
        break
      case "s":
        height = s.height + dy
        applyBounds()
        break
      case "n":
        y = s.y + dy
        height = s.height - dy
        applyBounds()
        break
      case "se":
        width = s.width + dx
        height = s.height + dy
        applyBounds()
        break
      case "sw":
        x = s.x + dx
        width = s.width - dx
        height = s.height + dy
        applyBounds()
        break
      case "ne":
        y = s.y + dy
        width = s.width + dx
        height = s.height - dy
        applyBounds()
        break
      case "nw":
        x = s.x + dx
        y = s.y + dy
        width = s.width - dx
        height = s.height - dy
        applyBounds()
        break
    }

      setCrop({ x, y, width, height })
    },
    [displaySize.width, displaySize.height],
  )

  useEffect(() => {
    const onMove = (e: PointerEvent) => applyDrag(e.clientX, e.clientY)
    const onUp = () => {
      dragRef.current = null
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
    }
  }, [applyDrag])

  const onPointerDown = (handle: Handle) => (e: React.PointerEvent) => {
    if (!crop) return
    e.preventDefault()
    e.stopPropagation()
    dragRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...crop },
    }
  }

  const handleApply = async () => {
    if (!crop || !displaySize.width) return
    setSaving(true)
    try {
      const result = await cropImageToDataUrl(
        imageSrc,
        crop,
        naturalSize.width,
        naturalSize.height,
        displaySize.width,
        displaySize.height,
      )
      onComplete(result)
    } finally {
      setSaving(false)
    }
  }

  const handleStyle = "absolute size-3.5 rounded-full border-2 border-white bg-primary shadow-md touch-none"

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
      <div
        ref={containerRef}
        className="relative flex flex-1 items-center justify-center overflow-hidden p-4"
      >
        {displaySize.width > 0 && crop && (
          <div
            className="relative select-none"
            style={{ width: displaySize.width, height: displaySize.height }}
          >
            <img
              src={imageSrc}
              alt="Crop"
              className="block size-full pointer-events-none"
              draggable={false}
            />

            <div className="pointer-events-none absolute inset-0">
              <div
                className="absolute bg-black/55"
                style={{ left: 0, top: 0, width: displaySize.width, height: crop.y }}
              />
              <div
                className="absolute bg-black/55"
                style={{
                  left: 0,
                  top: crop.y + crop.height,
                  width: displaySize.width,
                  height: displaySize.height - crop.y - crop.height,
                }}
              />
              <div
                className="absolute bg-black/55"
                style={{ left: 0, top: crop.y, width: crop.x, height: crop.height }}
              />
              <div
                className="absolute bg-black/55"
                style={{
                  left: crop.x + crop.width,
                  top: crop.y,
                  width: displaySize.width - crop.x - crop.width,
                  height: crop.height,
                }}
              />
            </div>

            <div
              className="absolute cursor-move border-2 border-dashed border-white touch-none"
              style={{
                left: crop.x,
                top: crop.y,
                width: crop.width,
                height: crop.height,
              }}
              onPointerDown={onPointerDown("move")}
            >
              {(["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const).map(
                (h) => {
                  const pos: React.CSSProperties = {}
                  if (h.includes("n")) pos.top = -6
                  if (h.includes("s")) pos.bottom = -6
                  if (h.includes("w")) pos.left = -6
                  if (h.includes("e")) pos.right = -6
                  if (h === "n" || h === "s") {
                    pos.left = "50%"
                    pos.transform = "translateX(-50%)"
                  }
                  if (h === "e" || h === "w") {
                    pos.top = "50%"
                    pos.transform = "translateY(-50%)"
                  }
                  const cursor =
                    h === "n" || h === "s"
                      ? "ns-resize"
                      : h === "e" || h === "w"
                        ? "ew-resize"
                        : `${h}-resize`

                  return (
                    <div
                      key={h}
                      role="presentation"
                      className={handleStyle}
                      style={{ ...pos, cursor }}
                      onPointerDown={onPointerDown(h)}
                    />
                  )
                },
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 bg-neutral-950 p-4">
        <p className="text-center text-xs text-white/60">
          Drag the box to move · Drag any corner or edge to resize freely (any
          shape)
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10"
            onClick={onCancel}
          >
            <X className="size-4" />
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleApply}
            disabled={!crop || saving}
          >
            <Check className="size-4" />
            {saving ? "Applying…" : "Apply crop"}
          </Button>
        </div>
      </div>
    </div>
  )
}
