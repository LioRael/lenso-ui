"use client";

import { Copy } from "@gravity-ui/icons";
import { Button, InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  field: {
    width: "100%",
    maxWidth: 280,
  },
  suffix: {
    paddingInlineEnd: 0,
  },
  icon: {
    width: 16,
    height: 16,
  },
});
export function WithCopySuffix() {
  return (
    <TextField xstyle={styles.field} name="website">
      <Label>网站</Label>
      <InputGroup>
        <InputGroup.Input xstyle={styles.field} defaultValue="example.com" />
        <InputGroup.Suffix xstyle={styles.suffix}>
          <Button isIconOnly aria-label="复制" size="sm" variant="borderless">
            <Copy aria-hidden="true" {...stylex.props(styles.icon)} />
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}
