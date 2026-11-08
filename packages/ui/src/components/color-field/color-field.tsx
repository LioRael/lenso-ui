"use client";
// Modified: native Base UI Field/Input and NumberField; pure color state is retained.
import {
  createContext,
  use,
  type ComponentPropsWithRef,
  type ReactNode,
  type CSSProperties,
} from "react";
import { useRender } from "@base-ui/react/use-render";
import { Field } from "@base-ui/react/field";
import { NumberField } from "@base-ui/react/number-field";
import {
  useColorFieldState,
  type ColorFieldProps,
  type ColorFieldState,
  useColorChannelFieldState,
  type ColorChannelFieldState,
} from "react-stately/useColorFieldState";
import type { Color, ColorChannel, ColorSpace } from "react-stately/Color";
import * as stylex from "@stylexjs/stylex";
import { labelStyles } from "@lenso/tokens/label";
import { colorFieldStyles as styles } from "@lenso/tokens/color-field";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { ColorValueContext } from "../../utils/color-state.js";
import { useLocale } from "../../utils/locale.js";

export type ColorFieldRenderState = Field.Root.State & {
  isInvalid: boolean;
  isDisabled: boolean;
  isRequired: boolean;
  isReadOnly: boolean;
};
export type ColorFieldRootProps = StyleXProps<
  Omit<
    ComponentPropsWithRef<typeof Field.Root>,
    | "children"
    | "style"
    | "render"
    | "onChange"
    | "defaultValue"
    | "validate"
    | "onFocus"
    | "onBlur"
  >
> &
  ColorFieldProps & {
    autoComplete?: string;
    form?: string;
    fullWidth?: boolean;
    channel?: ColorChannel;
    colorSpace?: ColorSpace;
    children?: ReactNode | ((state: ColorFieldRenderState) => ReactNode);
    style?: CSSProperties | ((state: ColorFieldRenderState) => CSSProperties | undefined);
    render?: import("@base-ui/react/use-render").useRender.RenderProp<ColorFieldRenderState>;
  };
