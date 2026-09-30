// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Radio, RadioGroup } from "@lenso/ui";
import { useId } from "react";
import * as stylex from "@stylexjs/stylex";
import { demoStyles } from "../../demo.stylex";
const plans = [
  {
    value: "basic",
    label: "基础版",
    description: "每月包含 100 条消息",
  },
  {
    value: "premium",
    label: "高级版",
    description: "每月包含 200 条消息",
  },
  {
    value: "business",
    label: "商业版",
    description: "无限消息",
  },
];
export function Basic() {
  const id = useId();
  return (
    <div {...stylex.props(demoStyles.wideColumn)}>
      <strong id={`${id}-label`}>选择套餐</strong>
      <p {...stylex.props(demoStyles.muted)}>选择最适合你的套餐</p>
      <RadioGroup defaultValue="premium" name="plan" aria-labelledby={`${id}-label`}>
        {plans.map((plan) => (
          <Radio
            key={plan.value}
            value={plan.value}
            aria-label={plan.label}
            aria-describedby={`${id}-${plan.value}`}
          >
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              {plan.label}
            </Radio.Content>
            <span id={`${id}-${plan.value}`} {...stylex.props(demoStyles.muted)}>
              {plan.description}
            </span>
          </Radio>
        ))}
      </RadioGroup>
    </div>
  );
}
