"use client";
import * as React from "react";
import { Input, type InputProps } from "../input/input.js";
import { inputStyles } from "@lenso/tokens/input";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { useElasticRef, useGlassRef } from "@lenso/glass/react";
import { Button as BaseButton } from "@base-ui/react/button";
import { clearInput } from "../../utils/clear-input.js";
import { Label } from "../label/label.js";
import { Description } from "../description/description.js";
import { Field } from "@base-ui/react/field";
import { textFieldStyles } from "@lenso/tokens/textfield";
import { groupStyles } from "@lenso/tokens/surface";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { FieldScope } from "./field-scope.js";
import { FieldGroupContext } from "./group-context.js";

export type TextFieldRootProps = StyleXProps<Field.Root.Props> & {
  fullWidth?: boolean;
  layout?: "row" | "stacked";
  "data-slot"?: unknown;
};
export function TextFieldRoot({
  fullWidth = false,
  layout,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: TextFieldRootProps) {
  const grouped = React.useContext(FieldGroupContext);
  const fieldLayout = layout ?? (grouped ? "row" : "stacked");
  const compiled = stylex.props(
    textFieldStyles.root,
    grouped && groupStyles.row,
    grouped && groupStyles.divided,
    grouped && groupStyles.fieldFocus,
    grouped && textFieldStyles.groupedField,
    fieldLayout === "row" && textFieldStyles.row,
    grouped && fieldLayout === "stacked" && textFieldStyles.stacked,
    fullWidth && textFieldStyles.fullWidth,
    xstyle,
  );
  return (
    <FieldScope value={true}>
      <Field.Root
        {...props}
        {...compiled}
        style={mergeStyle<Field.Root.State>(compiled.style, style)}
        data-slot={slot ?? "text-field"}
        data-field-layout={fieldLayout}
        data-field-grouped={grouped || undefined}
      />
    </FieldScope>
  );
}
/** @deprecated Use Fieldset with Fieldset.Group for mixed form rows. */
export function TextFieldGroup({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"fieldset">>) {
  const compiled = stylex.props(
    groupStyles.surface,
    groupStyles.group,
    textFieldStyles.group,
    xstyle,
  );
  return (
    <FieldGroupContext.Provider value={true}>
      <fieldset
        {...props}
        {...compiled}
        style={{ ...compiled.style, ...style }}
        data-slot="text-field-group"
      />
    </FieldGroupContext.Provider>
  );
}
export type TextFieldInputProps = InputProps & {
  clearable?: boolean;
  clearLabel?: string;
};
export function TextFieldInput({
  clearable = true,
  clearLabel = "Clear text",
  variant = "primary",
  fullWidth = false,
  glass = false,
  elastic = false,
  ref,
  xstyle,
  style,
  ...props
}: TextFieldInputProps) {
  const input = React.useRef<HTMLInputElement | null>(null);
  const grouped = React.useContext(FieldGroupContext);
  const controlRef = useElasticRef(useGlassRef<HTMLDivElement>(undefined, glass), {
    enabled: elastic && !props.disabled,
  });
  return (
    <div
      ref={controlRef}
      data-slot="text-field-control"
      {...stylex.props(
        glass && liquidMaterialStyles.small,
        inputStyles.input,
        glass && inputStyles.fieldGlass,
        elastic && inputStyles.elastic,
        !glass && variant === "secondary" && inputStyles.secondary,
        textFieldStyles.control,
        fullWidth && inputStyles.fullWidth,
        grouped && !glass && inputStyles.formGrouped,
      )}
    >
      <Input
        placeholder=""
        {...props}
        ref={(node) => {
          input.current = node as HTMLInputElement | null;
          if (typeof ref === "function") return ref(node);
          if (ref) ref.current = node;
        }}
        xstyle={[inputStyles.groupedControl, textFieldStyles.input, xstyle]}
        style={style}
        data-slot="text-field-input"
      />
      {clearable && (
        <BaseButton
          type="button"
          aria-label={clearLabel}
          data-slot="text-field-clear"
          {...stylex.props(textFieldStyles.clear)}
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => {
            if (input.current) clearInput(input.current);
          }}
        >
          <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
            <circle cx="10" cy="10" r="8" fill="currentColor" />
            <path
              d="m7.5 7.5 5 5m0-5-5 5"
              fill="none"
              stroke="var(--lenso-background-grouped-secondary)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </BaseButton>
      )}
    </div>
  );
}
export const TextField = Object.assign(TextFieldRoot, {
  Root: TextFieldRoot,
  Group: TextFieldGroup,
  Input: TextFieldInput,
  Label,
  Description,
});
export type TextFieldProps = TextFieldRootProps;
