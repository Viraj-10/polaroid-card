export type TextAlignment = "left" | "center" | "right"

export const TEXT_ALIGNMENTS: { id: TextAlignment; label: string }[] = [
  { id: "left", label: "Left" },
  { id: "center", label: "Center" },
  { id: "right", label: "Right" },
]

export function alignToFlex(align: TextAlignment): string {
  switch (align) {
    case "left":
      return "items-start text-left"
    case "right":
      return "items-end text-right"
    default:
      return "items-center text-center"
  }
}

export function alignToCanvas(align: TextAlignment): CanvasTextAlign {
  switch (align) {
    case "left":
      return "left"
    case "right":
      return "right"
    default:
      return "center"
  }
}

export function alignToCanvasX(
  align: TextAlignment,
  boxX: number,
  boxWidth: number,
): number {
  switch (align) {
    case "left":
      return boxX
    case "right":
      return boxX + boxWidth
    default:
      return boxX + boxWidth / 2
  }
}
