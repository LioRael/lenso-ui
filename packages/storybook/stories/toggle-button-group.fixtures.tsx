// Shared formatting/alignment anatomy from HeroUI v3.2.6 source stories, Apache-2.0.
import type { ComponentProps } from "react";
import { ToggleButton, ToggleButtonGroup } from "@lenso/ui";
import { ActionIcon } from "./actions-icons.fixtures";

type Props = ComponentProps<typeof ToggleButtonGroup>;
export function FormattingGroup({
  count = 4,
  separators = true,
  disabledItalic = false,
  ...props
}: Props & { count?: 3 | 4; separators?: boolean; disabledItalic?: boolean }) {
  return (
    <ToggleButtonGroup {...props}>
      <ToggleButton isIconOnly aria-label="Bold" value="bold">
        <ActionIcon icon="gravity-ui:bold" />
      </ToggleButton>
      <ToggleButton isIconOnly aria-label="Italic" value="italic" disabled={disabledItalic}>
        {separators && <ToggleButtonGroup.Separator />}
        <ActionIcon icon="gravity-ui:italic" />
      </ToggleButton>
      <ToggleButton isIconOnly aria-label="Underline" value="underline">
        {separators && <ToggleButtonGroup.Separator />}
        <ActionIcon icon="gravity-ui:underline" />
      </ToggleButton>
      {count === 4 && (
        <ToggleButton isIconOnly aria-label="Strikethrough" value="strikethrough">
          {separators && <ToggleButtonGroup.Separator />}
          <ActionIcon icon="gravity-ui:strikethrough" />
        </ToggleButton>
      )}
    </ToggleButtonGroup>
  );
}
export function AlignmentGroup({ iconOnly = false, ...props }: Props & { iconOnly?: boolean }) {
  return (
    <ToggleButtonGroup {...props}>
      <ToggleButton
        isIconOnly={iconOnly}
        aria-label={iconOnly ? "Align left" : undefined}
        value="left"
      >
        <ActionIcon icon="gravity-ui:text-align-left" />
        {!iconOnly && "Left"}
      </ToggleButton>
      <ToggleButton
        isIconOnly={iconOnly}
        aria-label={iconOnly ? "Align center" : undefined}
        value="center"
      >
        <ToggleButtonGroup.Separator />
        <ActionIcon icon="gravity-ui:text-align-center" />
        {!iconOnly && "Center"}
      </ToggleButton>
      <ToggleButton
        isIconOnly={iconOnly}
        aria-label={iconOnly ? "Align right" : undefined}
        value="right"
      >
        <ToggleButtonGroup.Separator />
        <ActionIcon icon="gravity-ui:text-align-right" />
        {!iconOnly && "Right"}
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
