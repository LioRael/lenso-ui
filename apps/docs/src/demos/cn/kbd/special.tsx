// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Kbd } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
export function SpecialKeys() {
  return (
    <div>
      <p {...stylex.props(s.textSm)}>
        按{" "}
        <Kbd>
          <Kbd.Abbr keyValue="enter" />
        </Kbd>{" "}
        确认，或按{" "}
        <Kbd>
          <Kbd.Abbr keyValue="escape" />
        </Kbd>{" "}
        取消。
      </p>
      <p {...stylex.props(s.textSm, s.space3)}>
        使用{" "}
        <Kbd>
          <Kbd.Abbr keyValue="tab" />
        </Kbd>{" "}
        在表单字段间切换，使用{" "}
        <Kbd>
          <Kbd.Abbr keyValue="shift" />
          <Kbd.Abbr keyValue="tab" />
        </Kbd>{" "}
        返回上一项。
      </p>
      <p {...stylex.props(s.textSm, s.space3)}>
        按住{" "}
        <Kbd>
          <Kbd.Abbr keyValue="space" />
        </Kbd>{" "}
        可临时启用平移模式。
      </p>
    </div>
  );
}
