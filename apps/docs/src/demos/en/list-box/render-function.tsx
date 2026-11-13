"use client";
import { UsersList, styles } from "./users";
export function RenderFunction() {
  return (
    <UsersList
      xstyle={styles.list}

      render={(props) => <div {...props} data-custom="true" />}
      renderItems
    />
  );
}
