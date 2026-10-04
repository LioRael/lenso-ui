// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6 render-function adaptation (Apache-2.0).
import { UsersList, styles } from "./render-function--users";
export function RenderFunction() {
  return (
    <UsersList
      xstyle={styles.list}
      selectionMode="single"
      render={(props) => <div {...props} data-custom="true" />}
      renderItems
    />
  );
}
