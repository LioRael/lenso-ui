import { closeButtonStyles } from "@lenso/tokens/close-button";
import { omit } from "solid-js";
import { Button, type ButtonProps } from "./button.jsx";
import { htmlPart } from "./parts.js";

export type CloseButtonProps = Omit<ButtonProps, "size" | "variant" | "isIconOnly" | "fullWidth">;
export const CloseButtonIcon = htmlPart("svg", "close-button-icon", () => closeButtonStyles.icon);

export function CloseButtonRoot(props: CloseButtonProps) {
  return (
    <Button
      aria-label="Close"
      {...omit(props, "xstyle", "children")}
      data-lenso-slot="close-button"
      xstyle={[closeButtonStyles.root, props.xstyle]}
    >
      {props.children ?? (
        <CloseButtonIcon viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="m4 4 8 8M12 4l-8 8"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </CloseButtonIcon>
      )}
    </Button>
  );
}

export const CloseButton = Object.assign(CloseButtonRoot, {
  Root: CloseButtonRoot,
  Icon: CloseButtonIcon,
});
