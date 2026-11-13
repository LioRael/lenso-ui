"use client";
// Modified: native UI SDK Field/Input and NumberField; pure color state is retained.
import {
  createContext,
  useId,
  useEffect,
  useState,
  useCallback,
  use,
  type ComponentPropsWithRef,
  type ReactNode,
  type CSSProperties,
} from "react";
import { usePart, renderElement, type PartProps, type RenderProp } from "@ui-sdk/react/primitive";
import {
  Field as SdkField,
  FieldLabel,
  FieldDescription,
  FieldError,
  type FieldState,
} from "@ui-sdk/react/field";
import { NumberInput } from "@ui-sdk/react/number-input";
import {
  useColorFieldState,
  type ColorFieldProps,
  type ColorFieldState,
  useColorChannelFieldState,
  type ColorChannelFieldState,
} from "react-stately/useColorFieldState";
import type { Color, ColorChannel, ColorSpace } from "react-stately/Color";
import { colorField } from "@lenso/primitives/model-control";
import {
  useModelControl,
  type ModelValueOptions,
  type ModelControlHandle,
} from "../../utils/model-control.js";
import { colorCSS, colorFromSDK } from "../../utils/color-state.js";
import type { ModelValue } from "@lenso/primitives/model-control";
import * as stylex from "@stylexjs/stylex";
import { labelStyles } from "@lenso/tokens/label";
import { colorFieldStyles as styles } from "@lenso/tokens/color-field";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { ColorValueContext } from "../../utils/color-state.js";
import { useLocale } from "../../utils/locale.js";

export type ColorFieldRenderState = FieldState & {
  isInvalid: boolean;
  isDisabled: boolean;
  isRequired: boolean;
  isReadOnly: boolean;
};
export type ColorFieldRootProps = StyleXProps<
  Omit<
    ComponentPropsWithRef<typeof SdkField>,
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
  Omit<ColorFieldProps, "onChange"> &
  Pick<ModelValueOptions<Color>, "onChange" | "onValueChange" | "controller" | "readOnly"> & {
    autoComplete?: string;
    form?: string;
    fullWidth?: boolean;
    channel?: ColorChannel;
    colorSpace?: ColorSpace;
    children?: ReactNode | ((state: ColorFieldRenderState) => ReactNode);
    style?: CSSProperties | ((state: ColorFieldRenderState) => CSSProperties | undefined);
    render?: RenderProp<ColorFieldRenderState>;
  };
