"use client";
import { useCallback } from "react";
// Modified: UI SDK render/field contracts with internationalized date state.
import { useEffect, type ReactNode } from "react";
import { createCalendar } from "@internationalized/date";
import {
  useDateFieldState,
  type DateValue,
  type DateFieldProps,
} from "react-stately/useDateFieldState";
import { usePart, renderElement, type PartProps } from "@ui-sdk/react/primitive";
import { mergeProps } from "@ui-sdk/react/primitive";
import { dateField } from "@lenso/primitives/model-control";
import { slotRender } from "../../utils/sdk-render.js";
import { useModelControl, type ModelValueOptions } from "../../utils/model-control.js";
import { encodeDate, decodeDate } from "../../utils/date-values.js";
import {
  Field as SdkField,
  FieldLabel as SdkLabel,
  FieldDescription as SdkDescription,
  FieldError as SdkError,
} from "@ui-sdk/react/field";
import * as stylex from "@stylexjs/stylex";
import { labelStyles } from "@lenso/tokens/label";
import { dateFieldStyles as styles } from "@lenso/tokens/date-field";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useLocale } from "../../utils/locale.js";
import {
  DateFieldContext,
  useDateFieldContext,
  useDateFieldScope,
  dateDOMProps,
  dateModelOptions,
  type DateFieldDOMProps,
  type DateFieldRenderState,
} from "../../utils/date-field-state.js";
export type DateFieldValueRenderState = DateFieldRenderState & {
  state: ReturnType<typeof useDateFieldState>;
};
export type DateFieldRootProps<T extends DateValue = DateValue> = StyleXProps<
  DateFieldDOMProps<DateFieldValueRenderState>
> &
  Omit<DateFieldProps<T>, "onChange"> &
  ModelValueOptions<T> & { fullWidth?: boolean };
export function DateFieldRoot<T extends DateValue = DateValue>(props: DateFieldRootProps<T>) {
  const { locale } = useLocale();
  const control = useModelControl<T>(
    dateField,
    props,
    encodeDate,
    useCallback(
      (value) =>
        decodeDate(value, props.value ?? props.defaultValue ?? props.placeholderValue) as T | null,
      [props.value, props.defaultValue, props.placeholderValue],
    ),
  );
  const model = useDateFieldState({
    ...dateModelOptions(props),
    value: control.value,
    defaultValue: undefined,
    onChange: (value) => control.change(value as T | null),
    locale,
    createCalendar,
  });
  const scope = useDateFieldScope({ default: model }, props, undefined, control.handle);
  const presentation = { ...scope.state, state: model };
  const { xstyle, style, render, ref, children } = props;
  const compiled = stylex.props(styles.root, props.fullWidth && styles.fullWidth, xstyle);
  const element = usePart(
    control.handle,
    "root",
    {},
    // oxlint-disable-next-line react/refs -- SDK renderElement forwards refs; it does not read them.
    {
      ...mergeProps(compiled, dateDOMProps(props), {
        "data-lenso-slot": props["data-lenso-slot"] ?? "date-field",
        "data-date-field-root": "",
        "aria-labelledby":
          props["aria-labelledby"] ?? (props["aria-label"] ? undefined : scope.labelId),
        "data-required": scope.state.isRequired || undefined,
        "data-disabled": scope.state.isDisabled || undefined,
        "data-invalid": scope.state.isInvalid || undefined,
        style:
          typeof style === "function"
            ? { ...compiled.style, ...style(presentation) }
            : mergeStyle(compiled.style, style),
        children: (
          <SdkField
            disabled={scope.state.isDisabled}
            invalid={scope.state.isInvalid}
            style={{ display: "contents" }}
          >
            {typeof children === "function" ? children(presentation) : children}
          </SdkField>
        ),
      }),
      ref: ref,
      render: (node) => renderElement("div", node, render, presentation),
    },
    "div",
  );
  return <DateFieldContext value={scope}>{element}</DateFieldContext>;
}
export function DateFieldLabel({
  id,
  ref,
  render,
  xstyle,
  style,
  ...props
}: StyleXProps<PartProps<"label">>) {
  const scope = useDateFieldContext();
  const labelId = id ?? scope.labelId;
  const setLabelId = scope.setLabelId;
  useEffect(() => {
    if (id) setLabelId(id);
  }, [id, setLabelId]);
  const compiled = stylex.props(
    labelStyles.label,
    labelStyles.contextualRequired,
    styles.label,
    xstyle,
  );
  return (
    <SdkLabel
      {...props}
      {...compiled}
      id={labelId}
      ref={ref}
      htmlFor={props.htmlFor ?? scope.firstInputId}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("label", props["data-lenso-slot"] ?? "label", render)}
    />
  );
}
export function DateFieldDescription({
  id,
  ref,
  render,
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentProps<typeof SdkDescription>>) {
  const scope = useDateFieldContext();
  const setDescriptionId = scope.setDescriptionId;
  useEffect(() => {
    if (id) setDescriptionId(id);
  }, [id, setDescriptionId]);
  const compiled = stylex.props(styles.description, scope.state.isInvalid && styles.hidden, xstyle);
  return (
    <SdkDescription
      {...props}
      {...compiled}
      id={id ?? scope.descriptionId}
      ref={ref}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("p", props["data-lenso-slot"] ?? "description", render)}
    />
  );
}
export type DateFieldErrorRenderState =
  import("react-stately/useDateFieldState").DateFieldState["displayValidation"];
export function DateFieldError({
  children,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<PartProps<"div">, "children">> & {
  children?: ReactNode | ((state: DateFieldErrorRenderState) => ReactNode);
}) {
  const scope = useDateFieldContext();
  const setErrorId = scope.setErrorId;
  useEffect(() => {
    if (props.id) setErrorId(props.id);
  }, [props.id, setErrorId]);
  const modelValidation =
    scope.validation?.displayValidation ?? scope.models.default.displayValidation;
  const nativeValidity = Object.values(scope.nativeValidation).find((value) => !value.valid);
  const messages = Object.values(scope.nativeValidation)
    .filter((value) => !value.valid)
    .map((value) => value.message)
    .filter(Boolean);
  const validation = {
    ...modelValidation,
    isInvalid: scope.state.isInvalid,
    validationErrors: messages.length ? messages : modelValidation.validationErrors,
    validationDetails: nativeValidity ? nativeValidity.details : modelValidation.validationDetails,
  };
  const compiled = stylex.props(styles.error, !scope.state.isInvalid && styles.hidden, xstyle);
  const { ref, render, ...rest } = props;
  return (
    <SdkError
      {...rest}
      {...compiled}
      id={props.id ?? scope.errorId}
      match={scope.state.isInvalid}
      ref={ref}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "field-error", render)}
    >
      {typeof children === "function"
        ? children(validation)
        : (children ?? validation.validationErrors.join(" "))}
    </SdkError>
  );
}
