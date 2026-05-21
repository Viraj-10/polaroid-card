export type TextColorPreset = {
  id: string
  label: string
  value: string
}

export const TEXT_COLOR_PRESETS: TextColorPreset[] = [
  { id: "black", label: "Black", value: "#1a1a1a" },
  { id: "charcoal", label: "Charcoal", value: "#3d3d3d" },
  { id: "white", label: "White", value: "#ffffff" },
  { id: "rose", label: "Rose", value: "#be123c" },
  { id: "coral", label: "Coral", value: "#c45c26" },
  { id: "gold", label: "Gold", value: "#b8860b" },
  { id: "forest", label: "Forest", value: "#166534" },
  { id: "ocean", label: "Ocean", value: "#1d4ed8" },
  { id: "violet", label: "Violet", value: "#6d28d9" },
  { id: "blush", label: "Blush", value: "#db2777" },
]