type FieldModel = {
  model: ColorFieldState | ColorChannelFieldState;
  channel?: ColorChannel;
  isReadOnly: boolean;
  isRequired: boolean;
  isInvalid: boolean;
  isDisabled: boolean;
  inputProps: {
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    autoFocus?: boolean;
    autoComplete?: string;
    form?: string;
    name?: string;
    onFocus?: ColorFieldProps["onFocus"];
    onBlur?: ColorFieldProps["onBlur"];
    onFocusChange?: ColorFieldProps["onFocusChange"];
  };
};
export const ColorFieldModel = createContext<FieldModel | null>(null);
export function useColorFieldModel() {
  const state = use(ColorFieldModel);
  if (!state) throw new Error("ColorField.Input requires ColorField.Root");
  return state;
}
export function ColorFieldRoot(props: ColorFieldRootProps) {
  return props.channel ? (
    <ChannelField {...props} channel={props.channel} />
  ) : (
    <HexField {...props} />
  );
}
function useInheritedProps(props: ColorFieldRootProps) {
  const parent = use(ColorValueContext);
  const inherits = props.value === undefined && props.defaultValue === undefined && parent;
  return {
    ...props,
    value: inherits ? parent.color : props.value,
    onChange(color: Color | null) {
      if (inherits) parent.setColor(color);
      props.onChange?.(color);
    },
  };
}
function HexField(props: ColorFieldRootProps) {
  const options = useInheritedProps(props);
  const model = useColorFieldState(options);
  return <ColorFieldFrame {...props} model={model} />;
}
function ChannelField(props: ColorFieldRootProps & { channel: ColorChannel }) {
  const { locale } = useLocale();
  const options = useInheritedProps(props);
  const model = useColorChannelFieldState({ ...options, channel: props.channel, locale });
  const range = model.colorValue.getChannelRange(props.channel);
  const format = model.colorValue.getChannelFormatOptions(props.channel);
  const multiplier = format.style === "percent" && range.maxValue === 100 ? 100 : 1;
  return (
    <ColorFieldFrame
      {...props}
      model={model}
      wrapChildren={(children) => (
        <NumberField.Root
          value={Number.isNaN(model.numberValue) ? null : model.numberValue}
          min={model.minValue}
          max={model.maxValue}
          step={range.step / multiplier}
          locale={locale}
          format={format}
          disabled={props.isDisabled ?? props.disabled}
          readOnly={props.isReadOnly}
          required={props.isRequired}
          onValueChange={(value) => model.setNumberValue(value ?? NaN)}
          name={props.name}
          form={props.form}
          style={{ display: "contents" }}
        >
          {children}
        </NumberField.Root>
      )}
    />
  );
}
function ColorFieldFrame({
  model,
  wrapChildren,
  fullWidth,
  channel,
  colorSpace: _colorSpace,
  value: _value,
  defaultValue: _defaultValue,
  onChange: _onChange,
  validate,
  validationBehavior: _validationBehavior,
  isInvalid,
  isDisabled,
  isReadOnly = false,
  isRequired = false,
  disabled = isDisabled,
  invalid = isInvalid,
  children,
  xstyle,
  style,
  render,
  name,
  "aria-label": ariaLabel,
  "aria-labelledby": labelledBy,
  "aria-describedby": describedBy,
  autoFocus,
  autoComplete,
  form,
  onFocus,
  onBlur,
  onFocusChange,
  ...props
}: ColorFieldRootProps & {
  model: ColorFieldState | ColorChannelFieldState;
  wrapChildren?: (children: ReactNode) => ReactNode;
}) {
  const mapState = (native: Field.Root.State): ColorFieldRenderState => ({
    ...native,
    isInvalid: native.valid === false,
    isDisabled: native.disabled,
    isReadOnly,
    isRequired,
  });
  const compiled = stylex.props(styles.root, fullWidth && styles.fullWidth, xstyle);
  return (
    <ColorFieldModel
      value={{
        model,
        channel,
        isReadOnly,
        isRequired,
        isInvalid: !!invalid,
        isDisabled: !!disabled,
        inputProps: {
          "aria-label": ariaLabel,
          "aria-labelledby": labelledBy,
          "aria-describedby": describedBy,
          autoFocus,
          autoComplete,
          form,
          name,
          onFocus,
          onBlur,
          onFocusChange,
        },
      }}
    >
      <Field.Root
        {...props}
        {...compiled}
        disabled={disabled}
        invalid={invalid}
        name={name}
        data-slot={props["data-slot"] ?? "color-field"}
        data-required={isRequired || undefined}
        validate={
          validate
            ? () => {
                const result = validate(model.colorValue);
                return result === true ? null : result;
              }
            : undefined
        }
        render={(nativeProps, nativeState) => {
          const content =
            typeof children === "function" ? children(mapState(nativeState)) : children;
          const composed = {
            ...nativeProps,
            children: wrapChildren ? wrapChildren(content) : content,
          };
          return typeof render === "function" ? (
            render(composed, mapState(nativeState))
          ) : (
            <FieldFrameElement render={render} {...composed} />
          );
        }}
        style={
          typeof style === "function"
            ? (native) => ({ ...compiled.style, ...style(mapState(native)) })
            : mergeStyle(compiled.style, style)
        }
      ></Field.Root>
    </ColorFieldModel>
  );
}
export function ColorFieldLabel({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Field.Label>>) {
  const compiled = stylex.props(
    labelStyles.label,
    labelStyles.contextualRequired,
    styles.label,
    xstyle,
  );
  return (
    <Field.Label
      {...props}
      {...compiled}
      data-slot={props["data-slot"] ?? "label"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
export function ColorFieldDescription({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Field.Description>>) {
  return (
    <Field.Validity>
      {({ validity }) => {
        const compiled = stylex.props(
          styles.description,
          validity.valid === false && styles.hidden,
          xstyle,
        );
        return (
          <Field.Description
            {...props}
            {...compiled}
            data-slot={props["data-slot"] ?? "description"}
            style={mergeStyle(compiled.style, style)}
          />
        );
      }}
    </Field.Validity>
  );
}
export function ColorFieldError({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Field.Error>>) {
  const state = useColorFieldModel();
  const compiled = stylex.props(styles.error, xstyle);
  return (
    <Field.Error
      match={props.match ?? (state.isInvalid ? true : undefined)}
      {...props}
      {...compiled}
      data-slot={props["data-slot"] ?? "field-error"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
export type { Color as ColorValue } from "react-stately/Color";

function FieldFrameElement({
  render,
  ref,
  ...props
}: import("@base-ui/react/use-render").useRender.ComponentProps<"div">) {
  return useRender({ defaultTagName: "div", render, ref, props });
}
