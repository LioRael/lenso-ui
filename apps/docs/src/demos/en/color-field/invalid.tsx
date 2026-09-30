"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorField } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../color-picker/source.stylex";
export function Invalid() {
  // A Color cannot represent malformed text; keep the source's invalid edit in the input.
  const [invalidText, setInvalidText] = useState("not-a-color");
  return (
    <div {...stylex.props(styles.column)}>
      <ColorField isInvalid isRequired xstyle={styles.width280} name="color">
        <ColorField.Label>Color</ColorField.Label>
        <ColorField.Group>
          <ColorField.Input placeholder="#000000" />
        </ColorField.Group>
        <ColorField.Error>Please enter a valid hex color</ColorField.Error>
      </ColorField>
      <ColorField isInvalid xstyle={styles.width280} name="invalid-color">
        <ColorField.Label>Background Color</ColorField.Label>
        <ColorField.Group>
          <ColorField.Input
            value={invalidText}
            onChange={(event) => setInvalidText(event.target.value)}
          />
        </ColorField.Group>
        <ColorField.Error>Invalid color format. Use hex (e.g., #FF5733)</ColorField.Error>
      </ColorField>
    </div>
  );
}
