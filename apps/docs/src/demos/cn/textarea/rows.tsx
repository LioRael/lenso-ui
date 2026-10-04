// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Label, TextArea } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    display: "flex",
    width: 384,
    flexDirection: "column",
    gap: 16,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  resize: {
    resize: "vertical",
  },
});
export function Rows() {
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.field)}>
        <Label htmlFor="textarea-rows-3">简短反馈</Label>
        <TextArea aria-label="简短反馈" id="textarea-rows-3" placeholder="本周亮点…" rows={3} />
      </div>
      <div {...stylex.props(styles.field)}>
        <Label htmlFor="textarea-rows-6">详细笔记</Label>
        <TextArea
          aria-label="详细笔记"
          id="textarea-rows-6"
          placeholder="写下完整的会议记录…"
          rows={6}
          xstyle={styles.resize}
        />
      </div>
    </div>
  );
}
