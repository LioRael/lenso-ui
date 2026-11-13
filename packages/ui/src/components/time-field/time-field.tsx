"use client";
import { useCallback } from "react";
// Modified: UI SDK segmented inputs and pure internationalized time state.
import {
  useTimeFieldState,
  type TimeValue,
  type TimePickerProps,
} from "react-stately/useTimeFieldState";
import { usePart, renderElement } from "@ui-sdk/react/primitive";
import { mergeProps } from "@ui-sdk/react/primitive";
import { timeField } from "@lenso/primitives/model-control";
import { useModelControl, type ModelValueOptions } from "../../utils/model-control.js";
import { encodeTime, decodeTime } from "../../utils/date-values.js";
import { Field as SdkField } from "@ui-sdk/react/field";
import * as stylex from "@stylexjs/stylex";
import { timeFieldStyles as styles } from "@lenso/tokens/time-field";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useLocale } from "../../utils/locale.js";
import {
  DateFieldContext,
  useDateFieldScope,
  dateDOMProps,
  dateModelOptions,
  type DateFieldDOMProps,
  type DateFieldRenderState,
} from "../../utils/date-field-state.js";
export type TimeFieldRenderState = DateFieldRenderState & {
  state: ReturnType<typeof useTimeFieldState>;
};
export type TimeFieldRootProps<T extends TimeValue = TimeValue> = StyleXProps<
  DateFieldDOMProps<TimeFieldRenderState>
> &
  Omit<TimePickerProps<T>, "onChange"> &
  ModelValueOptions<T> & { fullWidth?: boolean };
export function TimeFieldRoot<T extends TimeValue = TimeValue>(props: TimeFieldRootProps<T>) {
  const { locale } = useLocale();
  const control = useModelControl<T>(
    timeField,
    props,
    encodeTime,
    useCallback(
      (value) =>
        decodeTime(value, props.value ?? props.defaultValue ?? props.placeholderValue) as T | null,
      [props.value, props.defaultValue, props.placeholderValue],
    ),
  );
  const model = useTimeFieldState({
    ...dateModelOptions(props),
    value: control.value,
    defaultValue: undefined,
    onChange: (value) => control.change(value as T | null),
    locale,
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
        "data-lenso-slot": props["data-lenso-slot"] ?? "time-field",
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
export {
  DateFieldLabel as TimeFieldLabel,
  DateFieldDescription as TimeFieldDescription,
  DateFieldError as TimeFieldError,
} from "../date-field/date-field.js";
