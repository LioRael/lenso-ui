// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Bold, Italic, Strikethrough, Underline } from "@gravity-ui/icons";
import { ToggleButton, ToggleButtonGroup } from "@lenso/ui";
export function Basic() {
  return (
    <ToggleButtonGroup multiple aria-label="Text formatting">
      <ToggleButton isIconOnly aria-label="粗体" value="bold">
        <ToggleButton.Icon>
          <Bold />
        </ToggleButton.Icon>
      </ToggleButton>
      <ToggleButton isIconOnly aria-label="斜体" value="italic">
        <ToggleButtonGroup.Separator />
        <ToggleButton.Icon>
          <Italic />
        </ToggleButton.Icon>
      </ToggleButton>
      <ToggleButton isIconOnly aria-label="下划线" value="underline">
        <ToggleButtonGroup.Separator />
        <ToggleButton.Icon>
          <Underline />
        </ToggleButton.Icon>
      </ToggleButton>
      <ToggleButton isIconOnly aria-label="删除线" value="strikethrough">
        <ToggleButtonGroup.Separator />
        <ToggleButton.Icon>
          <Strikethrough />
        </ToggleButton.Icon>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
