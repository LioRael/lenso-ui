"use client";
// HeroUI v3.2.6 render-function adaptation (Apache-2.0).
import { UsersList, styles } from "./users";
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
