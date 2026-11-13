"use client";
import {
  createContext,
  use,
  useId,
  useState,
  type CSSProperties,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { DateFieldState, DateFieldProps, DateValue } from "react-stately/useDateFieldState";
import type { ModelControlHandle } from "./model-control.js";
import type { PartProps } from "@ui-sdk/react/primitive";
export type DateFieldRenderState = {
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  isInvalid: boolean;
  isFocusWithin: boolean;
};
export type DateFieldDOMProps<State extends DateFieldRenderState = DateFieldRenderState> = Omit<
  PartProps<"div", State>,
  "children" | "style" | "onChange" | "defaultValue" | "onFocus" | "onBlur"
> & {
  children?: ReactNode | ((state: State) => ReactNode);
  style?: CSSProperties | ((state: State) => CSSProperties | undefined);
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  form?: string;
};
export type DateFieldOptions = Pick<
  DateFieldProps<DateValue>,
  | "isDisabled"
  | "isReadOnly"
  | "isRequired"
  | "isInvalid"
  | "onFocus"
  | "onBlur"
  | "onFocusChange"
  | "autoFocus"
> & {
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  form?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  startName?: string;
  endName?: string;
};
type NativeValidation = Record<string, { valid: boolean; message: string; details: ValidityState }>;
type Models = { default: DateFieldState; start?: DateFieldState; end?: DateFieldState };
type Validation = Pick<
  DateFieldState,
  "displayValidation" | "realtimeValidation" | "commitValidation"
>;
export type DateFieldScope = {
  models: Models;
  options: DateFieldOptions;
  control: ModelControlHandle;
  nativeValidation: NativeValidation;
  setNativeValidation: Dispatch<SetStateAction<NativeValidation>>;
  validation: Validation | undefined;
  commitValidation(): void;
  id: string;
  labelId: string;
  descriptionId: string;
  errorId: string;
  firstInputId: string;
  setLabelId: Dispatch<SetStateAction<string>>;
  setDescriptionId: Dispatch<SetStateAction<string>>;
  setErrorId: Dispatch<SetStateAction<string>>;
  setFocused: Dispatch<SetStateAction<boolean>>;
  state: DateFieldRenderState;
};
export const DateFieldContext = createContext<DateFieldScope | null>(null);
export function useDateFieldContext() {
  const context = use(DateFieldContext);
  if (!context) throw new Error("Date/time parts require a DateField, TimeField or date picker");
  return context;
}
export function useDateFieldScope(
  models: { default: DateFieldState; start?: DateFieldState; end?: DateFieldState },
  options: DateFieldOptions,
  validation:
    | Pick<DateFieldState, "displayValidation" | "realtimeValidation" | "commitValidation">
    | undefined,
  control: ModelControlHandle,
): DateFieldScope {
  const id = useId();
  const [nativeValidation, setNativeValidation] = useState<
    Record<string, { valid: boolean; message: string; details: ValidityState }>
  >({});
  const [labelId, setLabelId] = useState(`${id}-label`);
  const [descriptionId, setDescriptionId] = useState(`${id}-description`);
  const [errorId, setErrorId] = useState(`${id}-error`);
  const [focused, setFocused] = useState(false);
  const model = models.default;
  const state: DateFieldRenderState = {
    isDisabled: !!(options.disabled ?? options.isDisabled),
    isReadOnly: !!(options.readOnly ?? options.isReadOnly),
    isRequired: !!(options.required ?? options.isRequired),
    isInvalid:
      !!options.isInvalid ||
      !!validation?.displayValidation.isInvalid ||
      Object.values(nativeValidation).some((value) => !value.valid) ||
      Object.values(models).some((state) => state.displayValidation.isInvalid),
    isFocusWithin: focused,
  };
  return {
    models,
    control,
    options,
    nativeValidation,
    setNativeValidation,
    validation,
    commitValidation() {
      Object.values(models).forEach((model) => model.commitValidation());
      validation?.commitValidation();
    },
    id,
    labelId,
    setLabelId,
    setFocused,
    state,
    descriptionId,
    setDescriptionId,
    errorId,
    setErrorId,
    firstInputId: `${id}-${models.start ? "start" : "default"}-${model.segments.find((segment) => segment.isEditable)?.type ?? "year"}`,
  };
}
// Date model options must not leak onto the rendered native container.
export function dateDOMProps(props: object) {
  const excluded = new Set([
    "disabled",
    "readOnly",
    "required",
    "value",
    "controller",
    "onValueChange",
    "defaultValue",
    "onChange",
    "minValue",
    "maxValue",
    "isDateUnavailable",
    "placeholderValue",
    "hourCycle",
    "granularity",
    "hideTimeZone",
    "shouldForceLeadingZeros",
    "validationBehavior",
    "validationState",
    "validate",
    "isInvalid",
    "isDisabled",
    "isReadOnly",
    "isRequired",
    "name",
    "startName",
    "endName",
    "form",
    "autoFocus",
    "onFocus",
    "onBlur",
    "onFocusChange",
    "isOpen",
    "defaultOpen",
    "open",
    "onOpenChange",
    "onOpenChangeComplete",
    "modal",
    "shouldCloseOnSelect",
    "pageBehavior",
    "firstDayOfWeek",
    "calendarProps",
    "fullWidth",
    "xstyle",
    "style",
    "children",
    "render",
    "ref",
  ]);
  return Object.fromEntries(Object.entries(props).filter(([key]) => !excluded.has(key)));
}

export function dateModelOptions<
  T extends {
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    isDisabled?: boolean;
    isReadOnly?: boolean;
    isRequired?: boolean;
  },
>(props: T) {
  return {
    ...props,
    isDisabled: props.disabled ?? props.isDisabled,
    isReadOnly: props.readOnly ?? props.isReadOnly,
    isRequired: props.required ?? props.isRequired,
  };
}
