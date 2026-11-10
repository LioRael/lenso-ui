import { createContext, useCallback, useContext, useMemo } from "react";
import { View } from "react-native";
import { NativeStyle } from "./styles";
import { SelectionControl } from "./selection-control";
import { useValue } from "./use-value";
import { toggleSelection } from "./choice-model";
import type {
  CheckboxGroupProps,
  RadioGroupProps,
  SelectionGroupProps,
  SelectionProps,
  ToggleButtonProps,
} from "./types";

interface GroupState {
  values: readonly string[];
  disabled: boolean;
  readOnly: boolean;
  change: (value: string, checked: boolean) => void;
}
const CheckboxContext = createContext<GroupState | null>(null);
const RadioContext = createContext<GroupState | null>(null);
const ToggleContext = createContext<GroupState | null>(null);

function Group({
  children,
  orientation = "vertical",
  xstyle,
  style,
  ...props
}: SelectionGroupProps) {
  return (
    <NativeStyle xstyle={xstyle} style={style}>
      {(resolved, native) => (
        <View
          {...native}
          {...props}
          style={[
            { flexDirection: orientation === "horizontal" ? "row" : "column", gap: 4 },
            resolved,
          ]}
        >
          {children}
        </View>
      )}
    </NativeStyle>
  );
}
function useSelection(props: SelectionProps, group: GroupState | null) {
  const [local, change] = useValue(
    props.checked,
    props.defaultChecked ?? false,
    props.onCheckedChange,
  );
  const key = props.value ?? "";
  if (group && !key) throw new Error("Selection group children require a nonempty value.");
  const checked = group ? group.values.includes(key) : local;
  const disabled = props.disabled === true || group?.disabled === true;
  const readOnly = props.readOnly === true || group?.readOnly === true;
  return {
    checked,
    disabled: disabled || readOnly,
    onPress: () => {
      if (disabled || readOnly) return;
      if (group) group.change(key, !checked);
      else change(!checked);
    },
  };
}
export function Checkbox(props: SelectionProps) {
  const group = useContext(CheckboxContext);
  const selection = useSelection(props, group);
  const {
    checked: _checked,
    defaultChecked: _default,
    onCheckedChange: _change,
    value: _value,
    readOnly: _readOnly,
    ...rest
  } = props;
  return <SelectionControl {...rest} {...selection} kind="checkbox" />;
}
export function Radio(props: SelectionProps & { value: string }) {
  const group = useContext(RadioContext);
  if (!group) throw new Error("Radio must be inside RadioGroup.");
  const selection = useSelection(props, group);
  const {
    checked: _checked,
    defaultChecked: _default,
    onCheckedChange: _change,
    value: _value,
    readOnly: _readOnly,
    ...rest
  } = props;
  return <SelectionControl {...rest} {...selection} kind="radio" />;
}
export function ToggleButton({
  pressed,
  defaultPressed,
  onPressedChange,
  ...props
}: ToggleButtonProps) {
  const group = useContext(ToggleContext);
  const selection = useSelection(
    {
      ...props,
      checked: pressed,
      defaultChecked: defaultPressed,
      onCheckedChange: onPressedChange,
    },
    group,
  );
  const { value: _value, readOnly: _readOnly, ...rest } = props;
  return <SelectionControl {...rest} {...selection} kind="toggle" />;
}
function MultiGroup({
  context,
  value,
  defaultValue = [],
  onValueChange,
  disabled = false,
  readOnly = false,
  ...props
}: CheckboxGroupProps & { context: typeof CheckboxContext }) {
  const notify = useCallback(
    (next: readonly string[]) => onValueChange?.([...next]),
    [onValueChange],
  );
  const [current, change] = useValue<readonly string[]>(value, defaultValue, notify);
  const state = useMemo<GroupState>(
    () => ({
      values: current,
      disabled,
      readOnly,
      change: (key, checked) => {
        if (!disabled && !readOnly) change(toggleSelection(current, key, checked));
      },
    }),
    [current, disabled, readOnly, change],
  );
  return (
    <context.Provider value={state}>
      <Group {...props} />
    </context.Provider>
  );
}
export function CheckboxGroup(props: CheckboxGroupProps) {
  return <MultiGroup {...props} context={CheckboxContext} />;
}
export function ToggleButtonGroup(props: CheckboxGroupProps) {
  return <MultiGroup orientation="horizontal" {...props} context={ToggleContext} />;
}
export function RadioGroup({
  value,
  defaultValue = null,
  onValueChange,
  disabled = false,
  readOnly = false,
  ...props
}: RadioGroupProps) {
  const notify = useCallback(
    (next: string | null) => {
      if (next !== null) onValueChange?.(next);
    },
    [onValueChange],
  );
  const [current, change] = useValue<string | null>(value, defaultValue, notify);
  const state = useMemo<GroupState>(
    () => ({
      values: current === null ? [] : [current],
      disabled,
      readOnly,
      change: (key, checked) => {
        if (checked && !disabled && !readOnly) change(key);
      },
    }),
    [current, disabled, readOnly, change],
  );
  return (
    <RadioContext.Provider value={state}>
      <Group {...props} accessibilityRole="radiogroup" />
    </RadioContext.Provider>
  );
}
