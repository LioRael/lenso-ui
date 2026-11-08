"use client";

import { Kbd } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
export function NavigationKeys() {
  return (
    <div {...stylex.props(s.column4)}>
      <div {...stylex.props(s.row2)}>
        <span {...stylex.props(s.textSm, s.muted)}>方向键：</span>
        <div {...stylex.props(s.row2)}>
          <Kbd>
            <Kbd.Abbr keyValue="up" />
          </Kbd>
          <Kbd>
            <Kbd.Abbr keyValue="down" />
          </Kbd>
          <Kbd>
            <Kbd.Abbr keyValue="left" />
          </Kbd>
          <Kbd>
            <Kbd.Abbr keyValue="right" />
          </Kbd>
        </div>
      </div>
      <div {...stylex.props(s.row2)}>
        <span {...stylex.props(s.textSm, s.muted)}>页面导航：</span>
        <div {...stylex.props(s.row2)}>
          <Kbd>
            <Kbd.Abbr keyValue="pageup" />
          </Kbd>
          <Kbd>
            <Kbd.Abbr keyValue="pagedown" />
          </Kbd>
          <Kbd>
            <Kbd.Abbr keyValue="home" />
          </Kbd>
          <Kbd>
            <Kbd.Abbr keyValue="end" />
          </Kbd>
        </div>
      </div>
    </div>
  );
}
