"use client";

import { Input, Switch } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  stack: { display: "flex", flexDirection: "column", gap: 24, width: 280, maxWidth: "100%" },
});

export function Elastic() {
  const [elastic, setElastic] = useState(true);
  return (
    <div {...stylex.props(styles.stack)}>
      <Switch checked={elastic} onCheckedChange={setElastic}>
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Content>
        Elastic motion
      </Switch>
      <Input aria-label="Elastic input" elastic={elastic} defaultValue="Select or edit this text" />
    </div>
  );
}
