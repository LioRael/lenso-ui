"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX and local RAC parts. */
import {
  createContext,
  use,
  useRef,
  useEffect,
  useState,
  useCallback,
  type ComponentPropsWithRef,
  type CSSProperties,
} from "react";
import { DatePicker as Primitive, Popover } from "react-aria-components/DatePicker";
import type { DateValue } from "react-aria-components/Calendar";
import { Button } from "react-aria-components/Button";
import { Dialog } from "react-aria-components/Dialog";
import * as stylex from "@stylexjs/stylex";
import { datePickerStyles as styles } from "@lenso/tokens/date-picker";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";
import { racPart } from "../date-input-group/rac-part.js";
import { DateFieldLabel, DateFieldDescription, DateFieldError } from "../date-field/date-field.js";
import {
  DateInputGroupPrefix,
  DateInputGroupSuffix,
} from "../date-input-group/date-input-group.js";

export const PickerTriggerContext = createContext<(node: HTMLButtonElement | null) => void>(
  () => {},
);
export type DatePickerRootProps<T extends DateValue> = StyleXProps<
  ComponentPropsWithRef<typeof Primitive<T>>
>;
export function usePickerFocusRestore(onOpenChange?: (open: boolean) => void) {
  const trigger = useRef<HTMLButtonElement | null>(null);
  const setTrigger = useCallback((node: HTMLButtonElement | null) => {
    trigger.current = node;
  }, []);
  const keyboard = useRef(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const track = (event: KeyboardEvent) => {
      if (!event.metaKey && !event.ctrlKey && !event.altKey) keyboard.current = true;
    };
    window.addEventListener("keydown", track, true);
    return () => window.removeEventListener("keydown", track, true);
  }, [open]);
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && keyboard.current) requestAnimationFrame(() => trigger.current?.focus());
    keyboard.current = false;
    onOpenChange?.(next);
  };
  return { setTrigger, handleOpenChange };
}
export function DatePickerRoot<T extends DateValue>({
  onOpenChange,
  xstyle,
  style,
  ...props
}: DatePickerRootProps<T>) {
  const { setTrigger, handleOpenChange } = usePickerFocusRestore(onOpenChange);
  const compiled = stylex.props(styles.root, xstyle);
  return (
    <PickerTriggerContext value={setTrigger}>
      <Primitive<T>
        {...props}
        {...compiled}
        data-slot="date-picker"
        data-required={props.isRequired || undefined}
        style={mergeStyle(compiled.style, style)}
        onOpenChange={handleOpenChange}
      />
    </PickerTriggerContext>
  );
}
const Trigger = racPart(
  Button,
  "date-picker-trigger",
  (state: { isFocusVisible: boolean; isDisabled: boolean }) => [
    styles.trigger,
    state.isFocusVisible && styles.focused,
    state.isDisabled && styles.disabled,
  ],
);
export function DatePickerTrigger({
  ref,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Button>>) {
  const trigger = use(PickerTriggerContext);
  const mergedRef = useCallback(
    (node: HTMLButtonElement | null) => {
      trigger(node);
      if (typeof ref === "function") return ref(node);
      if (ref) ref.current = node;
    },
    [ref, trigger],
  );
  return <Trigger {...props} ref={mergedRef} />;
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
const Overlay = racPart(
  Popover,
  "date-picker-popover",
  (state: { isEntering: boolean; isExiting: boolean }) => [
    styles.popover,
    state.isEntering && styles.entering,
    state.isExiting && styles.exiting,
  ],
);
export function DatePickerPopover({
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Popover>>) {
  const container = useThemePortalContainer();
  return (
    <Overlay
      placement="bottom"
      UNSTABLE_portalContainer={container ?? undefined}
      {...props}
      style={(state) =>
        ({
          "--picker-enter-from": pickerEnterTransform(state.placement),
          ...(typeof style === "function" ? style(state) : style),
        }) as CSSProperties
      }
    />
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
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Dialog>>) {
  const compiled = stylex.props(styles.dialog, xstyle);
  return (
    <Dialog
      {...props}
      {...compiled}
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
