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
        弹性动画
      </Switch>
      <Input aria-label="弹性输入框" elastic={elastic} defaultValue="选择或编辑这段文字" />
    </div>
  );
}
