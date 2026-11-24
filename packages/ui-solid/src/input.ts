import { inputStyles } from "@lenso/tokens/input";
import { Input as SdkRoot } from "@ui-sdk/solid/input";
import { type ComponentProps } from "solid-js";
import { sdkPart, type StyledPart } from "./parts.js";

export const InputRoot: StyledPart<
  typeof SdkRoot,
  { variant?: "primary" | "secondary"; fullWidth?: boolean }
> = sdkPart<
  ComponentProps<typeof SdkRoot>,
  { variant?: "primary" | "secondary"; fullWidth?: boolean }
>(
  SdkRoot,
  "input",
  (props) => [
    inputStyles.input,
    props.variant === "secondary" && inputStyles.secondary,
    props.fullWidth && inputStyles.fullWidth,
  ],
  "variant",
  "fullWidth",
);

export const Input: typeof InputRoot & {
  Root: typeof InputRoot;
} = Object.assign(InputRoot, {
  Root: InputRoot,
});
