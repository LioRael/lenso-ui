// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { ComboBox } from "@lenso/ui";
import { useId } from "react";
import * as stylex from "@stylexjs/stylex";
import { demoStyles } from "../../demo.stylex";
const animals = ["土豚", "猫", "狗", "袋鼠", "熊猫", "蛇"];
export function Default() {
  const id = useId();
  return (
    <div {...stylex.props(demoStyles.field)}>
      <ComboBox items={animals}>
        <ComboBox.Label htmlFor={id}>Favorite animal</ComboBox.Label>
        <ComboBox.InputGroup>
          <ComboBox.Input id={id} placeholder="搜索动物…" />
          <ComboBox.Trigger aria-label="Show animals">
            <ComboBox.Indicator />
          </ComboBox.Trigger>
        </ComboBox.InputGroup>
        <ComboBox.Portal>
          <ComboBox.Positioner>
            <ComboBox.Popover>
              <ComboBox.List>
                {(animal: string) => (
                  <ComboBox.Item key={animal} value={animal}>
                    {animal}
                    <ComboBox.ItemIndicator />
                  </ComboBox.Item>
                )}
              </ComboBox.List>
            </ComboBox.Popover>
          </ComboBox.Positioner>
        </ComboBox.Portal>
      </ComboBox>
    </div>
  );
}
