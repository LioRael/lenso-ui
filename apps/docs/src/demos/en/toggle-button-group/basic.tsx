"use client";

import { Bold, Italic, Strikethrough, Underline } from "@gravity-ui/icons";
import { ToggleButton, ToggleButtonGroup } from "@lenso/ui";

export function Basic() {
  return (
    <ToggleButtonGroup multiple aria-label="Text formatting">
      <ToggleButton isIconOnly aria-label="Bold" value="bold">
        <ToggleButton.Icon>
          <Bold />
        </ToggleButton.Icon>
      </ToggleButton>
      <ToggleButton isIconOnly aria-label="Italic" value="italic">
        <ToggleButtonGroup.Separator />
        <ToggleButton.Icon>
          <Italic />
        </ToggleButton.Icon>
      </ToggleButton>
      <ToggleButton isIconOnly aria-label="Underline" value="underline">
        <ToggleButtonGroup.Separator />
        <ToggleButton.Icon>
          <Underline />
        </ToggleButton.Icon>
      </ToggleButton>
      <ToggleButton isIconOnly aria-label="Strikethrough" value="strikethrough">
        <ToggleButtonGroup.Separator />
        <ToggleButton.Icon>
          <Strikethrough />
        </ToggleButton.Icon>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
