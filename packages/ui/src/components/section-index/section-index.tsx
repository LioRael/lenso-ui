"use client";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import * as stylex from "@stylexjs/stylex";
import { sectionIndexStyles as s } from "@lenso/tokens/section-index";
import type { StyleXProps } from "../../utils/styled.js";

export interface SectionIndexItem {
  value: string;
  label: string;
  /** A same-page fragment, for example #contacts-a. */
  href: `#${string}`;
  disabled?: boolean;
}
export type SectionIndexProps = Omit<
  StyleXProps<ComponentProps<"nav">>,
  "children" | "onChange" | "defaultValue"
> & {
  items: readonly SectionIndexItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
};

export function SectionIndex({
  items,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  onClickCapture,
  xstyle,
  style,
  ...props
}: SectionIndexProps) {
  const [localValue, setLocalValue] = useState(defaultValue);
  const [focusValue, setFocusValue] = useState<string>();
  const current = value ?? localValue;
  const links = useRef(new Map<string, HTMLAnchorElement>());
  const drag = useRef<{ id: number; last: string } | null>(null);
  const suppressClick = useRef(false);
  useEffect(() => {
    if (disabled) {
      drag.current = null;
    }
  }, [disabled]);
  const available = items.filter((item) => !disabled && !item.disabled);
  const nearestItem = (y: number) =>
    available
      .map((item) => {
        const rect = links.current.get(item.value)!.getBoundingClientRect();
        return { item, distance: Math.abs(y - (rect.top + rect.height / 2)) };
      })
      .sort((a, b) => a.distance - b.distance)[0]?.item;
  const tabValue =
    available.find((item) => item.value === (focusValue ?? current))?.value ?? available[0]?.value;
  const compiled = stylex.props(s.root, disabled && s.disabled, xstyle);
  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Delegate navigation keys and pointer scrubbing only from this nav's registered links.
    <nav
      aria-label="Section index"
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={props["data-slot"] ?? "section-index"}
      data-disabled={disabled ? "" : undefined}
      onClickCapture={(event) => {
        onClickCapture?.(event);
        if (suppressClick.current) {
          suppressClick.current = false;
          if (event.detail > 0) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (
          event.defaultPrevented ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        )
          return;
        const index = available.findIndex((item) => links.current.get(item.value) === event.target);
        if (index < 0) return;
        const next = {
          ArrowUp: Math.max(0, index - 1),
          ArrowDown: Math.min(available.length - 1, index + 1),
          Home: 0,
          End: available.length - 1,
        }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        links.current.get(available[next]!.value)?.focus({ preventScroll: true });
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (!drag.current) suppressClick.current = false;
        if (
          event.defaultPrevented ||
          disabled ||
          !event.isPrimary ||
          event.button !== 0 ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          drag.current
        )
          return;
        const hit = items.find((item) =>
          links.current.get(item.value)?.contains(event.target as Node),
        );
        if (hit?.disabled) return;
        const item = hit ?? nearestItem(event.clientY);
        if (!item) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { id: event.pointerId, last: item.value };
        links.current.get(item.value)?.click();
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        const active = drag.current;
        if (event.defaultPrevented || !active || active.id !== event.pointerId || disabled) return;
        const nearest = nearestItem(event.clientY);
        if (nearest && active.last !== nearest.value) {
          active.last = nearest.value;
          links.current.get(nearest.value)?.click();
        }
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        if (drag.current?.id !== event.pointerId) return;
        suppressClick.current = true;
        drag.current = null;
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        if (drag.current?.id === event.pointerId) {
          suppressClick.current = true;
          drag.current = null;
        }
      }}
      onLostPointerCapture={(event) => {
        onLostPointerCapture?.(event);
        // Ignore the child's implicit capture being transferred to this nav.
        if (event.target === event.currentTarget && drag.current?.id === event.pointerId) {
          suppressClick.current = true;
          drag.current = null;
        }
      }}
    >
      {items.map((item) => (
        <a
          key={item.value}
          ref={(node) => {
            if (node) links.current.set(item.value, node);
            else links.current.delete(item.value);
          }}
          href={item.href}
          draggable={false}
          aria-disabled={disabled || item.disabled || undefined}
          aria-current={item.value === current ? "location" : undefined}
          tabIndex={item.value === tabValue ? 0 : -1}
          data-slot="section-index-item"
          {...stylex.props(s.item)}
          onFocus={() => setFocusValue(item.value)}
          onClick={(event) => {
            if (event.defaultPrevented) return;
            if (disabled || item.disabled) {
              event.preventDefault();
              return;
            }
            if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
            if (value === undefined) setLocalValue(item.value);
            onValueChange?.(item.value);
          }}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
