// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Surface } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { demoStyles } from "../../demo.stylex";
const styles = stylex.create({
  surface: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    width: 320,
    maxWidth: "100%",
    borderRadius: 24,
    padding: 24,
    boxSizing: "border-box",
  },
});
export function Basic() {
  return (
    <Surface xstyle={styles.surface} variant="default">
      <h3>表面内容</h3>
      <p {...stylex.props(demoStyles.muted)}>
        This is a default surface variant. It uses the surface theme role.
      </p>
    </Surface>
  );
}