type FieldModel = {
  control: ModelControlHandle;
  labelId: string;
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
  const parent = use(ColorValueContext);
  const inherited = props.value === undefined && props.defaultValue === undefined && parent;
  const control = useModelControl<Color>(
    colorField,
    {
      ...props,
      value: inherited
        ? parent.color
        : typeof props.value === "string"
          ? colorFromSDK(props.value)
          : props.value,
      defaultValue:
        typeof props.defaultValue === "string"
          ? colorFromSDK(props.defaultValue)
          : props.defaultValue,
      onValueChange(value, details) {
        props.onValueChange?.(value, details);
        if (
          !details.canceled &&
          inherited &&
          !parent.setColor(value, {
            reason: "input-commit",
            ...(details.event ? { event: details.event } : {}),
          })
        )
          details.cancel();
        if (!details.canceled) props.onChange?.(value, details);
      },
      onChange: undefined,
    },
    (value) => colorCSS(value ?? undefined) ?? null,
    useCallback((value: ModelValue) => {
      if (value === null) return null;
      if (typeof value !== "string") throw new Error("Expected a CSS color");
      return colorFromSDK(value);
    }, []),
  );
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    const owner = props.form ? document.getElementById(props.form) : element?.closest("form");
    if (!(owner instanceof HTMLFormElement)) return;
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (!event.defaultPrevented) control.handle.api.reset();
      });
    };
    owner.addEventListener("reset", reset);
    return () => owner.removeEventListener("reset", reset);
  }, [element, props.form, control.handle]);
  const labelId = useId();
  const content = props.channel ? (
    <ChannelField
      {...props}
      channel={props.channel}
      value={control.value}
      control={control.handle}
      labelId={labelId}
      onChange={control.change}
    />
  ) : (
    <HexField
      {...props}
      value={control.value}
      control={control.handle}
      labelId={labelId}
      onChange={control.change}
    />
  );
  return usePart(
    control.handle,
    "root",
    {},
    {
      "aria-label": props["aria-label"],
      "aria-labelledby": props["aria-labelledby"] ?? (props["aria-label"] ? undefined : labelId),
      ref: setElement,
      style: { display: props.fullWidth ? "block" : "inline-block" },
      children: content,
    },
    "div",
  );
}
type ControlledFieldProps = Omit<ColorFieldRootProps, "onChange"> & {
  onChange: (value: Color | null) => void;
  control: ModelControlHandle;
  labelId: string;
};
function HexField(props: ControlledFieldProps) {
  const model = useColorFieldState(props);
  return <ColorFieldFrame {...props} model={model} />;
}
function ChannelField(props: ControlledFieldProps & { channel: ColorChannel }) {
  const { locale } = useLocale();
  const space =
    props.colorSpace ??
    (props.channel === "red" || props.channel === "green" || props.channel === "blue"
      ? "rgb"
      : props.channel === "brightness"
        ? "hsb"
        : "hsl");
  const value =
    typeof props.value === "string"
      ? colorFromSDK(props.value, space)
      : props.value?.toFormat(space);
  const model = useColorChannelFieldState({
    ...props,
    value,
    colorSpace: space,
    channel: props.channel,
    locale,
  });
  const range = model.colorValue.getChannelRange(props.channel);
  const format = model.colorValue.getChannelFormatOptions(props.channel);
  const multiplier = format.style === "percent" && range.maxValue === 100 ? 100 : 1;
  return (
    <ColorFieldFrame
      {...props}
      model={model}
      wrapChildren={(children) => (
        <NumberInput
          value={Number.isNaN(model.numberValue) ? null : model.numberValue}
          min={model.minValue}
          max={model.maxValue}
          step={range.step / multiplier}
          locale={locale}
          format={format}
          disabled={props.isDisabled ?? props.disabled}
          readOnly={props.isReadOnly ?? props.readOnly}
          required={props.isRequired}
          onValueChange={(value, details) => {
            const accepted = props.control.api.run(() => model.setNumberValue(value ?? NaN), {
              reason: details.reason === "input-change" ? "input-change" : "step-key",
              ...(details.event ? { event: details.event } : {}),
            });
            if (accepted === false) details.cancel();
          }}
          name={props.name}
          form={props.form}
          style={{ display: "contents" }}
        >
          {children}
        </NumberInput>
      )}
    />
  );
}
function ColorFieldFrame({
  model,
  control,
  labelId,
  wrapChildren,
  fullWidth,
  channel,
  colorSpace: _colorSpace,
  value: _value,
  defaultValue: _defaultValue,
  onChange: _onChange,
  onValueChange: _onValueChange,
  controller: _controller,
  readOnly,
  validate: _validate,
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
}: ControlledFieldProps & {
  model: ColorFieldState | ColorChannelFieldState;
  wrapChildren?: (children: ReactNode) => ReactNode;
}) {
  const mapState = (native: FieldState): ColorFieldRenderState => ({
    ...native,
    isInvalid: native.invalid,
    isDisabled: native.disabled,
    isReadOnly,
    isRequired,
  });
  const compiled = stylex.props(styles.root, fullWidth && styles.fullWidth, xstyle);
  return (
    <ColorFieldModel
      value={{
        model,
        control,
        labelId,
        channel,
        isReadOnly: readOnly ?? isReadOnly,
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
      <SdkField
        data-agent-hidden=""
        {...props}
        {...compiled}
        disabled={disabled}
        invalid={invalid ?? (model.displayValidation.isInvalid || undefined)}
        name={name}
        data-lenso-slot={props["data-lenso-slot"] ?? "color-field"}
        data-required={isRequired || undefined}
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
      ></SdkField>
    </ColorFieldModel>
  );
}
export function ColorFieldLabel({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof FieldLabel>>) {
  const { labelId } = useColorFieldModel();
  const compiled = stylex.props(
    labelStyles.label,
    labelStyles.contextualRequired,
    styles.label,
    xstyle,
  );
  return (
    <FieldLabel
      {...props}
      id={props.id ?? labelId}
      {...compiled}
      data-lenso-slot={props["data-lenso-slot"] ?? "label"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
export function ColorFieldDescription({
  xstyle,
  style,
  render,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof FieldDescription>>) {
  const compiled = stylex.props(styles.description, xstyle);
  return (
    <FieldDescription
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={(partProps, state) =>
        renderElement(
          "p",
          {
            ...partProps,
            ...stylex.props(state.invalid && styles.hidden),
            "data-lenso-slot": props["data-lenso-slot"] ?? "description",
          },
          render,
          state,
        )
      }
    />
  );
}
export function ColorFieldError({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof FieldError>>) {
  const state = useColorFieldModel();
  const compiled = stylex.props(styles.error, xstyle);
  return (
    <FieldError
      match={props.match ?? (state.isInvalid ? true : undefined)}
      {...props}
      {...compiled}
      data-lenso-slot={props["data-lenso-slot"] ?? "field-error"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
export type { Color as ColorValue } from "react-stately/Color";

function FieldFrameElement({ render, ref, ...props }: PartProps<"div">) {
  return renderElement("div", { ...props, ref: ref }, render);
}
