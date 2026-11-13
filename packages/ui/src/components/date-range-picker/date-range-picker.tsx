"use client";
import { withSource } from "@ui-sdk/core/observe";
import { sourceOf } from "@ui-sdk/core";
import { useCallback } from "react";
// Modified: native UI SDK range inputs and popover.
import { useState, type ComponentPropsWithRef } from "react";
import * as SdkPopover from "@ui-sdk/react/popover";
import { usePart, renderElement } from "@ui-sdk/react/primitive";
import { mergeProps } from "@ui-sdk/react/primitive";
import {
  useDateRangePickerState,
  type DateRangePickerStateOptions,
} from "react-stately/useDateRangePickerState";
import { useDateFieldState, type DateValue } from "react-stately/useDateFieldState";
import { createCalendar } from "@internationalized/date";
import { dateRangePickerStyles as styles } from "@lenso/tokens/date-range-picker";
import { dateRangePicker } from "@lenso/primitives/model-control";
import { useModelControl, type ModelValueOptions } from "../../utils/model-control.js";
import { encodeRange, decodeRange } from "../../utils/date-values.js";
import { Field as SdkField } from "@ui-sdk/react/field";
import * as stylex from "@stylexjs/stylex";
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
import { PickerRangeContext } from "../../utils/date-picker-state.js";
import {
  DatePickerTrigger,
  DatePickerTriggerIndicator,
  DatePickerPopover,
  DatePickerLabel,
  DatePickerDescription,
  DatePickerError,
} from "../date-picker/date-picker.js";
export type DateRangePickerRenderState = DateFieldRenderState & {
  state: Omit<
    ReturnType<typeof useDateRangePickerState>,
    "isOpen" | "setOpen" | "open" | "close" | "toggle"
  >;
};
export type DateRangePickerRootProps<T extends DateValue = DateValue> = StyleXProps<
  DateFieldDOMProps<DateRangePickerRenderState>
> &
  Omit<DateRangePickerStateOptions<T>, "isOpen" | "onOpenChange" | "onChange"> &
  ModelValueOptions<{ start: T; end: T }> &
  Pick<
    React.ComponentProps<typeof SdkPopover.Popover>,
    "open" | "onOpenChange" | "onOpenChangeComplete" | "modal"
  >;
export function DateRangePickerRoot<T extends DateValue = DateValue>(
  props: DateRangePickerRootProps<T>,
) {
  const [popupController] = useState(() => SdkPopover.createPopoverController());
  return (
    <SdkPopover.Popover
      controller={popupController}
      open={props.open}
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
      onOpenChangeComplete={props.onOpenChangeComplete}
      modal={props.modal}
    >
      <DateRangePickerModel {...props} popupController={popupController} />
    </SdkPopover.Popover>
  );
}
function DateRangePickerModel<T extends DateValue>({
  popupController,
  ...props
}: DateRangePickerRootProps<T> & {
  popupController: SdkPopover.PopoverController;
}) {
  const { locale } = useLocale();
  const control = useModelControl<{ start: T; end: T }>(
    dateRangePicker,
    props,
    encodeRange,
    useCallback(
      (value) =>
        decodeRange(value, props.value ?? props.defaultValue) as { start: T; end: T } | null,
      [props.value, props.defaultValue],
    ),
  );
  const model = useDateRangePickerState({
    ...dateModelOptions(props),
    value: control.value,
    defaultValue: undefined,
    onChange: (value) => control.change(value as { start: T; end: T } | null),
    isOpen: false,
    defaultOpen: undefined,
    onOpenChange: undefined,
    shouldCloseOnSelect: false,
  });
  const start = useDateFieldState({
    ...dateModelOptions(props),
    value: model.value.start,
    defaultValue: undefined,
    onChange: (value) => model.setDateTime("start", value),
    validate: undefined,
    onOpenChange: undefined,
    isDateUnavailable: undefined,
    locale,
    createCalendar,
  });
  const end = useDateFieldState({
    ...dateModelOptions(props),
    value: model.value.end,
    defaultValue: undefined,
    onChange: (value) => model.setDateTime("end", value),
    validate: undefined,
    onOpenChange: undefined,
    isDateUnavailable: undefined,
    locale,
    createCalendar,
  });
  const scope = useDateFieldScope({ default: start, start, end }, props, model, control.handle);
  const presentation = { ...scope.state, state: model };
  const { xstyle, style, render, ref, children } = props;
  const compiled = stylex.props(styles.root, xstyle);
  const element = usePart(
    control.handle,
    "root",
    {},
    // oxlint-disable-next-line react/refs -- SDK renderElement forwards refs; it does not read them.
    {
      ...mergeProps(compiled, dateDOMProps(props), {
        "data-lenso-slot": props["data-lenso-slot"] ?? "date-range-picker",
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
  return (
    <DateFieldContext value={scope}>
      <PickerRangeContext
        value={{
          model,
          calendarProps: {
            minValue: props.minValue,
            maxValue: props.maxValue,
            isDisabled: scope.state.isDisabled,
            isReadOnly: scope.state.isReadOnly,
            isDateUnavailable: props.isDateUnavailable,
            firstDayOfWeek: props.firstDayOfWeek,
            allowsNonContiguousRanges: props.allowsNonContiguousRanges,
          },
          select(value, options) {
            const accepted = control.handle.api.run(
              () => (value === null ? control.change(null) : model.setDateRange(value)),
              {
                ...options,
                reason: options?.reason ?? "item-press",
              },
            );
            const close =
              typeof props.shouldCloseOnSelect === "function"
                ? props.shouldCloseOnSelect()
                : (props.shouldCloseOnSelect ?? !model.hasTime);
            if (close && accepted !== false)
              withSource(options?.source ?? sourceOf(options?.event), () =>
                popupController.close(),
              );
            return accepted;
          },
        }}
      >
        {element}
      </PickerRangeContext>
    </DateFieldContext>
  );
}
export function DateRangePickerRangeSeparator({
  children = " - ",
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<"span">>) {
  const compiled = stylex.props(styles.separator, xstyle);
  return (
    <span
      aria-hidden="true"
      {...props}
      {...compiled}
      data-lenso-slot={props["data-lenso-slot"] ?? "date-range-picker-range-separator"}
      style={mergeStyle(compiled.style, style)}
    >
      {children}
    </span>
  );
}
export function DateRangePickerTrigger(
  props: StyleXProps<ComponentPropsWithRef<typeof DatePickerTrigger>>,
) {
  return <DatePickerTrigger {...props} data-lenso-slot="date-range-picker-trigger" />;
}
export function DateRangePickerTriggerIndicator(
  props: StyleXProps<ComponentPropsWithRef<typeof DatePickerTriggerIndicator>>,
) {
  return (
    <DatePickerTriggerIndicator {...props} data-lenso-slot="date-range-picker-trigger-indicator" />
  );
}
export function DateRangePickerPopover(
  props: StyleXProps<ComponentPropsWithRef<typeof DatePickerPopover>>,
) {
  return <DatePickerPopover {...props} data-lenso-slot="date-range-picker-popover" />;
}
export {
  DatePickerLabel as DateRangePickerLabel,
  DatePickerDescription as DateRangePickerDescription,
  DatePickerError as DateRangePickerError,
};
