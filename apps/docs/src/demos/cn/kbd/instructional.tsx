"use client";

import { Kbd } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
export function InstructionalText() {
  return (
    <div>
      <div {...stylex.props(s.kbdPanel)}>
        <h4 {...stylex.props(s.kbdHeading)}>快捷操作</h4>
        <ul {...stylex.props(s.textSm)}>
          <li>
            • 打开搜索：{" "}
            <Kbd>
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>K</Kbd.Content>
            </Kbd>
          </li>
          <li {...stylex.props(s.space2)}>
            • 切换侧边栏：{" "}
            <Kbd>
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>B</Kbd.Content>
            </Kbd>
          </li>
          <li {...stylex.props(s.space2)}>
            • 新建文件：{" "}
            <Kbd>
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>N</Kbd.Content>
            </Kbd>
          </li>
          <li {...stylex.props(s.space2)}>
            • 快速保存：{" "}
            <Kbd>
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>S</Kbd.Content>
            </Kbd>
          </li>
        </ul>
      </div>
    </div>
  );
}
