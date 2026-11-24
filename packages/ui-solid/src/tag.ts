import { tagStyles } from "@lenso/tokens/tag";
import { Button as SdkRemoveButton } from "@ui-sdk/solid/button";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const TagRoot = htmlPart<
  "li",
  {
    size?: "sm" | "md" | "lg";
    variant?: "default" | "surface";
    selected?: boolean;
    disabled?: boolean;
  }
>(
  "li",
  "tag",
  (props) => [
    tagStyles.cell,
    tagStyles.root,
    tagStyles[props.size ?? "md"],
    tagStyles[props.variant ?? "default"],
    props.selected && tagStyles.selected,
    props.disabled && tagStyles.disabled,
  ],
  "size",
  "variant",
  "selected",
  "disabled",
);
export const TagRemoveButton: StyledPart<typeof SdkRemoveButton> = sdkPart(
  SdkRemoveButton,
  "tag-remove-button",
  () => tagStyles.removeButton,
);

export const Tag: typeof TagRoot & {
  Root: typeof TagRoot;
  RemoveButton: typeof TagRemoveButton;
} = Object.assign(TagRoot, {
  Root: TagRoot,
  RemoveButton: TagRemoveButton,
});
