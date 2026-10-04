// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorField } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/color-picker/source.stylex";
export function Invalid() {
  // A Color cannot represent malformed text; keep the source's invalid edit in the input.
  const [invalidText, setInvalidText] = useState("not-a-color");
  return (
    <div {...stylex.props(styles.column)}>
      <ColorField isInvalid isRequired xstyle={styles.width280} name="color">
        <ColorField.Label>颜色</ColorField.Label>
        <ColorField.Group>
          <ColorField.Input placeholder="#000000" />
        </ColorField.Group>
        <ColorField.Error>请输入有效的十六进制颜色</ColorField.Error>
      </ColorField>
      <ColorField isInvalid xstyle={styles.width280} name="invalid-color">
        <ColorField.Label>背景色</ColorField.Label>
        <ColorField.Group>
          <ColorField.Input
            value={invalidText}
            onChange={(event) => setInvalidText(event.target.value)}
          />
        </ColorField.Group>
        <ColorField.Error>颜色格式无效，请使用十六进制（例如 #FF5733）</ColorField.Error>
      </ColorField>
    </div>
  );
}
