import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, Popover, ThemeScope, Tooltip } from "@lenso/ui";
import "../src/styles/global.css";

export function mount(
  host: HTMLElement,
  theme: "light" | "dark",
  side: "top" | "bottom" | "left" | "right",
  kind: "popover" | "tooltip" = "popover",
) {
  const root = createRoot(host);
  root.render(
    <ThemeScope theme={theme}>
      <main
        style={{
          minHeight: "100vh",
          background:
            theme === "dark"
              ? "repeating-linear-gradient(0deg, #243450 0 12px, #704050 12px 24px)"
              : "repeating-linear-gradient(0deg, #aac4e8 0 12px, #e8b4b4 12px 24px)",
          padding: "240px 400px",
        }}
      >
        {kind === "tooltip" ? (
          <TooltipCase side={side} />
        ) : (
          <Popover>
            <Popover.Trigger render={<Button />}>Open popover</Popover.Trigger>
            <Popover.Content style={{ width: 320 }} side={side}>
              <Popover.Arrow />
              <Popover.Title>Popover Title</Popover.Title>
              <Popover.Description>
                This is the popover content. You can put any content here.
              </Popover.Description>
            </Popover.Content>
          </Popover>
        )}
      </main>
    </ThemeScope>,
  );

  return () => root.unmount();
}

// Keep geometry mounted while zoom moves the trigger; native Escape still closes it.
function TooltipCase({ side }: { side: "top" | "bottom" | "left" | "right" }) {
  const [open, setOpen] = useState(true);
  return (
    <Tooltip
      open={open}
      onOpenChange={(next, details) => {
        if (!next && details.reason === "escape-key") setOpen(false);
      }}
      delay={0}
    >
      <Tooltip.Trigger render={<Button />}>Open tooltip</Tooltip.Trigger>
      <Tooltip.Content delay={0} side={side}>
        <Tooltip.Arrow />
        Helpful description
      </Tooltip.Content>
    </Tooltip>
  );
}
