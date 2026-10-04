// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import { Form } from "@base-ui/react/form";
import * as stylex from "@stylexjs/stylex";
import {
  countrySections,
  exampleStyles,
  SelectExample,
  states,
} from "./on-surface--select-example";
export function OnSurface() {
  return (
    <div {...stylex.props(exampleStyles.surface)}>
      <Form
        {...stylex.props(exampleStyles.stack)}
        onSubmit={(event) => {
          event.preventDefault();
          alert("表单提交成功！");
        }}
      >
        <SelectExample
          fluid
          required
          name="state"
          label="州"
          choices={states}
          variant="secondary"
        />
        <SelectExample
          fluid
          required
          name="country"
          label="国家"
          placeholder="请选择国家"
          choices={countrySections
            .flatMap((section) => section.items)
            .filter((item) =>
              ["usa", "canada", "mexico", "uk", "france", "germany"].includes(item.value),
            )}
          variant="secondary"
        />
        <button type="submit" {...stylex.props(exampleStyles.action)}>
          提交
        </button>
      </Form>
    </div>
  );
}
