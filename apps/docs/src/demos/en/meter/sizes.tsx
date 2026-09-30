"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Meter } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  column: { display: "flex", width: 256, flexDirection: "column", gap: 24 },
});
export function Sizes() {
  return (
    <div {...stylex.props(styles.column)}>
      <Meter color="success" size="sm" value={40}>
        <Meter.Label>Small</Meter.Label>
        <Meter.Output />
        <Meter.Track>
          <Meter.Fill />
        </Meter.Track>
      </Meter>
      <Meter color="accent" size="md" value={60}>
        <Meter.Label>Medium</Meter.Label>
        <Meter.Output />
        <Meter.Track>
          <Meter.Fill />
        </Meter.Track>
      </Meter>
      <Meter color="warning" size="lg" value={80}>
        <Meter.Label>Large</Meter.Label>
        <Meter.Output />
        <Meter.Track>
          <Meter.Fill />
        </Meter.Track>
      </Meter>
    </div>
  );
}
export default Sizes;
