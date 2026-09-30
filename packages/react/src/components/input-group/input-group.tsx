"use client";
// HeroUI v3.2.6, Apache-2.0.
import { Input as BaseInput } from "@base-ui/react/input";
import { inputGroupStyles } from "@lenso/tokens/input-group";
import { styledPart } from "../../utils/styled.js";
import { TextArea } from "../textarea/textarea.js";
const Root = styledPart("div", "input-group", inputGroupStyles.root);
export type InputGroupRootProps = React.ComponentProps<typeof Root> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};
export function InputGroupRoot({
  variant = "primary",
  fullWidth = false,
  xstyle,
  ...props
}: InputGroupRootProps) {
  return (
    <Root
      {...props}
      xstyle={[
        variant === "secondary" && inputGroupStyles.secondary,
        fullWidth && inputGroupStyles.fullWidth,
        xstyle,
      ]}
    />
  );
}
export const InputGroupInput = styledPart(BaseInput, "input-group-input", inputGroupStyles.input);
export function InputGroupTextArea({ xstyle, ...props }: React.ComponentProps<typeof TextArea>) {
  return (
    <TextArea
      {...props}
      data-slot="input-group-textarea"
      xstyle={[inputGroupStyles.input, xstyle]}
    />
  );
}
export const InputGroupPrefix = styledPart("div", "input-group-prefix", inputGroupStyles.prefix);
export const InputGroupSuffix = styledPart("div", "input-group-suffix", inputGroupStyles.suffix);
export const InputGroup = Object.assign(InputGroupRoot, {
  Root: InputGroupRoot,
  Input: InputGroupInput,
  TextArea: InputGroupTextArea,
  Prefix: InputGroupPrefix,
  Suffix: InputGroupSuffix,
});
export type InputGroupProps = React.ComponentProps<typeof InputGroupRoot>;
export type InputGroupInputProps = React.ComponentProps<typeof InputGroupInput>;
export type InputGroupTextAreaProps = React.ComponentProps<typeof InputGroupTextArea>;
export type InputGroupPrefixProps = React.ComponentProps<typeof InputGroupPrefix>;
export type InputGroupSuffixProps = React.ComponentProps<typeof InputGroupSuffix>;
