// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Checkbox, ErrorMessage, Fieldset } from "@lenso/ui";
import { useId, useState } from "react";
import { demoStyles } from "../../demo.stylex";
const categories = ["新闻", "旅游", "游戏", "购物"];
export function ErrorMessageBasic() {
  const [selected, setSelected] = useState<string[]>([]);
  const errorId = useId();
  const invalid = selected.length === 0;
  return (
    <Fieldset xstyle={demoStyles.wideColumn}>
      <Fieldset.Legend>Required categories</Fieldset.Legend>
      <p>请至少选择一个分类</p>
      {categories.map((category) => (
        <Checkbox
          key={category}
          checked={selected.includes(category)}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
          onCheckedChange={(checked) =>
            setSelected((current) =>
              checked ? [...current, category] : current.filter((value) => value !== category),
            )
          }
        >
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            {category}
          </Checkbox.Content>
        </Checkbox>
      ))}
      {invalid && (
        <ErrorMessage id={errorId} role="alert">
          请至少选择一个分类
        </ErrorMessage>
      )}
    </Fieldset>
  );
}
