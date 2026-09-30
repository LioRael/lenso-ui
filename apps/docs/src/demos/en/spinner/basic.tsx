"use client";

import { Spinner } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ row: { display: "flex", alignItems: "center", gap: 16 } });

export function SpinnerBasic() {
  return (
    <div {...stylex.props(styles.row)}>
      <Spinner />
    </div>
  );
}
