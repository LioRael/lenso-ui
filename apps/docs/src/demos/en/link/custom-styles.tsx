"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Link } from "@lenso/ui";
import { styles } from "./source.stylex";
export function CustomStyles() {
  return (
    <Link href="#" xstyle={styles.custom}>
      Call to action
      <Link.Icon />
    </Link>
  );
}
