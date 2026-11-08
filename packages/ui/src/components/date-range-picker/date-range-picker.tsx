"use client";
// Modified: native Base UI range inputs and popover.
import { useRef, type ComponentPropsWithRef } from "react";
import { Popover as Base } from "@base-ui/react/popover";
import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
import {
  useDateRangePickerState,
  type DateRangePickerStateOptions,
} from "react-stately/useDateRangePickerState";
import { useDateFieldState, type DateValue } from "react-stately/useDateFieldState";
import { createCalendar } from "@internationalized/date";
import { dateRangePickerStyles as styles } from "@lenso/tokens/date-range-picker";
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
  DatePickerDialog,
  DatePickerLabel,
  DatePickerDescription,
  DatePickerError,
} from "../date-picker/date-picker.js";
export type DateRangePickerRenderState = DateFieldRenderState & {
  state: ReturnType<typeof useDateRangePickerState>;
};
export type DateRangePickerRootProps<T extends DateValue = DateValue> = StyleXProps<
  DateFieldDOMProps<DateRangePickerRenderState>
> &
  Omit<DateRangePickerStateOptions<T>, "onOpenChange"> &
  Pick<
    Base.Root.Props,
    "open" | "onOpenChange" | "onOpenChangeComplete" | "modal" | "triggerId" | "defaultTriggerId"
  >;
export function DateRangePickerRoot<T extends DateValue = DateValue>(
  props: DateRangePickerRootProps<T>,
) {
  const { locale } = useLocale();
  const model = useDateRangePickerState({
    ...dateModelOptions(props),
    isOpen: props.open ?? props.isOpen,
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
  const scope = useDateFieldScope({ default: start, start, end }, props, model);
  const presentation = { ...scope.state, state: model };
  const actions = useRef<Base.Root.Actions>(null);
  const { xstyle, style, render, ref, children } = props;
  const compiled = stylex.props(styles.root, xstyle);
  const element = useRender({
    defaultTagName: "div",
    render,
    ref,
    state: presentation,
    stateAttributesMapping: { state: () => null },
    props: mergeProps(compiled, dateDOMProps(props), {
      "data-slot": props["data-slot"] ?? "date-range-picker",
      "data-date-field-root": "",
      "data-required": scope.state.isRequired || undefined,
      "data-disabled": scope.state.isDisabled || undefined,
      "data-invalid": scope.state.isInvalid || undefined,
      style:
        typeof style === "function"
          ? { ...compiled.style, ...style(presentation) }
          : mergeStyle(compiled.style, style),
      children: typeof children === "function" ? children(presentation) : children,
    }),
  });
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
          select(value) {
            model.setDateRange(value);
            const close =
              typeof props.shouldCloseOnSelect === "function"
                ? props.shouldCloseOnSelect()
                : (props.shouldCloseOnSelect ?? !model.hasTime);
            if (close) actions.current?.close();
          },
        }}
      >
        <Base.Root
          actionsRef={actions}
          open={model.isOpen}
          defaultOpen={props.defaultOpen}
          onOpenChange={(open, details) => {
            props.onOpenChange?.(open, details);
            if (!details.isCanceled) model.setOpen(open);
          }}
          onOpenChangeComplete={props.onOpenChangeComplete}
          modal={props.modal}
          triggerId={props.triggerId}
          defaultTriggerId={props.defaultTriggerId}
        >
          {element}
        </Base.Root>
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
      data-slot={props["data-slot"] ?? "date-range-picker-range-separator"}
      style={mergeStyle(compiled.style, style)}
    >
      {children}
    </span>
  );
}
export function DateRangePickerTrigger(
  props: StyleXProps<ComponentPropsWithRef<typeof DatePickerTrigger>>,
) {
  return <DatePickerTrigger {...props} data-slot="date-range-picker-trigger" />;
}
export function DateRangePickerTriggerIndicator(
  props: StyleXProps<ComponentPropsWithRef<typeof DatePickerTriggerIndicator>>,
) {
  return <DatePickerTriggerIndicator {...props} data-slot="date-range-picker-trigger-indicator" />;
}
export function DateRangePickerPopover(
  props: StyleXProps<ComponentPropsWithRef<typeof DatePickerPopover>>,
) {
  return <DatePickerPopover {...props} data-slot="date-range-picker-popover" />;
}
export {
  DatePickerDialog as DateRangePickerDialog,
  DatePickerLabel as DateRangePickerLabel,
  DatePickerDescription as DateRangePickerDescription,
  DatePickerError as DateRangePickerError,
};
