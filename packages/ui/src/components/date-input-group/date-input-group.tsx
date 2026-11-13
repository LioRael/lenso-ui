"use client";
// Modified: UI SDK Field/Input/NumberField contracts and localized segmented date editing.
import * as React from "react";
import {
  createContext,
  use,
  useEffect,
  useLayoutEffect,
  useRef,
  useId,
  useState,
  useMemo,
  type ComponentPropsWithRef,
  type ReactNode,
  type KeyboardEvent,
  type CSSProperties,
} from "react";
import { Input as SdkInput } from "@ui-sdk/react/input";
import { NumberInput, NumberInputControl } from "@ui-sdk/react/number-input";
import { renderElement, type PartProps } from "@ui-sdk/react/primitive";
import { mergeProps } from "@ui-sdk/react/primitive";
import type { DateSegment, DateFieldState } from "react-stately/useDateFieldState";
import * as stylex from "@stylexjs/stylex";
import { dateInputGroupStyles as styles } from "@lenso/tokens/date-input-group";
import { assignRef } from "../../utils/interaction/ref.js";
import { useFocusMethodRef } from "../../utils/interaction/focus-method.js";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useDateFieldContext } from "../../utils/date-field-state.js";
import { useLocale } from "../../utils/locale.js";
export type DateInputGroupRootProps = StyleXProps<PartProps<"div">> & {
  fullWidth?: boolean;
  variant?: "primary" | "secondary";
};
export function DateInputGroupRoot({
  fullWidth,
  variant = "primary",
  ref,
  render,
  xstyle,
  style,
  onPointerDown,
  ...props
}: DateInputGroupRootProps) {
  const scope = useDateFieldContext();
  const focusRef = useFocusMethodRef(ref);
  const compiled = stylex.props(
    styles.root,
    variant === "secondary" && styles.secondary,
    scope.state.isDisabled && styles.disabled,
    scope.state.isInvalid && styles.invalid,
    fullWidth && styles.fullWidth,
    xstyle,
  );
  return renderElement(
    "div",
    {
      ...mergeProps(compiled, props, {
        role: "group",
        "data-lenso-slot": props["data-lenso-slot"] ?? "date-input-group",
        "data-disabled": scope.state.isDisabled || undefined,
        "data-invalid": scope.state.isInvalid || undefined,
        style: mergeStyle(compiled.style, style),
        onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
          onPointerDown?.(event);
          if (
            !event.defaultPrevented &&
            !scope.state.isDisabled &&
            event.target instanceof Element &&
            !event.target.closest("input,button,a[href],[tabindex]")
          )
            event.currentTarget
              .querySelector<HTMLElement>("[data-date-segment]:not(:disabled)")
              ?.focus();
        },
      }),
      ref: focusRef,
    },
    render,
  );
}
type InputContext = {
  model: DateFieldState;
  inputId: string;
  bind: (node: HTMLElement, key: string) => () => void;
  focus: (type: string, delta: number) => void;
};
const InputModel = createContext<InputContext | null>(null);
export type DateInputGroupInputProps = StyleXProps<Omit<PartProps<"div">, "children" | "slot">> & {
  slot?: "start" | "end";
  children: (segment: DateSegment) => ReactNode;
};
export function DateInputGroupInput({
  slot,
  children,
  ref,
  render,
  xstyle,
  style,
  onFocusCapture,
  onBlurCapture,
  ...props
}: DateInputGroupInputProps) {
  const scope = useDateFieldContext();
  const model = slot ? scope.models[slot] : scope.models.default;
  if (!model) throw new Error(`DateInputGroup.Input has no ${slot} date model`);
  return (
    <DateInputModel
      model={model}
      slot={slot}
      {...props}
      ref={ref}
      render={render}
      xstyle={xstyle}
      style={style}
      onFocusCapture={onFocusCapture}
      onBlurCapture={onBlurCapture}
    >
      {children}
    </DateInputModel>
  );
}
function DateInputModel({
  model,
  slot,
  children,
  ref,
  render,
  xstyle,
  style,
  onFocusCapture,
  onBlurCapture,
  ...props
}: DateInputGroupInputProps & { model: DateFieldState }) {
  const scope = useDateFieldContext();
  const proxy = useRef<HTMLInputElement>(null);
  const inputId = `${scope.id}-${slot ?? "default"}`;
  const inputName =
    slot === "start"
      ? scope.options.startName
      : slot === "end"
        ? scope.options.endName
        : scope.options.name;
  const first = model.segments.find((segment) => segment.isEditable)?.type;
  const focus = (type: string, delta: number) => {
    const editable = model.segments.filter((segment) => segment.isEditable);
    const next = editable[editable.findIndex((segment) => segment.type === type) + delta];
    if (next) scope.control.api.focus(`${inputId}-${next.type}`);
  };
  useEffect(() => {
    const input = proxy.current as HTMLInputElement | null;
    const form = input?.form;
    if (!form) return;
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (!event.defaultPrevented) scope.control.api.reset();
      });
    };
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [scope.control, scope.options.form, inputName]);
  const validationMessage = (
    scope.validation?.realtimeValidation.validationErrors ??
    model.realtimeValidation.validationErrors
  ).join("\n");
  const publishValidity = () => {
    const input = proxy.current as HTMLInputElement | null;
    if (!input) return;
    const next = {
      valid: input.validity.valid,
      message: input.validationMessage,
      details: input.validity,
    };
    scope.setNativeValidation((previous) =>
      previous[inputId]?.valid === next.valid && previous[inputId]?.message === next.message
        ? previous
        : { ...previous, [inputId]: next },
    );
  };
  useLayoutEffect(() => {
    const input = proxy.current as HTMLInputElement | null;
    if (!input) return;
    input.setCustomValidity(validationMessage);
    if (scope.nativeValidation[inputId]) publishValidity();
  });
  const setNativeValidation = scope.setNativeValidation;
  useEffect(
    () => () =>
      setNativeValidation((previous) => {
        const next = { ...previous };
        delete next[inputId];
        return next;
      }),
    [setNativeValidation, inputId],
  );
  const occurrences = new Map<string, number>();
  const segments = model.segments.map((segment) => {
    const ordinal = occurrences.get(segment.type) ?? 0;
    occurrences.set(segment.type, ordinal + 1);
    return { segment, key: `${segment.type}:${ordinal}` };
  });
  const compiled = stylex.props(styles.input, xstyle);
  const element = renderElement(
    "div",
    // oxlint-disable-next-line react/refs -- SDK renderElement forwards refs; it does not read them.
    {
      "data-agent-hidden": "",
      ...mergeProps(compiled, props, {
        slot,
        "data-lenso-slot": props["data-lenso-slot"] ?? "date-input-group-input",
        style: mergeStyle(compiled.style, style),
        onFocusCapture(event: React.FocusEvent<HTMLDivElement>) {
          onFocusCapture?.(event);
          if (
            !(
              event.currentTarget.closest("[data-date-field-root]") ?? event.currentTarget
            ).contains(event.relatedTarget)
          ) {
            scope.setFocused(true);
            scope.options.onFocus?.(event);
            scope.options.onFocusChange?.(true);
          }
        },
        onBlurCapture(event: React.FocusEvent<HTMLDivElement>) {
          onBlurCapture?.(event);
          if (
            !(
              event.currentTarget.closest("[data-date-field-root]") ?? event.currentTarget
            ).contains(event.relatedTarget)
          ) {
            scope.setFocused(false);
            scope.options.onBlur?.(event);
            scope.options.onFocusChange?.(false);
            scope.commitValidation();
          }
        },
        children: (
          <InputModel
            value={{
              model,
              inputId,
              bind: (node, key) => scope.control.api.bind(node, key, model.isDisabled),
              focus,
            }}
          >
            {segments.map(({ segment, key }) => (
              <React.Fragment key={key}>{children(segment)}</React.Fragment>
            ))}
            <SdkInput
              ref={proxy}
              {...stylex.props(styles.hiddenControl)}
              type="text"
              tabIndex={-1}
              aria-hidden="true"
              autoComplete="off"
              name={inputName}
              form={scope.options.form}
              value={
                model.value
                  ? "timeValue" in model
                    ? String(model.timeValue)
                    : model.value.toString()
                  : ""
              }
              required={model.isRequired}
              disabled={model.isDisabled}
              onValueChange={() => {}}
              onInvalid={(event) => {
                event.preventDefault();
                publishValidity();
                scope.commitValidation();
                if (first) scope.control.api.focus(`${inputId}-${first}`);
              }}
              onFocus={() => {
                if (first) scope.control.api.focus(`${inputId}-${first}`);
              }}
            />
          </InputModel>
        ),
      }),
      ref: ref,
    },
    render,
  );
  return element;
}
export type DateInputGroupSegmentProps = StyleXProps<
  Omit<PartProps<"input">, "children" | "style" | "value" | "defaultValue">
