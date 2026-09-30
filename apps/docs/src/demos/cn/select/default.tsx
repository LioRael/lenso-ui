// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Select } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { demoStyles } from "../../demo.stylex";
const states = ["佛罗里达", "特拉华", "加利福尼亚", "德克萨斯", "纽约", "华盛顿"];
export function Default() {
  return (
    <div {...stylex.props(demoStyles.field)}>
      <Select
        items={states.map((value) => ({
          label: value,
          value,
        }))}
      >
        <Select.Label>州</Select.Label>
        <Select.Trigger>
          <Select.Value placeholder="请选择" />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Popover>
              <Select.List>
                {states.map((state) => (
                  <Select.Item key={state} value={state}>
                    <Select.ItemText>{state}</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popover>
          </Select.Positioner>
        </Select.Portal>
      </Select>
    </div>
  );
}
