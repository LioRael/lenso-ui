"use client";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Radio } from "@base-ui/react/radio";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import * as stylex from "@stylexjs/stylex";
import { segmentedControlStyles as s } from "@lenso/tokens/segmented-control";
import { tabsStyles } from "@lenso/tokens/tabs";
import { useElasticRef } from "@lenso/glass/react";
import { useSegmentedListRef } from "../../utils/interaction/tabs.js";
import {
  SelectionTrack,
  SelectionHighlight,
  SelectionFallback,
} from "../../utils/segmented-presentation.js";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

export interface SegmentedControlItem {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}
export type SegmentedControlProps = Omit<StyleXProps<RadioGroup.Props<string>>, "children"> & {
  items: readonly SegmentedControlItem[];
  emptyLabel?: string;
  size?: "sm" | "lg";
  lift?: number;
  elastic?: boolean;
  glass?: boolean;
};

/** A mutually exclusive value choice. Use Tabs when each choice owns a panel. */
export function SegmentedControl({
  items,
  emptyLabel = "No options",
  size = "sm",
  lift = 20,
  elastic = true,
  glass = false,
  disabled = false,
  readOnly = false,
  ref,
  value,
  defaultValue,
  onValueChange,
  inputRef,
  form,
  name,
  xstyle,
  style,
  ...props
}: SegmentedControlProps) {
  const [localValue, setLocalValue] = useState<string | null>(defaultValue ?? null);
  const input = useRef<HTMLInputElement>(null);
  const mergedInputRef = useMergedRefs(input, inputRef);
  const presentationRef = useSegmentedListRef(ref, true, "segmented-control");
  const shouldStart = useCallback((event: PointerEvent) => {
    const target = event.target instanceof Element ? event.target.closest("[role=radio]") : null;
    return Boolean(target && !target.matches("[data-disabled], [aria-disabled=true]"));
  }, []);
  const trackRef = useElasticRef(presentationRef, {
    enabled: elastic && !disabled && !readOnly,
    shouldStart,
  });
  useEffect(() => {
    const owner = input.current?.form;
    if (!owner || value !== undefined) return;
    let resetTimer: ReturnType<typeof setTimeout>;
    // Wait for delegated React onReset handlers before checking cancellation.
    const reset = (event: Event) => {
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        if (!event.defaultPrevented) setLocalValue(defaultValue ?? null);
      }, 0);
    };
    owner.addEventListener("reset", reset);
    return () => {
      clearTimeout(resetTimer);
      owner.removeEventListener("reset", reset);
    };
  }, [value, defaultValue, form, name]);
  const current = value ?? localValue;
  const compiled = stylex.props(
    tabsStyles.list,
    tabsStyles.listHorizontal,
    glass && tabsStyles.glassList,
    elastic && tabsStyles.elastic,
    tabsStyles.lift(lift),
    size === "lg" && tabsStyles.large,
    s.root,
    xstyle,
  );
  return (
    <RadioGroup<string | null>
      {...props}
      ref={trackRef}
      disabled={disabled}
      readOnly={readOnly}
      value={value ?? localValue}
      defaultValue={defaultValue ?? null}
      onValueChange={(next, details) => {
        if (next === null) return;
        onValueChange?.(next, details);
        if (!details.isCanceled && value === undefined) setLocalValue(next);
      }}
      inputRef={mergedInputRef}
      form={form}
      name={name}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "segmented-control"}
      data-hidden={!items.some((item) => item.value === current) ? "" : undefined}
    >
      <SelectionTrack kind="segmented-control" glass={glass} />
      {!items.length && <span {...stylex.props(s.empty)}>{emptyLabel}</span>}
      {items.map((item) => (
        <Radio.Root
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          data-slot="segmented-control-item"
          data-active={item.value === current ? "" : undefined}
          {...stylex.props(tabsStyles.tab, tabsStyles.initialTab, s.item)}
        >
          <span {...stylex.props(s.face)} data-slot="segmented-control-label">
            {item.label}
          </span>
        </Radio.Root>
      ))}
      <SelectionHighlight kind="segmented-control" />
      <SelectionFallback kind="segmented-control" />
    </RadioGroup>
  );
}
