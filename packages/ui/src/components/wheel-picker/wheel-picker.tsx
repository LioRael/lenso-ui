"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import * as stylex from "@stylexjs/stylex";
import { wheelPickerStyles as s } from "@lenso/tokens/wheel-picker";
import { ListBox } from "../list-box/index.js";
import type { StyleXProps } from "../../utils/styled.js";

export interface WheelPickerOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export type WheelPickerProps = Omit<
  StyleXProps<ComponentProps<"div">>,
  "children" | "defaultValue" | "onChange"
> & {
  options: readonly WheelPickerOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  form?: string;
  emptyLabel?: string;
};

export function WheelPicker({
  options,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  name,
  form,
  emptyLabel = "No options",
  "aria-label": label,
  "aria-labelledby": labelledBy,
  onScroll,
  onScrollEnd,
  onKeyDown,
  xstyle,
  style,
  ...props
}: WheelPickerProps) {
  const [localValue, setLocalValue] = useState(defaultValue);
  const [settlement, setSettlement] = useState(0);
  const selected =
    options.find((option) => !option.disabled && option.value === (value ?? localValue)) ??
    options.find((option) => !option.disabled);
  const viewport = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const accepted = useRef(selected?.value);
  const paint = useCallback(() => {
    const view = viewport.current;
    if (!view) return;
    const nodes = [...view.querySelectorAll<HTMLElement>('[role="option"]')];
    const rowHeight = nodes[0]?.offsetHeight;
    if (!rowHeight) return;
    // Fit to the measured 32pt slots / 34pt band of the device reference.
    // Project labels only: native scroll positions and option semantics stay linear.
    const radius = rowHeight * 2.8125;
    const center = view.scrollTop + view.clientHeight / 2;
    const poses = nodes.map((node) => ({
      label: node.querySelector<HTMLElement>("[data-wheel-label]"),
      distance: node.offsetTop + node.offsetHeight / 2 - center,
    }));
    for (const { label, distance } of poses) {
      if (!label) continue;
      const angle = distance / radius;
      const visible = Math.abs(angle) < Math.PI / 2;
      label.style.visibility = visible ? "visible" : "hidden";
      if (!visible) continue;
      const emphasis = Math.max(0, 1 - Math.abs(distance) / rowHeight);
      label.style.transform = `translateY(${radius * Math.sin(angle) - distance}px) rotateX(${-angle}rad) scale(${1 + 0.15 * emphasis})`;
      label.style.opacity = String(0.4 + 0.6 * emphasis);
    }
  }, []);
  const choose = (next: string) => {
    if (
      disabled ||
      next === selected?.value ||
      options.find((option) => option.value === next)?.disabled
    )
      return;
    if (value === undefined) setLocalValue(next);
    onValueChange?.(next);
  };
  const align = useCallback(() => {
    const index = options.findIndex((option) => option.value === accepted.current);
    const view = viewport.current;
    const item = view?.querySelectorAll<HTMLElement>('[role="option"]')[index];
    if (view && item) {
      const top = item.offsetTop - (view.clientHeight - item.offsetHeight) / 2;
      // Leave an already centered native snap undisturbed.
      if (Math.abs(view.scrollTop - top) > 0.5) view.scrollTop = top;
    }
    paint();
  }, [options, paint]);
  useLayoutEffect(() => {
    clearTimeout(timer.current);
    accepted.current = selected?.value;
    align();
  }, [selected?.value, align, disabled, settlement]);
  useEffect(() => {
    const resize = new ResizeObserver(align);
    if (viewport.current) resize.observe(viewport.current);
    return () => resize.disconnect();
  }, [align]);
  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    const owner = input.current?.form;
    if (!owner || value !== undefined) return;
    let mounted = true;
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (mounted && !event.defaultPrevented) setLocalValue(defaultValue);
      });
    };
    owner.addEventListener("reset", reset);
    return () => {
      mounted = false;
      owner.removeEventListener("reset", reset);
    };
  }, [value, defaultValue, form, name]);
  const compiled = stylex.props(s.root, disabled && s.disabled, xstyle);
  const settle = () => {
    const view = viewport.current;
    if (!view || disabled) return;
    clearTimeout(timer.current);
    const nodes = view.querySelectorAll<HTMLElement>('[role="option"]');
    const nearest = options
      .map((option, index) => ({
        option,
        distance: Math.abs(
          (nodes[index]?.offsetTop ?? 0) +
            (nodes[index]?.offsetHeight ?? 0) / 2 -
            view.scrollTop -
            view.clientHeight / 2,
        ),
      }))
      .filter(({ option }) => !option.disabled)
      .sort((a, b) => a.distance - b.distance)[0]?.option;
    if (nearest) choose(nearest.value);
    // Reconcile after React commits the requested selection. An animation frame
    // can run first and briefly scroll back to the previously accepted value.
    setSettlement((current) => current + 1);
  };
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot="wheel-picker"
      data-disabled={disabled ? "" : undefined}
    >
      <div aria-hidden="true" {...stylex.props(s.band)} />
      <ListBox
        ref={viewport}
        aria-label={label}
        aria-labelledby={labelledBy}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        selectionMode="single"
        selectionFollowsFocus
        loopFocus={false}
        selectedKeys={new Set(selected ? [selected.value] : [])}
        onSelectionChange={(keys) => {
          const next = keys.values().next().value;
          if (typeof next === "string") choose(next);
        }}
        xstyle={[s.viewport, disabled && s.disabledViewport]}
        onScrollEnd={(event) => {
          onScrollEnd?.(event);
          if (!event.defaultPrevented) settle();
        }}
        onScroll={(event) => {
          onScroll?.(event);
          paint();
          clearTimeout(timer.current);
          if (event.defaultPrevented || disabled) return;
          if (!("onscrollend" in event.currentTarget)) timer.current = setTimeout(settle, 150);
        }}
      >
        {options.map((option) => (
          <ListBox.Item
            key={option.value}
            itemKey={option.value}
            textValue={option.label}
            aria-label={option.label}
            disabled={disabled || option.disabled}
            xstyle={s.option}
            onKeyDown={onKeyDown}
          >
            <span data-wheel-label="" aria-hidden="true" {...stylex.props(s.label)}>
              {option.label}
            </span>
          </ListBox.Item>
        ))}
      </ListBox>
      {!options.length && <div {...stylex.props(s.empty)}>{emptyLabel}</div>}
      {name && (
        <input
          ref={input}
          type="hidden"
          name={name}
          form={form}
          value={selected?.value ?? ""}
          disabled={disabled}
        />
      )}
    </div>
  );
}
