"use client";
import { withSource } from "@ui-sdk/core/observe";
import { sourceOf } from "@ui-sdk/core";
import { useCallback } from "react";
// Modified: native UI SDK popover with internationalized date state.
import { useState, type ComponentPropsWithRef } from "react";
import * as SdkPopover from "@ui-sdk/react/popover";
import { slotRender } from "../../utils/sdk-render.js";
import { usePart, renderElement } from "@ui-sdk/react/primitive";
import { mergeProps } from "@ui-sdk/react/primitive";
import { useDatePickerState, type DatePickerStateOptions } from "react-stately/useDatePickerState";
import { useDateFieldState, type DateValue } from "react-stately/useDateFieldState";
import { createCalendar } from "@internationalized/date";
import { datePicker } from "@lenso/primitives/model-control";
import { useModelControl, type ModelValueOptions } from "../../utils/model-control.js";
import { encodeDate, decodeDate } from "../../utils/date-values.js";
import { Field as SdkField } from "@ui-sdk/react/field";
import * as stylex from "@stylexjs/stylex";
import { materialStyles } from "@lenso/tokens/materials";
import { popoverStyles } from "@lenso/tokens/popover";
import { MaterialBackground } from "../../utils/materials/render.js";
import { datePickerStyles as styles } from "@lenso/tokens/date-picker";
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
import { PickerDateContext } from "../../utils/date-picker-state.js";
import { DateFieldLabel, DateFieldDescription, DateFieldError } from "../date-field/date-field.js";
import {
  DateInputGroupPrefix,
  DateInputGroupSuffix,
} from "../date-input-group/date-input-group.js";
export type DatePickerRenderState = DateFieldRenderState & {
  state: Omit<
    ReturnType<typeof useDatePickerState>,
    "isOpen" | "setOpen" | "open" | "close" | "toggle"
  >;
};
export type DatePickerRootProps<T extends DateValue = DateValue> = StyleXProps<
  DateFieldDOMProps<DatePickerRenderState>
> &
  Omit<DatePickerStateOptions<T>, "isOpen" | "onOpenChange" | "onChange"> &
  ModelValueOptions<T> &
  Pick<
    React.ComponentProps<typeof SdkPopover.Popover>,
    "open" | "onOpenChange" | "onOpenChangeComplete" | "modal"
  >;
export function DatePickerRoot<T extends DateValue = DateValue>(props: DatePickerRootProps<T>) {
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
      <DatePickerModel {...props} popupController={popupController} />
    </SdkPopover.Popover>
  );
}
function DatePickerModel<T extends DateValue>({
  popupController,
  ...props
}: DatePickerRootProps<T> & {
  popupController: SdkPopover.PopoverController;
}) {
  const { locale } = useLocale();
  const control = useModelControl<T>(
    datePicker,
    props,
    encodeDate,
    useCallback(
      (value) => decodeDate(value, props.value ?? props.defaultValue) as T | null,
      [props.value, props.defaultValue],
    ),
  );
  const model = useDatePickerState({
    ...dateModelOptions(props),
    value: control.value,
    defaultValue: undefined,
    onChange: (value) => control.change(value as T | null),
    isOpen: false,
    defaultOpen: undefined,
    onOpenChange: undefined,
    shouldCloseOnSelect: false,
  });
  const field = useDateFieldState({
    ...dateModelOptions(props),
    value: model.value,
    defaultValue: undefined,
    onChange: model.setValue,
    validate: undefined,
    onOpenChange: undefined,
    locale,
    createCalendar,
  });
  const scope = useDateFieldScope({ default: field }, props, model, control.handle);
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
        "data-lenso-slot": props["data-lenso-slot"] ?? "date-picker",
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
      <PickerDateContext
        value={{
          model,
          calendarProps: {
            minValue: props.minValue,
            maxValue: props.maxValue,
            isDisabled: scope.state.isDisabled,
            isReadOnly: scope.state.isReadOnly,
            isDateUnavailable: props.isDateUnavailable,
            firstDayOfWeek: props.firstDayOfWeek,
          },
          select(date, options) {
            const accepted = control.handle.api.run(
              () => (date === null ? control.change(null) : model.setDateValue(date)),
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
      </PickerDateContext>
    </DateFieldContext>
  );
}
export function DatePickerTrigger({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof SdkPopover.PopoverTrigger>>) {
  const scope = useDateFieldContext();
  const { locale } = useLocale();
  const compiled = stylex.props(styles.trigger, xstyle);
  return (
    <SdkPopover.PopoverTrigger
      {...props}
      {...compiled}
      aria-label={
        props["aria-label"] ??
        (props["aria-labelledby"] || typeof props.children === "string"
          ? undefined
          : locale.startsWith("zh")
            ? "选择日期"
            : "Choose date")
      }
      disabled={props.disabled ?? (scope.state.isDisabled || scope.state.isReadOnly)}
      render={slotRender("button", props["data-lenso-slot"] ?? "date-picker-trigger", props.render)}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
export function DatePickerTriggerIndicator({
  children,
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<"span">>) {
  const compiled = stylex.props(styles.indicator, xstyle);
  return (
    <span
      aria-hidden="true"
      {...props}
      {...compiled}
      data-lenso-slot={props["data-lenso-slot"] ?? "date-picker-trigger-indicator"}
      style={mergeStyle(compiled.style, style)}
    >
      {children ?? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 11h18" />
        </svg>
      )}
    </span>
  );
}

export type DatePickerPopoverProps = StyleXProps<
  ComponentPropsWithRef<typeof SdkPopover.PopoverContent>
>;
export function DatePickerPopover({
  children,
  side = "bottom",
  align = "center",
  sideOffset = 8,
  alignOffset,
  collisionPadding,
  xstyle,
  style,
  ...props
}: DatePickerPopoverProps) {
  const { locale } = useLocale();
  const compiled = stylex.props(
    materialStyles.root,
    materialStyles.accessible,
    popoverStyles.positioner,
    styles.popover,
    xstyle,
  );
  return (
    <SdkPopover.PopoverContent
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      collisionPadding={collisionPadding}

      {...props}
      {...compiled}
      aria-label={props["aria-label"] ?? (locale.startsWith("zh") ? "日历" : "Calendar")}
      render={slotRender("div", props["data-lenso-slot"] ?? "date-picker-popover", props.render)}
      data-material="glass-large"
      style={mergeStyle(compiled.style, style)}
    >
      {(state) => (
        <>
          <MaterialBackground variant="glass-large" liveBackdrop />
          <div {...stylex.props(styles.scroller)} data-lenso-slot="date-picker-scroller">
            {typeof children === "function" ? children(state) : children}
          </div>
        </>
      )}
    </SdkPopover.PopoverContent>
  );
}

export function DatePickerPrefix({ xstyle, ...props }: StyleXProps<ComponentPropsWithRef<"div">>) {
  return <DateInputGroupPrefix {...props} xstyle={[styles.accessory, xstyle]} />;
}
export function DatePickerSuffix({ xstyle, ...props }: StyleXProps<ComponentPropsWithRef<"div">>) {
  return <DateInputGroupSuffix {...props} xstyle={[styles.accessory, xstyle]} />;
}
export {
  DateFieldLabel as DatePickerLabel,
  DateFieldDescription as DatePickerDescription,
  DateFieldError as DatePickerError,
};
