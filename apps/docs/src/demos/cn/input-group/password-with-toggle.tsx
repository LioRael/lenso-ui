"use client";

import { Eye, EyeSlash } from "@gravity-ui/icons";
import { Button, InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
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
export function PasswordWithToggle() {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <TextField xstyle={styles.field} name="password">
      <Label>密码</Label>
      <InputGroup>
        <InputGroup.Input
          xstyle={styles.field}
          type={isVisible ? "text" : "password"}
          value={isVisible ? "87$2h.3diua" : "••••••••"}
          readOnly
        />
        <InputGroup.Suffix xstyle={styles.suffix}>
          <Button
            isIconOnly
            aria-label={isVisible ? "隐藏密码" : "显示密码"}
            size="sm"
            variant="borderless"
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? (
              <Eye aria-hidden="true" {...stylex.props(styles.icon)} />
            ) : (
              <EyeSlash aria-hidden="true" {...stylex.props(styles.icon)} />
            )}
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}
