"use client";
import {
  SegmentedControl as SdkSegmentedControl,
  SegmentedControlItem as SdkSegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import { renderElement } from "@ui-sdk/react/primitive";
import { useCallback, type ComponentProps, type ReactNode } from "react";
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
export type SegmentedControlProps = Omit<
  StyleXProps<ComponentProps<typeof SdkSegmentedControl<string>>>,
  "children"
> & {
  items: readonly SegmentedControlItem[];
  emptyLabel?: string;
  size?: "sm" | "lg";
  lift?: number;
  elastic?: boolean;
  glass?: boolean;
};

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
  render,
  xstyle,
  style,
  ...props
}: SegmentedControlProps) {
  const presentationRef = useSegmentedListRef(ref, true, "segmented-control");
  const shouldStart = useCallback((event: PointerEvent) => {
    const target = event.target instanceof Element ? event.target.closest("[role=radio]") : null;
    return Boolean(target && !target.matches("[data-disabled], [aria-disabled=true]"));
  }, []);
  const trackRef = useElasticRef(presentationRef, {
    enabled: elastic && !disabled && !readOnly,
    shouldStart,
  });
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
    <SdkSegmentedControl
      {...props}
      ref={trackRef}
      disabled={disabled}
      readOnly={readOnly}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={(partProps, state) =>
        renderElement(
          "div",
          {
            ...partProps,
            "data-lenso-slot": props["data-lenso-slot"] ?? "segmented-control",
            "data-hidden": items.some((item) => item.value === state.value) ? undefined : "",
          },
          render,
          state,
        )
      }
    >
      <SelectionTrack kind="segmented-control" glass={glass} />
      {!items.length && <span {...stylex.props(s.empty)}>{emptyLabel}</span>}
      {items.map((item) => (
        <SdkSegmentedControlItem
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          data-lenso-slot="segmented-control-item"
          {...stylex.props(tabsStyles.tab, tabsStyles.initialTab, s.item)}
        >
          <span {...stylex.props(s.face)} data-lenso-slot="segmented-control-label">
            {item.label}
          </span>
        </SdkSegmentedControlItem>
      ))}
      <SelectionHighlight kind="segmented-control" />
      <SelectionFallback kind="segmented-control" />
    </SdkSegmentedControl>
  );
}
