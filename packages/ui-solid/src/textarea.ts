import { textAreaStyles, textAreaInputStyles } from "@lenso/tokens/textarea";
import { Textarea as SdkRoot } from "@ui-sdk/solid/textarea";
import { type ComponentProps } from "solid-js";
import { sdkPart, type StyledPart } from "./parts.js";

export const TextAreaRoot: StyledPart<
  typeof SdkRoot,
  { variant?: "primary" | "secondary"; fullWidth?: boolean }
> = sdkPart<
  ComponentProps<typeof SdkRoot>,
  { variant?: "primary" | "secondary"; fullWidth?: boolean }
>(
  SdkRoot,
  "textarea",
  (props) => [
    textAreaInputStyles.input,
    textAreaStyles.textarea,
    props.rows === 1 && textAreaStyles.singleLine,
    props.variant === "secondary" && textAreaInputStyles.secondary,
    props.fullWidth && textAreaInputStyles.fullWidth,
  ],
  "variant",
  "fullWidth",
);

export const TextArea: typeof TextAreaRoot & {
  Root: typeof TextAreaRoot;
} = Object.assign(TextAreaRoot, {
  Root: TextAreaRoot,
});
