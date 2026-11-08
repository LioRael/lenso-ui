"use client";

import { Input } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({ field: { width: 256 } });
export function Basic() {
  return <Input aria-label="Name" xstyle={styles.field} placeholder="Enter your name" />;
}
