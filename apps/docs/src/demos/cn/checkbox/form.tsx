// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Button, Checkbox } from "@lenso/ui";
import type { FormEvent } from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  items: {
    display: "flex",
    flexDirection: "column",
    gap: ".75rem",
  },
  submit: {
    marginTop: "1rem",
  },
});
export function Form() {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    alert(`表单提交数据：
${Array.from(formData.entries())
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n")}`);
  };
  return (
    <form {...stylex.props(styles.form)} onSubmit={handleSubmit}>
      <div {...stylex.props(styles.items)}>
        <Checkbox name="notifications" value="on">
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            启用通知
          </Checkbox.Content>
        </Checkbox>
        <Checkbox defaultChecked name="newsletter" value="on">
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            订阅新闻通讯
          </Checkbox.Content>
        </Checkbox>
        <Checkbox name="marketing" value="on">
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            接收营销更新
          </Checkbox.Content>
        </Checkbox>
      </div>
      <Button xstyle={styles.submit} size="sm" type="submit" variant="primary">
        提交
      </Button>
    </form>
  );
}
