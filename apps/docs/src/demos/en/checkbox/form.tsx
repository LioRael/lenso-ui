"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Button, Checkbox } from "@lenso/ui";
import type { FormEvent } from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  items: { display: "flex", flexDirection: "column", gap: ".75rem" },
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
      <div {...stylex.props(styles.items)}>
        <Checkbox name="notifications" value="on">
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            Enable notifications
          </Checkbox.Content>
        </Checkbox>
        <Checkbox defaultChecked name="newsletter" value="on">
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            Subscribe to newsletter
          </Checkbox.Content>
        </Checkbox>
        <Checkbox name="marketing" value="on">
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            Receive marketing updates
          </Checkbox.Content>
        </Checkbox>
      </div>
      <Button xstyle={styles.submit} size="sm" type="submit" variant="primary">
        Submit
      </Button>
    </form>
  );
}
