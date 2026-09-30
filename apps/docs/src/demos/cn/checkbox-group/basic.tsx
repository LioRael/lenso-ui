// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Checkbox, CheckboxGroup } from "@lenso/ui";
import { useId } from "react";
import * as stylex from "@stylexjs/stylex";
import { demoStyles } from "../../demo.stylex";
const interests = [
  {
    value: "coding",
    label: "编程",
    description: "热爱构建软件",
  },
  {
    value: "design",
    label: "设计",
    description: "喜欢打造精美界面",
  },
  {
    value: "writing",
    label: "写作",
    description: "热衷于内容创作",
  },
];
export function Basic() {
  const id = useId();
  return (
    <div {...stylex.props(demoStyles.wideColumn)}>
      <strong id={`${id}-label`}>选择你的兴趣</strong>
      <p {...stylex.props(demoStyles.muted)}>可多选</p>
      <CheckboxGroup aria-labelledby={`${id}-label`}>
        {interests.map((interest) => (
          <Checkbox
            key={interest.value}
            name="interests"
            value={interest.value}
            aria-describedby={`${id}-${interest.value}`}
          >
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              {interest.label}
            </Checkbox.Content>
            <span id={`${id}-${interest.value}`} {...stylex.props(demoStyles.muted)}>
              {interest.description}
            </span>
          </Checkbox>
        ))}
      </CheckboxGroup>
    </div>
  );
}
