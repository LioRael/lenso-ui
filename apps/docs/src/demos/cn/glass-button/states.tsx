"use client";
import { GlassButton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const s = stylex.create({
  row: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 },
});
export function States() {
  return (
    <div {...stylex.props(s.row)}>
      <GlassButton disabled>Done</GlassButton>
      <GlassButton disabled variant="prominent">
        Done
      </GlassButton>
      <GlassButton isLoading aria-label="Saving">
        Saving…
      </GlassButton>
      <GlassButton
        isIconOnly
        aria-label="Done"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m5 12 4 4L19 5" />
          </svg>
        }
      />
    </div>
  );
}
