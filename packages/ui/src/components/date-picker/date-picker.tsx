"use client";
// Modified: native Base UI popover with internationalized date state.
import { useRef, type ComponentPropsWithRef } from "react";
import { Popover as Base } from "@base-ui/react/popover";
import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
import { useDatePickerState, type DatePickerStateOptions } from "react-stately/useDatePickerState";
import { useDateFieldState, type DateValue } from "react-stately/useDateFieldState";
import { createCalendar } from "@internationalized/date";
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
import { PopoverPortal } from "../popover/popover.js";
import { DateFieldLabel, DateFieldDescription, DateFieldError } from "../date-field/date-field.js";
import {
  DateInputGroupPrefix,
  DateInputGroupSuffix,
} from "../date-input-group/date-input-group.js";
export type DatePickerRenderState = DateFieldRenderState & {
  state: ReturnType<typeof useDatePickerState>;
};
export type DatePickerRootProps<T extends DateValue = DateValue> = StyleXProps<
  DateFieldDOMProps<DatePickerRenderState>
> &
  Omit<DatePickerStateOptions<T>, "onOpenChange"> &
  Pick<
    Base.Root.Props,
    "open" | "onOpenChange" | "onOpenChangeComplete" | "modal" | "triggerId" | "defaultTriggerId"
  >;
export function DatePickerRoot<T extends DateValue = DateValue>(props: DatePickerRootProps<T>) {
  const { locale } = useLocale();
  const model = useDatePickerState({
    ...dateModelOptions(props),
    isOpen: props.open ?? props.isOpen,
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
  const scope = useDateFieldScope({ default: field }, props, model);
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
      "data-slot": props["data-slot"] ?? "date-picker",
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
          select(date) {
            model.setDateValue(date);
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
      </PickerDateContext>
    </DateFieldContext>
  );
}
export function DatePickerTrigger({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Base.Trigger>>) {
  const scope = useDateFieldContext();
  const { locale } = useLocale();
  const compiled = stylex.props(styles.trigger, xstyle);
  return (
    <Base.Trigger
      {...props}
      {...compiled}
      aria-label={
        props["aria-label"] ??
        (props["aria-labelledby"]
          ? undefined
          : locale.startsWith("zh")
            ? "选择日期"
            : "Choose date")
      }
      disabled={props.disabled ?? (scope.state.isDisabled || scope.state.isReadOnly)}
      data-slot={props["data-slot"] ?? "date-picker-trigger"}
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
      data-slot={props["data-slot"] ?? "date-picker-trigger-indicator"}
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

export type DatePickerPopoverProps = StyleXProps<ComponentPropsWithRef<typeof Base.Popup>> &
  Pick<
    Base.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "collisionPadding" | "collisionBoundary"
  > & {
    placement?:
      | "top"
      | "bottom"
      | "left"
      | "right"
      | "top start"
      | "top end"
      | "bottom start"
      | "bottom end";
  };
export function DatePickerPopover({
  children,
  placement = "bottom",
  side,
  align,
  sideOffset = 8,
  alignOffset,
  collisionPadding,
  collisionBoundary,
  xstyle,
  style,
  ...props
}: DatePickerPopoverProps) {
  const [placementSide, placementAlign] = placement.split(" ") as [
    "top" | "bottom" | "left" | "right",
    "start" | "end" | undefined,
  ];
  const compiled = stylex.props(
    materialStyles.root,
    styles.popover,
    materialStyles.accessible,
    xstyle,
  );
  return (
    <PopoverPortal>
      <Base.Positioner
        {...stylex.props(popoverStyles.positioner)}
        side={side ?? placementSide}
        align={align ?? placementAlign ?? "center"}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        collisionBoundary={collisionBoundary}
      >
        <Base.Popup
          {...props}
          {...compiled}
          data-slot={props["data-slot"] ?? "date-picker-popover"}
          data-material="glass-large"
          style={mergeStyle(compiled.style, style)}
        >
          <MaterialBackground variant="glass-large" liveBackdrop />
          {children}
        </Base.Popup>
      </Base.Positioner>
    </PopoverPortal>
  );
}
export function pickerEnterTransform(placement: string | null | undefined) {
  if (placement?.startsWith("top")) return "translateY(4px) scale(.95)";
  if (placement?.startsWith("bottom")) return "translateY(-4px) scale(.95)";
  if (placement?.startsWith("left")) return "translateX(4px) scale(.95)";
  if (placement?.startsWith("right")) return "translateX(-4px) scale(.95)";
  return "scale(.95)";
}

export function DatePickerDialog({
  render,
  ref,
  xstyle,
  style,
  ...props
}: StyleXProps<useRender.ComponentProps<"div">>) {
  const { locale } = useLocale();
  const compiled = stylex.props(styles.dialog, xstyle);
  return (
    <Base.Title
      {...props}
      {...compiled}
      ref={ref}
      render={render ?? <div />}
      aria-label={props["aria-label"] ?? (locale.startsWith("zh") ? "日历" : "Calendar")}
      data-slot={props["data-slot"] ?? "date-picker-dialog"}
      style={mergeStyle(compiled.style, style)}
    />
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
