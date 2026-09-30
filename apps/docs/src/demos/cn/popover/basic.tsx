// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 popover-basic (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { Button, Popover } from "@lenso/ui";
const styles = stylex.create({
  popup: {
    maxWidth: 256,
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: "var(--muted)",
  },
});
export function PopoverBasic() {
  return (
    <Popover>
      <Popover.Trigger render={<Button />}>点击我</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Popup xstyle={styles.popup}>
            <Popover.Title>弹出层标题</Popover.Title>
            <Popover.Description xstyle={styles.description}>
              这是弹出层内容，你可以在这里放置任何内容。
            </Popover.Description>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover>
  );
}
