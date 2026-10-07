"use client";

// Adapted from HeroUI v3.2.6 toast examples, Apache-2.0.
import type { ComponentProps, ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, Toast } from "@lenso/ui";

export type ToastData = {
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
  help: { fontSize: 12, color: "var(--muted)" },
  center: { textAlign: "center" },
  successText: { color: "var(--success-soft-foreground)" },
  warningText: { color: "var(--warning-soft-foreground)" },
  successAction: { backgroundColor: "var(--success)", color: "var(--success-foreground)" },
  warningAction: { backgroundColor: "var(--warning)", color: "var(--warning-foreground)" },
  dangerAction: { backgroundColor: "var(--danger)", color: "var(--danger-foreground)" },
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
    borderColor: "var(--border)",
    backgroundColor: "var(--surface)",
    padding: 16,
  },
  empty: { fontSize: 14, color: "var(--muted)" },
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
    borderColor: "var(--border)",
    backgroundColor: "var(--default)",
    paddingInline: 12,
    paddingBlock: 8,
    fontSize: 14,
  },
  historyDelay: (delay: number) => ({ animationDelay: `${delay}ms` }),
  historyText: { flex: 1 },
  medium: { fontWeight: 500 },
  time: { marginInlineStart: 8, fontSize: 12, color: "var(--muted)" },
  check: {
    display: "flex",
    width: 20,
    height: 20,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: "color-mix(in oklab, var(--success) 10%, transparent)",
    color: "var(--success-soft-foreground)",
  },
  checkIcon: { width: 12, height: 12 },
  customFrame: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
  customRoot: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--border)",
  },
  customRow: { display: "flex", alignItems: "center", gap: 8 },
  customText: { display: "flex", flexDirection: "column", paddingInlineEnd: 24 },
  accent: { color: "var(--accent-soft-foreground)" },
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
    borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
    backgroundColor: "var(--surface)",
    boxShadow:
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1), 0 0 0 1px light-dark(rgb(0 0 0 / 0.05), rgb(255 255 255 / 0.1))",
  },
  styledRow: { display: "flex", alignItems: "center", gap: 10 },
  styledText: { display: "flex", flexDirection: "column", gap: 2 },
  neutral: { color: "light-dark(#525252, #a3a3a3)" },
  styledTitle: { fontSize: 14, fontWeight: 500, color: "light-dark(#171717, #fafafa)" },
  styledDescription: { fontSize: 14, color: "light-dark(#525252, #a3a3a3)" },
});

export function Notifications({
  placement = "bottom",
  expanded = false,
  ...props
}: ComponentProps<typeof Toast.Viewport> & { expanded?: boolean }) {
  const { toasts } = Toast.useToastManager<ToastData>();
  return (
    <Toast.Portal>
      <Toast.Viewport placement={placement} alwaysExpanded={expanded} {...props}>
        {toasts.map((item) => (
          <Toast key={item.id} toast={item}>
            <Toast.Indicator>{item.data?.indicator}</Toast.Indicator>
            <Toast.Content>
              <Toast.Title />
              <Toast.Description />
            </Toast.Content>
            {item.actionProps && (
              <Toast.Action
                {...item.actionProps}
                render={
                  <Button
                    size="sm"
                    variant={
                      item.data?.actionStyle === "danger"
                        ? "danger"
                        : item.data?.actionStyle === "tertiary"
                          ? "tertiary"
                          : "primary"
                    }
                  />
                }
                xstyle={
                  item.data?.actionStyle ? styles[`${item.data.actionStyle}Action`] : undefined
                }
              />
            )}
            <Toast.Close aria-label="Close notification" />
          </Toast>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  );
}
