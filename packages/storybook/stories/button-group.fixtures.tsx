// Repeated three-button anatomy from HeroUI v3.2.6 source stories, Apache-2.0.
import type { ComponentProps } from "react";
import { Button, ButtonGroup } from "@lenso/ui";

export function ThreeButtons({
  separators = true,
  enabledThird = false,
  ...props
}: ComponentProps<typeof ButtonGroup> & { separators?: boolean; enabledThird?: boolean }) {
  return (
    <ButtonGroup {...props}>
      <Button>First</Button>
      <Button>{separators && <ButtonGroup.Separator />}Second</Button>
      <Button
        disabled={enabledThird ? false : undefined}
        aria-disabled={enabledThird ? false : undefined}
      >
        {separators && <ButtonGroup.Separator />}
        {enabledThird ? "Third (enabled)" : "Third"}
      </Button>
    </ButtonGroup>
  );
}
