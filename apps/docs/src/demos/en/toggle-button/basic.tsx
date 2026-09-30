"use client";

import { Heart } from "@gravity-ui/icons";
import { ToggleButton } from "@lenso/ui";

export function Basic() {
  return (
    <ToggleButton>
      <ToggleButton.Icon>
        <Heart />
      </ToggleButton.Icon>
      Like
    </ToggleButton>
  );
}
