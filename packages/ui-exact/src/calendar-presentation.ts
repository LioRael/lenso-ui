import { calendarYearPickerStyles as y } from "@lenso/tokens/calendar-year-picker";
// Copyright NextUI Inc. Apache-2.0. Shared calendar recipes retain their original attribution.
import { calendarStyles as s } from "@lenso/tokens/calendar";
import * as stylex from "@stylexjs/stylex";
const native = stylex.create({
  hidden: { display: "none" },
  yearCell: {
    ":is([aria-pressed='false'])": {
      backgroundColor: "transparent",
      color: "var(--lenso-label-primary)",
    },
    ":is([aria-pressed='true'])": {
      backgroundColor: "var(--lenso-tint)",
      color: "var(--lenso-label-on-tint)",
    },
    ":is([aria-pressed='true']):hover": { backgroundColor: "var(--lenso-control-tint-hover-fill)" },
    ":hover:not([aria-pressed='true'])": { backgroundColor: "var(--lenso-control-fill)" },
    ":focus-visible": { outline: "1.5px solid var(--lenso-focus-ring)", outlineOffset: -2 },
  },
  cell: {
    ":disabled": { opacity: 0.5 },
    ":is([aria-pressed='true'])": {
      backgroundColor: "var(--lenso-tint)",
      color: "var(--lenso-label-on-tint)",
    },
  },
  week: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", width: "100%" },
});
export const calendarKinds = [
  "calendar-year-picker-trigger",
  "calendar-year-picker-heading",
  "calendar-year-picker-indicator",
  "calendar-year-picker-grid",
  "calendar-year-picker-cell",
  "calendar",
  "calendar-header",
  "calendar-heading",
  "calendar-nav-button",
  "calendar-nav-icon",
  "calendar-grid",
  "calendar-week",
  "calendar-header-cell",
  "calendar-cell-container",
  "calendar-cell",
  "calendar-day-label",
  "calendar-request",
];
export function calendarPresentation(kind: string, data: DOMStringMap) {
  switch (kind) {
    case "calendar-year-picker-trigger":
      return [y.trigger];
    case "calendar-year-picker-heading":
      return [y.heading];
    case "calendar-year-picker-indicator":
      return [y.indicator, data["lensoOpen"] === "true" && y.openIndicator];
    case "calendar-year-picker-grid":
      return [y.grid, data["lensoOpen"] !== "true" && y.hidden];
    case "calendar-year-picker-cell":
      return [y.cell, native.yearCell, data["lensoSelected"] === "true" && y.selected];
    case "calendar":
      return [s.root];
    case "calendar-header":
      return [s.header];
    case "calendar-heading":
      return [s.heading];
    case "calendar-nav-button":
      return [s.navButton];
    case "calendar-nav-icon":
      return [s.navIcon, data["lensoDirection"] === "rtl" && s.rtlIcon];
    case "calendar-grid":
      return [s.dayGrid];
    case "calendar-week":
      return [native.week];
    case "calendar-header-cell":
      return [s.headerCell];
    case "calendar-cell-container":
      return [s.cellContainer];
    case "calendar-cell":
      return [
        s.cell,
        s.cellButton,
        native.cell,
        data["lensoToday"] === "true" && s.today,
        data["lensoOutside"] === "true" && s.outside,
        data["lensoDisabled"] === "true" && s.disabled,
        data["lensoUnavailable"] === "true" && s.unavailable,
        data["lensoSelected"] === "true" && s.selected,
      ];
    case "calendar-day-label":
      return [];
    case "calendar-request":
      return [native.hidden];
  }
}
