"use client";
// Modified: Base UI render/field contracts with internationalized date state.
import { useEffect, type ReactNode } from "react";
import { createCalendar } from "@internationalized/date";
import {
  useDateFieldState,
  type DateValue,
  type DateFieldProps,
} from "react-stately/useDateFieldState";
import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
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
  DateFieldProps<T> & { fullWidth?: boolean };
export function DateFieldRoot<T extends DateValue = DateValue>(props: DateFieldRootProps<T>) {
  const { locale } = useLocale();
  const model = useDateFieldState({ ...dateModelOptions(props), locale, createCalendar });
  const scope = useDateFieldScope({ default: model }, props);
  const presentation = { ...scope.state, state: model };
  const { xstyle, style, render, ref, children } = props;
  const compiled = stylex.props(styles.root, props.fullWidth && styles.fullWidth, xstyle);
  const element = useRender({
    defaultTagName: "div",
    ref,
    render,
    state: presentation,
    stateAttributesMapping: { state: () => null },
    props: mergeProps(compiled, dateDOMProps(props), {
      "data-slot": props["data-slot"] ?? "date-field",
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
  return <DateFieldContext value={scope}>{element}</DateFieldContext>;
}
export function DateFieldLabel({
  id,
  ref,
  render,
  xstyle,
  style,
  ...props
}: StyleXProps<useRender.ComponentProps<"label">>) {
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
  return useRender({
    defaultTagName: "label",
    ref,
    render,
    props: mergeProps(compiled, props, {
      id: labelId,
      htmlFor: props.htmlFor ?? scope.firstInputId,
      "data-slot": props["data-slot"] ?? "label",
      style: mergeStyle(compiled.style, style),
    }),
  });
}
export function DateFieldDescription({
  id,
  ref,
  render,
  xstyle,
  style,
  ...props
}: StyleXProps<useRender.ComponentProps<"div">>) {
  const scope = useDateFieldContext();
  const setDescriptionId = scope.setDescriptionId;
  useEffect(() => {
    if (id) setDescriptionId(id);
  }, [id, setDescriptionId]);
  const compiled = stylex.props(styles.description, scope.state.isInvalid && styles.hidden, xstyle);
  return useRender({
    defaultTagName: "div",
    ref,
    render,
    props: mergeProps(compiled, props, {
      id: id ?? scope.descriptionId,
      "data-slot": props["data-slot"] ?? "description",
      style: mergeStyle(compiled.style, style),
    }),
  });
}
export type DateFieldErrorRenderState =
  import("react-stately/useDateFieldState").DateFieldState["displayValidation"];
export function DateFieldError({
  children,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<useRender.ComponentProps<"div">, "children">> & {
  children?: ReactNode | ((state: DateFieldErrorRenderState) => ReactNode);
}) {
  const scope = useDateFieldContext();
  const setErrorId = scope.setErrorId;
  useEffect(() => {
    if (props.id) setErrorId(props.id);
  }, [props.id, setErrorId]);
  const modelValidation =
    scope.validation?.displayValidation ?? scope.models.default.displayValidation;
  const nativeValidity = Object.values(scope.nativeValidation).find(
    (value) => value.validity.valid === false,
  );
  const messages = Object.values(scope.nativeMessages).filter(Boolean);
  const validation = {
    ...modelValidation,
    isInvalid: scope.state.isInvalid,
    validationErrors: messages.length ? messages : modelValidation.validationErrors,
    validationDetails: nativeValidity
      ? { ...nativeValidity.validity, valid: nativeValidity.validity.valid ?? true }
      : modelValidation.validationDetails,
  };
  const compiled = stylex.props(styles.error, !scope.state.isInvalid && styles.hidden, xstyle);
  const { ref, render, ...rest } = props;
  return useRender({
    defaultTagName: "div",
    ref,
    render,
    props: mergeProps(compiled, rest, {
      id: props.id ?? scope.errorId,
      children:
        typeof children === "function"
          ? children({ ...validation, isInvalid: scope.state.isInvalid })
          : (children ?? validation.validationErrors.join(" ")),
      "data-slot": props["data-slot"] ?? "field-error",
      style: mergeStyle(compiled.style, style),
    }),
  });
}