> & { segment: DateSegment; children?: ReactNode; style?: CSSProperties };
export function DateInputGroupSegment({ segment, ...props }: DateInputGroupSegmentProps) {
  return segment.isEditable ? (
    <EditableSegment segment={segment} {...props} />
  ) : (
    <LiteralSegment segment={segment} {...props} />
  );
}
function LiteralSegment({
  segment,
  ref,
  render,
  xstyle,
  style,
  ...props
}: DateInputGroupSegmentProps) {
  const compiled = stylex.props(styles.segment, styles.literal, xstyle);
  return renderElement(
    "span",
    {
      ...mergeProps(compiled, props, {
        "aria-hidden": true,
        "data-lenso-slot": props["data-lenso-slot"] ?? "date-input-group-segment",
        style: mergeStyle(compiled.style, style),
        children: segment.text,
      }),
      ref: ref as React.Ref<HTMLSpanElement>,
    },
    render,
  );
}
function EditableSegment({
  segment,
  ref,
  render,
  xstyle,
  style,
  onKeyDown,
  onFocus,
  onBlur,
  ...props
}: DateInputGroupSegmentProps) {
  const context = use(InputModel);
  const scope = useDateFieldContext();
  const { locale } = useLocale();
  const labelId = useId();
  const [focused, setFocused] = useState(false);
  if (!context) throw new Error("DateInputGroup.Segment requires DateInputGroup.Input");
  const { model, inputId, bind, focus } = context;
  const compiled = stylex.props(
    styles.segment,
    styles.segmentInput,
    segment.isPlaceholder && styles.placeholder,
    focused && styles.segmentFocused,
    scope.state.isInvalid && styles.segmentInvalid,
    focused && scope.state.isInvalid && styles.segmentInvalidFocused,
    xstyle,
  );
  const disabled = model.isDisabled;
  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      scope.control.api.navigate(event.nativeEvent);
      return;
    }
    if (model.isReadOnly) return;
    if (segment.type === "dayPeriod" && /^[ap]$/i.test(event.key)) {
      event.preventDefault();
      scope.control.api.run(
        () =>
          model.setSegment(
            segment.type,
            event.key.toLowerCase() === "a" ? segment.minValue! : segment.maxValue!,
          ),
        { reason: "input-change", event: event.nativeEvent },
      );
      return;
    }
    const action = {
      ArrowUp: model.increment,
      ArrowDown: model.decrement,
      PageUp: model.incrementPage,
      PageDown: model.decrementPage,
      Home: model.decrementToMin,
      End: model.incrementToMax,
    }[event.key];
    if (action) {
      event.preventDefault();
      scope.control.api.run(() => action(segment.type), {
        reason: "step-key",
        event: event.nativeEvent,
      });
    } else if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      if (segment.isPlaceholder && event.key === "Backspace") focus(segment.type, -1);
      else
        scope.control.api.run(() => model.clearSegment(segment.type), {
          reason: "input-change",
          event: event.nativeEvent,
        });
    }
  };
  const nameFormatter = useMemo(
    () => new Intl.DisplayNames(locale, { type: "dateTimeField" }),
    [locale],
  );
  const label = nameFormatter.of(segment.type) ?? segment.type;
  const common = {
    ...props,
    ...compiled,
    id: props.id ?? `${inputId}-${segment.type}`,
    "data-lenso-slot": props["data-lenso-slot"] ?? "date-input-group-segment",
    "data-date-segment": segment.type,
    role: "spinbutton" as const,
    autoFocus:
      scope.options.autoFocus &&
      model.segments.find((part) => part.isEditable)?.type === segment.type,
    "aria-label": props["aria-label"] ?? label,
    "aria-labelledby": `${labelId} ${scope.options["aria-labelledby"] ?? scope.labelId}`,
    "aria-describedby":
      scope.options["aria-describedby"] ?? `${scope.descriptionId} ${scope.errorId}`,
    "aria-invalid": scope.state.isInvalid || undefined,
    "aria-required": model.isRequired || undefined,
    style: {
      ...compiled.style,
      width: `${Math.max(segment.text.length, segment.placeholder.length)}ch`,
      ...style,
    },
    onFocus(event: React.FocusEvent<HTMLInputElement>) {
      setFocused(true);
      onFocus?.(event);
      event.currentTarget.select();
    },
    onBlur(event: React.FocusEvent<HTMLInputElement>) {
      setFocused(false);
      onBlur?.(event);
    },
    onKeyDown: keyDown,
  };
  const register = (node: HTMLInputElement | null) => {
    const unbind = node ? bind(node, `${inputId}-${segment.type}`) : undefined;
    const cleanup = assignRef(ref, node);
    return () => {
      unbind?.();
      cleanup();
    };
  };
  const numeric = segment.type !== "dayPeriod" && segment.type !== "era";
  return (
    <>
      <span id={labelId} {...stylex.props(styles.hiddenControl)}>
        {label}
      </span>
      {numeric ? (
        <NumberInput
          value={segment.isPlaceholder ? null : segment.value}
          min={segment.minValue}
          max={segment.maxValue}
          step={1}
          disabled={disabled}
          readOnly={model.isReadOnly}
          locale={locale}
          format={{ useGrouping: false, minimumIntegerDigits: segment.text.length }}
          onValueChange={(value, details) => {
            const accepted = scope.control.api.run(
              () => {
                if (value !== null) {
                  model.setSegment(segment.type, value);
                  if (
                    details.reason === "input-change" &&
                    segment.maxValue != null &&
                    value * 10 > segment.maxValue
                  )
                    focus(segment.type, 1);
                } else model.clearSegment(segment.type);
              },
              {
                reason: details.reason === "input-change" ? "input-change" : "step-key",
                ...(details.event ? { event: details.event } : {}),
              },
            );
            if (accepted === false) details.cancel();
          }}
          {...stylex.props(styles.segmentField)}
        >
          <NumberInputControl
            {...common}
            ref={register}
            render={render}
            aria-valuenow={segment.isPlaceholder ? undefined : (segment.value ?? undefined)}
            aria-valuemin={segment.minValue}
            aria-valuemax={segment.maxValue}
            aria-valuetext={segment.text}
            placeholder={segment.placeholder}
          />
        </NumberInput>
      ) : (
        <SdkInput
          {...common}
          ref={register}
          render={render}
          disabled={disabled}
          readOnly
          value={segment.text}
          aria-valuetext={segment.text}
        />
      )}
    </>
  );
}
export function DateInputGroupInputContainer({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(styles.inputContainer, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      data-lenso-slot={props["data-lenso-slot"] ?? "date-input-group-input-container"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
export function DateInputGroupPrefix({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(styles.prefix, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      data-lenso-slot={props["data-lenso-slot"] ?? "date-input-group-prefix"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
export function DateInputGroupSuffix({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(styles.suffix, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      data-lenso-slot={props["data-lenso-slot"] ?? "date-input-group-suffix"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
