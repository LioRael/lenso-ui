"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  type ComponentProps,
  type HTMLAttributes,
  type ReactElement,
  type SyntheticEvent,
  type KeyboardEvent,
} from "react";
import {
  buttonStyles,
  buttonSizes,
  buttonVariants,
  buttonIconOnlySizes,
} from "@lenso/tokens/button";
import { styledPart, type StyleXProps } from "../../utils/styled.js";
import { ButtonGroupContext } from "../button-group/button-group.js";

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "ghost"
  | "outline"
  | "danger"
  | "danger-soft";
export type ButtonRootProps = StyleXProps<ComponentProps<typeof BaseButton>> & {
  size?: ButtonSize;
  variant?: ButtonVariant;
  isIconOnly?: boolean;
  fullWidth?: boolean;
  isLoading?: boolean;
};
export const ButtonSizeContext = createContext<ButtonSize>("md");
const Root = styledPart(BaseButton, "button", buttonStyles.root);
const Icon = styledPart("span", "button-icon", buttonStyles.icon);

function blockActivation(event: SyntheticEvent) {
  event.preventDefault();
  event.stopPropagation();
}
function guard<E extends SyntheticEvent>(handler?: (event: E) => void, keyboard = false) {
  return (event: E) => {
    if (!keyboard || ["Enter", " "].includes((event as unknown as KeyboardEvent).key)) {
      blockActivation(event);
      return;
    }
    handler?.(event);
  };
}
function protectRender(element: ReactElement) {
  const rendered = element as ReactElement<HTMLAttributes<HTMLElement>>;
  // Base UI runs render-element handlers first, so guarding only the Root is too late.
  return cloneElement(rendered, {
    onClickCapture: guard(rendered.props.onClickCapture),
    onDoubleClickCapture: guard(rendered.props.onDoubleClickCapture),
    onPointerDownCapture: guard(rendered.props.onPointerDownCapture),
    onPointerUpCapture: guard(rendered.props.onPointerUpCapture),
    onKeyDownCapture: guard(rendered.props.onKeyDownCapture, true),
    onKeyUpCapture: guard(rendered.props.onKeyUpCapture, true),
  });
}
export function ButtonRoot({
  disabled: ownDisabled,
  size: ownSize,
  variant: ownVariant,
  fullWidth: ownWidth,
  isIconOnly = false,
  isLoading = false,
  xstyle,
  render,
  onClickCapture,
  onDoubleClickCapture,
  onKeyDownCapture,
  onKeyUpCapture,
  onPointerDownCapture,
  onPointerUpCapture,
  children,
  ...props
}: ButtonRootProps) {
  const group = useContext(ButtonGroupContext);
  const size = ownSize ?? group.size ?? "md";
  const variant = ownVariant ?? group.variant ?? "primary";
  const fullWidth = ownWidth ?? group.fullWidth;
  const protectedRender =
    !isLoading || !render
      ? render
      : typeof render === "function"
        ? (((renderProps, state) => protectRender(render(renderProps, state))) as typeof render)
        : protectRender(render);
  return (
    <ButtonSizeContext value={size}>
      <Root
        {...props}
        disabled={ownDisabled ?? group.disabled}
        render={protectedRender}
        aria-busy={isLoading || undefined}
        data-pending={isLoading || undefined}
        onClickCapture={isLoading ? guard(onClickCapture) : onClickCapture}
        onDoubleClickCapture={isLoading ? guard(onDoubleClickCapture) : onDoubleClickCapture}
        onKeyDownCapture={isLoading ? guard(onKeyDownCapture, true) : onKeyDownCapture}
        onKeyUpCapture={isLoading ? guard(onKeyUpCapture, true) : onKeyUpCapture}
        onPointerDownCapture={isLoading ? guard(onPointerDownCapture) : onPointerDownCapture}
        onPointerUpCapture={isLoading ? guard(onPointerUpCapture) : onPointerUpCapture}
        xstyle={[
          buttonSizes[size],
          buttonVariants[variant],
          isIconOnly && buttonIconOnlySizes[size],
          fullWidth && buttonStyles.fullWidth,
          isLoading && buttonStyles.pending,
          group.orientation &&
            buttonStyles[
              group.orientation === "horizontal" ? "groupedHorizontal" : "groupedVertical"
            ],
          group.orientation &&
            variant === "outline" &&
            buttonStyles[
              group.orientation === "horizontal" ? "outlineHorizontal" : "outlineVertical"
            ],
          xstyle,
        ]}
      >
        {children}
      </Root>
    </ButtonSizeContext>
  );
}
/** Wrap decorative SVGs explicitly; only their viewport size is supplied, never their paths. */
export function ButtonIcon({ children, xstyle, ...props }: ComponentProps<typeof Icon>) {
  const size = useContext(ButtonSizeContext);
  const icon = isValidElement(children)
    ? cloneElement(children as ReactElement<{ width?: string; height?: string }>, {
        width: "100%",
        height: "100%",
      })
    : children;
  return (
    <Icon aria-hidden="true" {...props} xstyle={[size === "sm" && buttonStyles.smallIcon, xstyle]}>
      {icon}
    </Icon>
  );
}
export const Button = Object.assign(ButtonRoot, { Root: ButtonRoot, Icon: ButtonIcon });
