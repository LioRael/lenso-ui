"use client";
// Modified: Base UI Field/Input/NumberField contracts and localized segmented date editing.
import * as React from "react";
import {
  createContext,
  use,
  useEffect,
  useRef,
  useId,
  useState,
  useMemo,
  type ComponentPropsWithRef,
  type ReactNode,
  type KeyboardEvent,
  type CSSProperties,
} from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import { Field } from "@base-ui/react/field";
import { NumberField } from "@base-ui/react/number-field";
import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
import type { DateSegment, DateFieldState } from "react-stately/useDateFieldState";
import * as stylex from "@stylexjs/stylex";
import { dateInputGroupStyles as styles } from "@lenso/tokens/date-input-group";
import { assignRef } from "../../utils/interaction/ref.js";
import { useFocusMethodRef } from "../../utils/interaction/focus-method.js";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useDateFieldContext } from "../../utils/date-field-state.js";
import { useLocale } from "../../utils/locale.js";
export type DateInputGroupRootProps = StyleXProps<useRender.ComponentProps<"div">> & {
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
  return useRender({
    defaultTagName: "div",
    render,
    ref: focusRef,
    props: mergeProps(compiled, props, {
      role: "group",
      "data-slot": props["data-slot"] ?? "date-input-group",
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
  });
}
type InputContext = {
  model: DateFieldState;
  inputId: string;
  elements: Map<string, HTMLElement>;
  focus: (type: string, delta: number) => void;
};
const InputModel = createContext<InputContext | null>(null);
export type DateInputGroupInputProps = StyleXProps<
  Omit<useRender.ComponentProps<"div">, "children" | "slot">
> & { slot?: "start" | "end"; children: (segment: DateSegment) => ReactNode };
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
  const proxy = useRef<HTMLElement>(null);
  const actions = useRef<Field.Root.Actions>(null);
  const [elements] = useState(() => new Map<string, HTMLElement>());
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
    if (next) elements.get(next.type)?.focus();
  };
  useEffect(() => {
    const input = proxy.current as HTMLInputElement | null;
    const form = input?.form;
    if (!form) return;
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (!event.defaultPrevented) model.setValue(model.defaultValue);
      });
    };
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [model]);
  const occurrences = new Map<string, number>();
  const segments = model.segments.map((segment) => {
    const ordinal = occurrences.get(segment.type) ?? 0;
    occurrences.set(segment.type, ordinal + 1);
    return { segment, key: `${segment.type}:${ordinal}` };
  });
  const compiled = stylex.props(styles.input, xstyle);
  const element = useRender({
    defaultTagName: "div",
    render,
    ref,
    props: mergeProps(compiled, props, {
      slot,
      "data-slot": props["data-slot"] ?? "date-input-group-input",
      style: mergeStyle(compiled.style, style),
      onFocusCapture(event: React.FocusEvent<HTMLDivElement>) {
        onFocusCapture?.(event);
        if (
          !(event.currentTarget.closest("[data-date-field-root]") ?? event.currentTarget).contains(
            event.relatedTarget,
          )
        ) {
          scope.setFocused(true);
          scope.options.onFocus?.(event);
          scope.options.onFocusChange?.(true);
        }
      },
      onBlurCapture(event: React.FocusEvent<HTMLDivElement>) {
        onBlurCapture?.(event);
        if (
          !(event.currentTarget.closest("[data-date-field-root]") ?? event.currentTarget).contains(
            event.relatedTarget,
          )
        ) {
          scope.setFocused(false);
          scope.options.onBlur?.(event);
          scope.options.onFocusChange?.(false);
          scope.commitValidation();
        }
      },
      children: (
        <InputModel value={{ model, inputId, elements, focus }}>
          {segments.map(({ segment, key }) => (
            <React.Fragment key={key}>{children(segment)}</React.Fragment>
          ))}
          <BaseInput
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
              actions.current?.validate();
              scope.commitValidation();
              if (first) elements.get(first)?.focus();
            }}
            onFocus={() => {
              if (first) elements.get(first)?.focus();
            }}
          />
        </InputModel>
      ),
    }),
  });
  return (
    <Field.Root
      actionsRef={actions}
      name={inputName}
      validate={() =>
        scope.validation?.realtimeValidation.validationErrors ??
        model.realtimeValidation.validationErrors
      }
      disabled={model.isDisabled}
      invalid={
        !!scope.options.isInvalid ||
        model.displayValidation.isInvalid ||
        !!scope.validation?.displayValidation.isInvalid
      }
      {...stylex.props(styles.segmentField)}
    >
      {element}
      <Field.Validity>
        {(value) => <DateValidityBridge value={value} inputId={inputId} />}
      </Field.Validity>
      <Field.Error
        {...stylex.props(styles.hiddenControl)}
        render={(props) => <DateErrorBridge {...props} inputId={inputId} />}
      />
    </Field.Root>
  );
}
export type DateInputGroupSegmentProps = StyleXProps<
  Omit<useRender.ComponentProps<"input">, "children" | "style">
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
  return useRender({
    defaultTagName: "span",
    render,
    ref: ref as React.Ref<HTMLSpanElement>,
    props: mergeProps(compiled, props, {
      "aria-hidden": true,
      "data-slot": props["data-slot"] ?? "date-input-group-segment",
      style: mergeStyle(compiled.style, style),
      children: segment.text,
    }),
  });
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
  const { locale, direction } = useLocale();
  const labelId = useId();
  const [focused, setFocused] = useState(false);
  if (!context) throw new Error("DateInputGroup.Segment requires DateInputGroup.Input");
  const { model, inputId, elements, focus } = context;
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
      event.preventDefault();
      focus(segment.type, (event.key === "ArrowRight" ? 1 : -1) * (direction === "rtl" ? -1 : 1));
      return;
    }
    if (model.isReadOnly) return;
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
      action(segment.type);
    } else if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      if (segment.isPlaceholder && event.key === "Backspace") focus(segment.type, -1);
      else model.clearSegment(segment.type);
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
    "data-slot": props["data-slot"] ?? "date-input-group-segment",
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
    if (node) elements.set(segment.type, node);
    else elements.delete(segment.type);
    const cleanup = assignRef(ref, node);
    return () => {
      elements.delete(segment.type);
      cleanup();
    };
  };
  const numeric = segment.type !== "dayPeriod" && segment.type !== "era";
  return (
    <Field.Root {...stylex.props(styles.segmentField)}>
      <span id={labelId} {...stylex.props(styles.hiddenControl)}>
        {label}
      </span>
      {numeric ? (
        <NumberField.Root
          value={segment.isPlaceholder ? null : segment.value}
          min={segment.minValue}
          max={segment.maxValue}
          step={1}
          disabled={disabled}
          readOnly={model.isReadOnly}
          locale={locale}
          format={{ useGrouping: false, minimumIntegerDigits: segment.text.length }}
          onValueChange={(value, details) => {
            if (value !== null) {
              model.setSegment(segment.type, value);
              if (
                details.reason === "input-change" &&
                segment.maxValue != null &&
                value * 10 > segment.maxValue
              )
                focus(segment.type, 1);
            } else model.clearSegment(segment.type);
          }}
          {...stylex.props(styles.segmentField)}
        >
          <NumberField.Input
            {...common}
            ref={register}
            render={render}
            aria-valuenow={segment.isPlaceholder ? undefined : (segment.value ?? undefined)}
            aria-valuemin={segment.minValue}
            aria-valuemax={segment.maxValue}
            aria-valuetext={segment.text}
            placeholder={segment.placeholder}
          />
        </NumberField.Root>
      ) : (
        <BaseInput
          {...common}
          ref={register}
          render={render}
          disabled={disabled}
          readOnly
          value={segment.text}
          aria-valuetext={segment.text}
        />
      )}
    </Field.Root>
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
      data-slot={props["data-slot"] ?? "date-input-group-input-container"}
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
      data-slot={props["data-slot"] ?? "date-input-group-prefix"}
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
      data-slot={props["data-slot"] ?? "date-input-group-suffix"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}

function DateValidityBridge({ value, inputId }: { value: Field.Validity.State; inputId: string }) {
  const { setNativeValidation } = useDateFieldContext();
  useEffect(() => {
    setNativeValidation((previous) =>
      previous[inputId] === value ? previous : { ...previous, [inputId]: value },
    );
  }, [setNativeValidation, inputId, value]);
  useEffect(
    () => () => {
      setNativeValidation((previous) => {
        const next = { ...previous };
        delete next[inputId];
        return next;
      });
    },
    [setNativeValidation, inputId],
  );
  return null;
}
function errorText(children: ReactNode): string {
  return React.Children.toArray(children)
    .map((child) =>
      React.isValidElement<{ children?: ReactNode }>(child)
        ? errorText(child.props.children)
        : typeof child === "string" || typeof child === "number"
          ? String(child)
          : "",
    )
    .filter(Boolean)
    .join(" ");
}
function DateErrorBridge({
  inputId,
  children,
  ...props
}: ComponentPropsWithRef<"div"> & { inputId: string }) {
  const { setNativeMessages } = useDateFieldContext();
  const text = errorText(children);
  useEffect(() => {
    setNativeMessages((previous) =>
      previous[inputId] === text ? previous : { ...previous, [inputId]: text },
    );
  }, [setNativeMessages, inputId, text]);
  useEffect(
    () => () => {
      setNativeMessages((previous) => {
        const next = { ...previous };
        delete next[inputId];
        return next;
      });
    },
    [setNativeMessages, inputId],
  );
  return (
    <div {...props} aria-hidden="true">
      {children}
    </div>
  );
}
