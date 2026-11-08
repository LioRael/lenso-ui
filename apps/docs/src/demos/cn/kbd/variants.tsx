"use client";

import { Kbd } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
export function Variants() {
  return (
    <div {...stylex.props(s.column4)}>
      {[
        {
          label: "复制：",
          key: "C",
        },
        {
          label: "粘贴：",
          key: "V",
        },
        {
          label: "剪切：",
          key: "X",
        },
      ].map((action) => (
        <div key={action.key} {...stylex.props(s.row2)}>
          <span>{action.label}</span>
          <Kbd>
            <Kbd.Abbr keyValue="command" />
            <Kbd.Content>{action.key}</Kbd.Content>
          </Kbd>
          <Kbd variant="light">
            <Kbd.Abbr keyValue="command" />
            <Kbd.Content>{action.key}</Kbd.Content>
          </Kbd>
        </div>
      ))}
    </div>
  );
}
