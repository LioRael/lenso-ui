"use client";
// Adapted from HeroUI v3.2.6, Apache-2.0.
import { Copy, Globe } from "@gravity-ui/icons";
import { Button, InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  field: { width: "100%", maxWidth: 280 },
  suffix: { paddingInlineEnd: 0 },
  icon: { width: 16, height: 16 },
  muted: { color: "var(--muted)" },
});
export function WithIconPrefixAndCopySuffix() {
  return (
    <TextField xstyle={styles.field} name="website">
      <Label>Website</Label>
      <InputGroup>
        <InputGroup.Prefix>
          <Globe aria-hidden="true" {...stylex.props(styles.icon, styles.muted)} />
        </InputGroup.Prefix>
        <InputGroup.Input xstyle={styles.field} defaultValue="heroui.com" />
        <InputGroup.Suffix xstyle={styles.suffix}>
          <Button isIconOnly aria-label="Copy" size="sm" variant="ghost">
            <Copy aria-hidden="true" {...stylex.props(styles.icon)} />
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}
