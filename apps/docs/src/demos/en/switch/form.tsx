"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Button, Switch, SwitchGroup } from "@lenso/ui";
import type { FormEvent } from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  submit: { marginTop: "1rem" },
});
export function Form() {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    alert(
      `Form submitted with:\n${Array.from(formData.entries())
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n")}`,
    );
  };
  return (
    <form {...stylex.props(styles.form)} onSubmit={handleSubmit}>
      <SwitchGroup>
        <Switch name="notifications" value="on">
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            Enable notifications
          </Switch.Content>
        </Switch>
        <Switch defaultChecked name="newsletter" value="on">
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            Subscribe to newsletter
          </Switch.Content>
        </Switch>
        <Switch name="marketing" value="on">
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            Receive marketing updates
          </Switch.Content>
        </Switch>
      </SwitchGroup>
      <Button xstyle={styles.submit} size="sm" type="submit" variant="primary">
        Submit
      </Button>
    </form>
  );
}
