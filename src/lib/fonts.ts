import "@fontsource/dancing-script/400.css"
import "@fontsource/pacifico/400.css"
import "@fontsource/caveat/400.css"
import "@fontsource/playfair-display/700.css"
import "@fontsource/bebas-neue/400.css"
import "@fontsource/great-vibes/400.css"
import "@fontsource/lobster/400.css"
import "@fontsource/permanent-marker/400.css"
import "@fontsource/jetbrains-mono/400.css"
import "@fontsource/jetbrains-mono/500.css"
import "@fontsource/fira-code/400.css"
import "@fontsource/ibm-plex-mono/400.css"
import "@fontsource/space-mono/400.css"
import "@fontsource/roboto-mono/400.css"
import "@fontsource/dm-mono/400.css"
import "@fontsource/inter/400.css"
import "@fontsource/inter/600.css"
import "@fontsource/dm-sans/400.css"
import "@fontsource/dm-sans/700.css"
import "@fontsource/work-sans/400.css"
import "@fontsource/work-sans/600.css"
import "@fontsource/montserrat/400.css"
import "@fontsource/montserrat/600.css"
import "@fontsource/outfit/400.css"
import "@fontsource/outfit/600.css"
import "@fontsource/space-grotesk/400.css"
import "@fontsource/space-grotesk/600.css"
import "@fontsource/nunito-sans/400.css"
import "@fontsource/nunito-sans/600.css"

export type FontCategory = "script" | "serif" | "sans" | "mono"

export type FontPreset = {
  id: string
  label: string
  family: string
  category: FontCategory
}

export const FONT_CATEGORY_LABELS: Record<FontCategory, string> = {
  script: "Script & display",
  serif: "Serif",
  sans: "Sans-serif",
  mono: "Monospace",
}

export const FONT_PRESETS: FontPreset[] = [
  { id: "great-vibes", label: "Great Vibes", family: "'Great Vibes', cursive", category: "script" },
  { id: "dancing-script", label: "Dancing Script", family: "'Dancing Script', cursive", category: "script" },
  { id: "pacifico", label: "Pacifico", family: "'Pacifico', cursive", category: "script" },
  { id: "caveat", label: "Caveat", family: "'Caveat', cursive", category: "script" },
  { id: "lobster", label: "Lobster", family: "'Lobster', cursive", category: "script" },
  { id: "permanent-marker", label: "Permanent Marker", family: "'Permanent Marker', cursive", category: "script" },
  { id: "bebas-neue", label: "Bebas Neue", family: "'Bebas Neue', sans-serif", category: "script" },
  { id: "playfair", label: "Playfair Display", family: "'Playfair Display', serif", category: "serif" },
  { id: "inter", label: "Inter", family: "'Inter', sans-serif", category: "sans" },
  { id: "dm-sans", label: "DM Sans", family: "'DM Sans', sans-serif", category: "sans" },
  { id: "work-sans", label: "Work Sans", family: "'Work Sans', sans-serif", category: "sans" },
  { id: "montserrat", label: "Montserrat", family: "'Montserrat', sans-serif", category: "sans" },
  { id: "outfit", label: "Outfit", family: "'Outfit', sans-serif", category: "sans" },
  { id: "space-grotesk", label: "Space Grotesk", family: "'Space Grotesk', sans-serif", category: "sans" },
  { id: "nunito-sans", label: "Nunito Sans", family: "'Nunito Sans', sans-serif", category: "sans" },
  { id: "geist", label: "Geist", family: "var(--font-sans)", category: "sans" },
  { id: "jetbrains-mono", label: "JetBrains Mono", family: "'JetBrains Mono', monospace", category: "mono" },
  { id: "fira-code", label: "Fira Code", family: "'Fira Code', monospace", category: "mono" },
  { id: "ibm-plex-mono", label: "IBM Plex Mono", family: "'IBM Plex Mono', monospace", category: "mono" },
  { id: "space-mono", label: "Space Mono", family: "'Space Mono', monospace", category: "mono" },
  { id: "roboto-mono", label: "Roboto Mono", family: "'Roboto Mono', monospace", category: "mono" },
  { id: "dm-mono", label: "DM Mono", family: "'DM Mono', monospace", category: "mono" },
]

const FONT_BY_ID = new Map(FONT_PRESETS.map((f) => [f.id, f]))

export function getFontFamily(id: string): string {
  return FONT_BY_ID.get(id)?.family ?? FONT_PRESETS[0].family
}

export function getFontsByCategory(): { category: FontCategory; label: string; fonts: FontPreset[] }[] {
  const order: FontCategory[] = ["script", "serif", "sans", "mono"]
  return order.map((category) => ({
    category,
    label: FONT_CATEGORY_LABELS[category],
    fonts: FONT_PRESETS.filter((f) => f.category === category),
  }))
}
