// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { ProgressCircle } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "flex-end",
    gap: 24,
  },
});
export function CustomSvg() {
  return (
    <div {...stylex.props(styles.row)}>
      <ProgressCircle aria-label="细圆环" value={60}>
        <ProgressCircle.Track strokeWidth={2} viewBox="0 0 36 36">
          <ProgressCircle.TrackCircle cx={18} cy={18} r={17} strokeWidth={2} />
          <ProgressCircle.FillCircle cx={18} cy={18} r={17} strokeWidth={2} />
        </ProgressCircle.Track>
      </ProgressCircle>
      <ProgressCircle aria-label="默认圆环" value={60}>
        <ProgressCircle.Track>
          <ProgressCircle.TrackCircle />
          <ProgressCircle.FillCircle />
        </ProgressCircle.Track>
      </ProgressCircle>
      <ProgressCircle aria-label="粗圆环" value={60}>
        <ProgressCircle.Track strokeWidth={6} viewBox="0 0 36 36">
          <ProgressCircle.TrackCircle cx={18} cy={18} r={15} strokeWidth={6} />
          <ProgressCircle.FillCircle cx={18} cy={18} r={15} strokeWidth={6} />
        </ProgressCircle.Track>
      </ProgressCircle>
    </div>
  );
}
export default CustomSvg;
