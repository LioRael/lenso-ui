"use client";
// Modified: Base UI segmented inputs and pure internationalized time state.
import {
  useTimeFieldState,
  type TimeValue,
  type TimePickerProps,
} from "react-stately/useTimeFieldState";
import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
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
  TimePickerProps<T> & { fullWidth?: boolean };
export function TimeFieldRoot<T extends TimeValue = TimeValue>(props: TimeFieldRootProps<T>) {
  const { locale } = useLocale();
  const model = useTimeFieldState({ ...dateModelOptions(props), locale });
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
      "data-slot": props["data-slot"] ?? "time-field",
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
export {
  DateFieldLabel as TimeFieldLabel,
  DateFieldDescription as TimeFieldDescription,
  DateFieldError as TimeFieldError,
} from "../date-field/date-field.js";
