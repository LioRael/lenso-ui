"use client";
/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import { Form } from "@base-ui/react/form";
import * as stylex from "@stylexjs/stylex";
import { countrySections, exampleStyles, SelectExample, states } from "./select-example";
export function OnSurface() {
  return (
    <div {...stylex.props(exampleStyles.surface)}>
      <Form
        {...stylex.props(exampleStyles.stack)}
        onSubmit={(event) => {
          event.preventDefault();
          alert("Form submitted successfully!");
        }}
      >
        <SelectExample
          fluid
          required
          name="state"
          label="State"
          choices={states}
          variant="secondary"
        />
        <SelectExample
          fluid
          required
          name="country"
          label="Country"
          placeholder="Select a country"
          choices={countrySections
            .flatMap((section) => section.items)
            .filter((item) =>
              ["usa", "canada", "mexico", "uk", "france", "germany"].includes(item.value),
            )}
          variant="secondary"
        />
        <button type="submit" {...stylex.props(exampleStyles.action)}>
          Submit
        </button>
      </Form>
    </div>
  );
}
