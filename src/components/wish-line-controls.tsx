import { getFontsByCategory } from "@/lib/fonts"
import { TEXT_COLOR_PRESETS } from "@/lib/text-colors"
import { TEXT_ALIGNMENTS, type TextAlignment } from "@/lib/text-align"
import {
  MIN_FONT_SIZE,
  MAX_FONT_SIZE,
} from "@/lib/polaroid-typography"
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react"

type WishLineControlsProps = {
  label: string
  value: string
  onChange: (value: string) => void
  fontId: string
  onFontChange: (fontId: string) => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  color: string
  onColorChange: (color: string) => void
  align: TextAlignment
  onAlignChange: (align: TextAlignment) => void
  placeholder: string
}

const alignIcons = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
} as const

export function WishLineControls({
  label,
  value,
  onChange,
  fontId,
  onFontChange,
  fontSize,
  onFontSizeChange,
  color,
  onColorChange,
  align,
  onAlignChange,
  placeholder,
}: WishLineControlsProps) {
  const fontGroups = getFontsByCategory()

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-ring focus-visible:ring-2"
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Font size
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {fontSize}px
          </span>
        </div>
        <input
          type="range"
          min={MIN_FONT_SIZE}
          max={MAX_FONT_SIZE}
          step={1}
          value={fontSize}
          onChange={(e) => onFontSizeChange(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer accent-primary"
        />
        <input
          type="number"
          min={MIN_FONT_SIZE}
          max={MAX_FONT_SIZE}
          value={fontSize}
          onChange={(e) => {
            const n = Number(e.target.value)
            if (!Number.isNaN(n)) {
              onFontSizeChange(
                Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, n)),
              )
            }
          }}
          className="w-full rounded-md border border-input bg-background px-2 py-1.5 font-mono text-sm outline-none ring-ring focus-visible:ring-2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Alignment
        </span>
        <div className="flex gap-1">
          {TEXT_ALIGNMENTS.map(({ id }) => {
            const Icon = alignIcons[id]
            const active = align === id
            return (
              <button
                key={id}
                type="button"
                title={id}
                onClick={() => onAlignChange(id)}
                className={`flex flex-1 items-center justify-center rounded-md border py-1.5 transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-muted"
                }`}
              >
                <Icon className="size-4" />
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Font
        </span>
        <select
          value={fontId}
          onChange={(e) => onFontChange(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none ring-ring focus-visible:ring-2"
        >
          {fontGroups.map((group) => (
            <optgroup key={group.category} label={group.label}>
              {group.fonts.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Color
        </span>
        <div className="flex flex-wrap gap-1.5">
          {TEXT_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              title={preset.label}
              onClick={() => onColorChange(preset.value)}
              className={`size-7 rounded-full border-2 transition-transform hover:scale-110 ${
                color.toLowerCase() === preset.value.toLowerCase()
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: preset.value }}
            />
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-2 py-1.5">
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
          />
          <span className="text-xs text-muted-foreground">Custom</span>
          <span className="ml-auto font-mono text-xs text-muted-foreground">
            {color}
          </span>
        </label>
      </div>
    </div>
  )
}
