"use client";
// Adapted from onlymoein/liquidglass 0d9a1c5, MIT.
// Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz.
// Modified for Base UI Toolbar, StyleX, scroll-edge ownership and resize tracking.
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { navigationBarStyles } from "@lenso/tokens/navigation-bar";
import { Toolbar, type ToolbarRootProps } from "../toolbar/index.js";
import { assignRef } from "../../utils/interaction/ref.js";
import { useDirection } from "@base-ui/react/direction-provider";

export type NavigationBarProps = Omit<
  ToolbarRootProps,
  "title" | "children" | "orientation" | "isAttached"
> & {
  title: string;
  /** Display a large title below the bar until it scrolls beneath it. */
  large?: boolean;
  onBack?: () => void;
  backLabel?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
};

export function NavigationBar({
  title,
  large = true,
  onBack,
  backLabel = "Back",
  leading,
  trailing,
  level = 1,
  edge = "uniform",
  scrollRef,
  ref,
  xstyle,
  "aria-label": label = "Navigation bar",
  ...props
}: NavigationBarProps) {
  const direction = useDirection();
  const barRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const inferredScrollRef = useRef<HTMLElement | null>(null);
  const targetRef = scrollRef ?? inferredScrollRef;
  const mergedRef = useCallback(
    (node: HTMLElement | null) => {
      barRef.current = node;
      if (node) {
        let parent = node.parentElement;
        while (parent && parent !== node.ownerDocument.body) {
          if (/auto|scroll/.test(getComputedStyle(parent).overflowY)) break;
          parent = parent.parentElement;
        }
        inferredScrollRef.current =
          parent && parent !== node.ownerDocument.body
            ? parent
            : (node.ownerDocument.scrollingElement as HTMLElement | null);
      }
      return assignRef(ref, node);
    },
    [ref],
  );
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const scroll = targetRef.current;
    const events = scroll === bar.ownerDocument.scrollingElement ? bar.ownerDocument : scroll;
    const heading = headingRef.current;
    const update = () => {
      bar.toggleAttribute(
        "data-collapsed",
        Boolean(
          large &&
          heading &&
          heading.getBoundingClientRect().bottom - 12 <= bar.getBoundingClientRect().bottom,
        ),
      );
    };
    update();
    events?.addEventListener("scroll", update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(bar);
    if (heading) resize.observe(heading);
    return () => {
      events?.removeEventListener("scroll", update);
      resize.disconnect();
      bar.removeAttribute("data-collapsed");
    };
  }, [large, title, scrollRef, targetRef]);
  const Heading = `h${level}` as const;
  return (
    <>
      <Toolbar
        {...props}
        ref={mergedRef}
        aria-label={label}
        edge={edge}
        scrollRef={targetRef}
        xstyle={[navigationBarStyles.root, xstyle]}
        data-slot={props["data-slot"] ?? "navigation-bar"}
        data-large={large ? "" : undefined}
      >
        <div {...stylex.props(navigationBarStyles.side)} data-slot="navigation-bar-leading">
          {onBack && (
            <Toolbar.Group>
              <Toolbar.Button isIconOnly aria-label={backLabel} onClick={onBack}>
                <svg
                  viewBox="0 0 26 26"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  {...stylex.props(
                    navigationBarStyles.backIcon,
                    direction === "rtl" && navigationBarStyles.backIconRtl,
                  )}
                >
                  <path d="M15.75 5.5 8.25 13l7.5 7.5" />
                </svg>
              </Toolbar.Button>
            </Toolbar.Group>
          )}
          {leading}
        </div>
        {large ? (
          <span
            aria-hidden="true"
            data-slot="navigation-bar-title"
            {...stylex.props(navigationBarStyles.title, navigationBarStyles.collapsingTitle)}
          >
            {title}
          </span>
        ) : (
          <Heading data-slot="navigation-bar-title" {...stylex.props(navigationBarStyles.title)}>
            {title}
          </Heading>
        )}
        <div
          {...stylex.props(navigationBarStyles.side, navigationBarStyles.trailing)}
          data-slot="navigation-bar-trailing"
        >
          {trailing}
        </div>
      </Toolbar>
      {large && (
        <Heading
          ref={headingRef}
          data-slot="navigation-bar-large-title"
          {...stylex.props(navigationBarStyles.largeTitle)}
        >
          {title}
        </Heading>
      )}
    </>
  );
}
