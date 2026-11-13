"use client";

import { isValidElement, type ComponentProps, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, Toast } from "@lenso/ui";

export type ToastData = {
  variant?: ComponentProps<typeof Toast.Root>["variant"];
  indicator?: ReactNode;
  actionStyle?: "success" | "warning" | "danger" | "tertiary";
};
const historyEntrance = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(-8px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});
export const styles = stylex.create({
  frame: {
    display: "flex",
    height: "100%",
    maxWidth: 576,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  large: { maxWidth: 672, gap: 24 },
  promise: { maxWidth: 672, gap: 32 },
  buttons: {
    display: "flex",
    width: "100%",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  section: { width: "100%", display: "flex", flexDirection: "column", gap: 12 },
  heading: { fontSize: 14, fontWeight: 500 },
  help: { fontSize: 12, color: "var(--lenso-label-secondary)" },
  center: { textAlign: "center" },
  successText: { color: "var(--lenso-status-success-text)" },
  warningText: { color: "var(--lenso-status-warning-text)" },
  successAction: {
    backgroundColor: "var(--lenso-status-success-indicator)",
    color: "var(--lenso-status-success-on-fill)",
  },
  warningAction: {
    backgroundColor: "var(--lenso-status-warning-indicator)",
    color: "var(--lenso-status-warning-on-fill)",
  },
  dangerAction: {
    backgroundColor: "var(--lenso-status-error-indicator)",
    color: "var(--lenso-status-error-on-fill)",
  },
  tertiaryAction: { backgroundColor: "transparent" },
  placements: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  placementButtons: {
    display: "flex",
    maxWidth: 320,
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  queues: {
    display: "flex",
    height: "100%",
    maxWidth: 896,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  queueButtons: { display: "flex", justifyContent: "center", gap: 8 },
  history: { width: "100%", display: "flex", flexDirection: "column", gap: 8 },
  historyHeading: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  clear: { height: 24, fontSize: 12 },
  historyPanel: {
    minHeight: 120,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--lenso-control-border)",
    backgroundColor: "var(--lenso-background-grouped-secondary)",
    padding: 16,
  },
  empty: { fontSize: 14, color: "var(--lenso-label-secondary)" },
  historyItem: {
    animationName: { default: historyEntrance, "@media (prefers-reduced-motion: reduce)": "none" },
    animationDuration: "200ms",
    animationFillMode: "both",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--lenso-control-border)",
    backgroundColor: "var(--lenso-control-fill)",
    paddingInline: 12,
    paddingBlock: 8,
    fontSize: 14,
  },
  historyDelay: (delay: number) => ({ animationDelay: `${delay}ms` }),
  historyText: { flex: 1 },
  medium: { fontWeight: 500 },
  time: { marginInlineStart: 8, fontSize: 12, color: "var(--lenso-label-secondary)" },
  check: {
    display: "flex",
    width: 20,
    height: 20,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: "color-mix(in oklab, var(--lenso-status-success-indicator) 10%, transparent)",
    color: "var(--lenso-status-success-text)",
  },
  checkIcon: { width: 12, height: 12 },
  customFrame: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
  customRoot: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--lenso-control-border)",
  },
  customRow: { display: "flex", alignItems: "center", gap: 8 },
  customText: { display: "flex", flexDirection: "column", paddingInlineEnd: 24 },
  accent: { color: "var(--lenso-tint-text)" },
  customClose: {
    position: "absolute",
    insetInlineEnd: 8,
    top: "50%",
    transform: "translateY(-50%)",
    borderWidth: 0,
    backgroundColor: "transparent",
    opacity: 1,
    pointerEvents: "auto",
  },
  customCloseIcon: { width: 16, height: 16 },
  styledRoot: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklab, var(--lenso-control-border) 80%, transparent)",
    backgroundColor: "var(--lenso-background-grouped-secondary)",
    boxShadow: "var(--lenso-overlay-shadow)",
  },
  styledRow: { display: "flex", alignItems: "center", gap: 10 },
  styledText: { display: "flex", flexDirection: "column", gap: 2 },
  neutral: { color: "var(--lenso-label-secondary)" },
  styledTitle: { fontSize: 14, fontWeight: 500, color: "var(--lenso-label-primary)" },
  styledDescription: { fontSize: 14, color: "var(--lenso-label-secondary)" },
});

export function Notifications(props: ComponentProps<typeof Toast.Region>) {
  return (
    <Toast.Region {...props}>
      {(item) => {
        const data = item.data && typeof item.data === "object" ? item.data : {};
        const indicator =
          "indicator" in data && isValidElement(data.indicator) ? data.indicator : undefined;
        const variant =
          "variant" in data && (data.variant === "glass" || data.variant === "pill")
            ? data.variant
            : undefined;
        return (
          <Toast variant={variant}>
            <Toast.Indicator>{indicator}</Toast.Indicator>
            <Toast.Content>
              <Toast.Title />
              <Toast.Description />
            </Toast.Content>
            {item.action && <Toast.Action render={<Button size="sm" />} />}
            <Toast.Close aria-label="Close notification" />
          </Toast>
        );
      }}
    </Toast.Region>
  );
}
