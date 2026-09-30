"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Button } from "@lenso/ui";
import { styles } from "./source.stylex";
export function CustomStyles() {
  return (
    <Button variant="ghost" xstyle={styles.upgrade}>
      Upgrade
    </Button>
  );
}
