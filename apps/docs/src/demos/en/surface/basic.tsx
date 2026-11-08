"use client";
import { Surface } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";
import { surfaceDemoStyles } from "./surface-demo.stylex";

export function Basic() {
  return (
    <Surface xstyle={surfaceDemoStyles.panel} variant="default">
      <h3 {...stylex.props(s.textBase, s.semibold, s.foreground)}>Surface Content</h3>
      <p {...stylex.props(s.textSm, s.muted)}>
        The default surface shares its grouped background and corners with form sections and lists.
      </p>
    </Surface>
  );
}
