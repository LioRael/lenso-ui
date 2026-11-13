export const placements = [
  "bottom",
  "bottom left",
  "bottom right",
  "bottom start",
  "bottom end",
  "top",
  "top left",
  "top right",
  "top start",
  "top end",
  "left",
  "left top",
  "left bottom",
  "start",
  "start top",
  "start bottom",
  "right",
  "right top",
  "right bottom",
  "end",
  "end top",
  "end bottom",
] as const;
export type OverlayPositionArgs = { placement?: (typeof placements)[number]; offset?: number };
export const positionControls = {
  offset: { control: "number" as const },
  placement: { control: "select" as const, options: placements },
};
export function position({ placement = "bottom", offset }: OverlayPositionArgs) {
  const [sideName, alignment] = placement.split(" ");
  const side = sideName as "top" | "bottom" | "left" | "right" | "start" | "end";
  const align =
    alignment === "left" || alignment === "top" || alignment === "start"
      ? "start"
      : alignment === "right" || alignment === "bottom" || alignment === "end"
        ? "end"
        : "center";
  return {
    side,
    align: align as "start" | "center" | "end",
    ...(offset === undefined ? {} : { sideOffset: offset }),
  };
}
