// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Chip } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
export function CustomStyles() {
  return (
    <div {...stylex.props(s.wrap2)}>
      <Chip xstyle={s.chipDraft}>草稿</Chip>
      <Chip xstyle={s.chipReview}>审核中</Chip>
      <Chip xstyle={s.chipPublished}>已发布</Chip>
    </div>
  );
}
