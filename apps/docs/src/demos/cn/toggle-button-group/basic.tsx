// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Bold, Italic, Strikethrough, Underline } from "@gravity-ui/icons";
import { ToggleButton, ToggleButtonGroup } from "@lenso/ui";
export function Basic() {
  return (
    <ToggleButtonGroup multiple aria-label="Text formatting">
      <ToggleButton isIconOnly aria-label="粗体" value="bold">
        <Bold aria-hidden="true" />
      </ToggleButton>
      <ToggleButton isIconOnly aria-label="斜体" value="italic">
        <ToggleButtonGroup.Separator />
        <Italic aria-hidden="true" />
      </ToggleButton>
      <ToggleButton isIconOnly aria-label="下划线" value="underline">
        <ToggleButtonGroup.Separator />
        <Underline aria-hidden="true" />
      </ToggleButton>
      <ToggleButton isIconOnly aria-label="删除线" value="strikethrough">
        <ToggleButtonGroup.Separator />
        <Strikethrough aria-hidden="true" />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
