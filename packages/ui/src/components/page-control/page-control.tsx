"use client";
// Keyboard behavior adapted from onlymoein/liquidglass, MIT.
// Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz.
// Modified for RTL, controlled selection and the sliding indicator window.
import { useLayoutEffect, useRef, useState, type ComponentProps } from "react";
import { NativeButton as BaseButton } from "../../utils/native-button.js";
import * as stylex from "@stylexjs/stylex";
import { pageControlStyles } from "@lenso/tokens/page-control";
import { Glass } from "../glass/index.js";
import type { StyleXProps } from "../../utils/styled.js";
import { useDirection } from "@base-ui/react/direction-provider";
export type PageControlProps = Omit<StyleXProps<ComponentProps<"nav">>, "children" | "onChange"> & {
  count: number;
  /** Zero-based page index. */
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  getPageLabel?: (page: number, count: number) => string;
  disabled?: boolean;
  /** Prominent keeps the material capsule; plain displays only the dots. */
  variant?: "prominent" | "plain";
};
export function PageControl({
  count,
  page,
  defaultPage = 0,
  onPageChange,
  getPageLabel = (index, total) => `Page ${index + 1} of ${total}`,
  disabled = false,
  variant = "prominent",
  onKeyDown,
  xstyle,
  style,
  ...props
}: PageControlProps) {
  const [localPage, setLocalPage] = useState(defaultPage);
  const direction = useDirection();
  const buttons = useRef(new Map<number, HTMLElement>());
  const focusPage = useRef<number | null>(null);
  const total = Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0;
  const requested = page ?? localPage;
  const current = Math.max(
    0,
    Math.min(total - 1, Number.isFinite(requested) ? Math.trunc(requested) : 0),
  );
  const visible = Math.min(total, 9);
  const start = Math.max(0, Math.min(current - 4, total - visible));
  const compiled = stylex.props(pageControlStyles.root, xstyle);
  useLayoutEffect(() => {
    if (focusPage.current === current) buttons.current.get(current)?.focus();
    focusPage.current = null;
  });
  const select = (index: number) => {
    if (page === undefined) setLocalPage(index);
    if (index !== current) onPageChange?.(index);
  };
  if (!total) return null;
  const trackStyle = [pageControlStyles.track, total === 7 && pageControlStyles.sevenTrack];
  const dots = Array.from({ length: visible }, (_, offset) => {
    const index = start + offset;
    const overflow =
      index !== current &&
      ((offset === 0 && start > 0) || (offset === visible - 1 && index < total - 1));
    return (
      <BaseButton
        key={index}
        ref={(node) => {
          if (node) buttons.current.set(index, node);
          else buttons.current.delete(index);
        }}
        tabIndex={index === current ? 0 : -1}
        disabled={disabled}
        aria-label={getPageLabel(index, total)}
        aria-current={index === current ? "page" : undefined}
        {...stylex.props(
          pageControlStyles.button,
          total === 7 && pageControlStyles.sevenButton,
          visible === 9 && (offset === 0 || offset === 8) && pageControlStyles.edgeButton,
        )}
        onClick={() => select(index)}
      >
        <span
          aria-hidden="true"
          {...stylex.props(
            pageControlStyles.dot,
            index === current && pageControlStyles.active,
            overflow && pageControlStyles.overflow,
          )}
        />
      </BaseButton>
    );
  });
  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Delegate only registered page-button keys so caller onKeyDown can cancel before selection.
    <nav
      aria-label="Pages"
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot="page-control"
      data-variant={variant}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (
          event.defaultPrevented ||
          disabled ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        )
          return;
        const focused = [...buttons.current].find(([, button]) => button === event.target)?.[0];
        if (focused === undefined) return;
        const forward = direction === "rtl" ? -1 : 1;
        const next = {
          ArrowLeft: focused - forward,
          ArrowRight: focused + forward,
          ArrowUp: focused - 1,
          ArrowDown: focused + 1,
          Home: 0,
          End: total - 1,
        }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        const target = Math.max(0, Math.min(total - 1, next));
        if (target === current) buttons.current.get(target)?.focus();
        else {
          focusPage.current = target;
          select(target);
        }
      }}
    >
      {variant === "prominent" ? (
        <Glass xstyle={trackStyle} data-material="glass-small" data-slot="page-control-track">
          {dots}
        </Glass>
      ) : (
        <div
          {...stylex.props(trackStyle, pageControlStyles.plainTrack)}
          data-slot="page-control-track"
        >
          {dots}
        </div>
      )}
    </nav>
  );
}
