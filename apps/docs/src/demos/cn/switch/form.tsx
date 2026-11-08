"use client";

import { Button, Switch } from "@lenso/ui";
import type { FormEvent } from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  submit: {
    marginTop: "1rem",
  },
});
export function Form() {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    alert(`表单提交内容：
${Array.from(formData.entries())
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n")}`);
  };
  return (
    <form {...stylex.props(styles.form)} onSubmit={handleSubmit}>
      <fieldset {...stylex.props(switchGrouping.root)} aria-label="Notification preferences">
        <Switch name="notifications" value="on">
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            启用通知
          </Switch.Content>
        </Switch>
        <Switch defaultChecked name="newsletter" value="on">
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            订阅新闻简报
          </Switch.Content>
        </Switch>
        <Switch name="marketing" value="on">
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            接收营销更新
          </Switch.Content>
        </Switch>
      </fieldset>
      <Button xstyle={styles.submit} size="sm" type="submit" variant="prominent">
        Submit
      </Button>
    </form>
  );
}

const switchGrouping = stylex.create({
  root: {
    borderWidth: 0,
    padding: 0,
    margin: 0,
    minWidth: 0,
    display: "flex",
    gap: 12,
    flexDirection: "column",
  },
});
