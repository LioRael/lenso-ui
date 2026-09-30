"use client";

import { ColorArea } from "@lenso/ui";

export function ColorAreaBasic() {
  return (
    <ColorArea aria-label="Color area" defaultValue="rgb(116, 52, 255)">
      <ColorArea.Thumb />
    </ColorArea>
  );
}
