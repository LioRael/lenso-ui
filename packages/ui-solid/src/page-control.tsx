// Keyboard behavior adapted from onlymoein/liquidglass, MIT.
// Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz.
import { pageControlStyles as s } from "@lenso/tokens/page-control";
import { isRTL } from "@ui-sdk/core";
import { Button } from "@ui-sdk/solid/button";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  Show,
  omit,
  type ComponentProps,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import { Glass } from "./glass.jsx";
import { attributes, htmlPart } from "./parts.js";

const Nav = htmlPart("nav", "page-control", () => s.root);
const Track = htmlPart("div", "page-control-track", () => [s.track, s.plainTrack]);
const defaultLabel = (index: number, count: number) => `Page ${index + 1} of ${count}`;
export type PageControlProps = Omit<ComponentProps<typeof Nav>, "children" | "onChange"> & {
  count: number;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  getPageLabel?: (page: number, count: number) => string;
  disabled?: boolean;
  variant?: "prominent" | "plain";
};

export function PageControl(props: PageControlProps) {
  const [localPage, setLocalPage] = createSignal(props.defaultPage ?? 0);
  const buttons = new Map<number, HTMLButtonElement>();
  let focusPage: number | undefined;
  const total = () => (Number.isFinite(props.count) ? Math.max(0, Math.trunc(props.count)) : 0);
  const clamp = (index: number) =>
    Math.max(0, Math.min(total() - 1, Number.isFinite(index) ? Math.trunc(index) : 0));
  const current = () => clamp(props.page ?? localPage());
  const visible = () => Math.min(total(), 9);
  const start = () => Math.max(0, Math.min(current() - 4, total() - visible()));
  const pages = createMemo(() => Array.from({ length: visible() }, (_, index) => start() + index));
  const plain = () => props.variant === "plain";
  createEffect(
    () => current(),
    (index) => {
      if (focusPage === index) buttons.get(index)?.focus();
      focusPage = undefined;
    },
  );

  const select = (index: number) => {
    if (index === current()) return;
    if (props.page === undefined) setLocalPage(index);
    props.onPageChange?.(index);
  };

  function keydown(event: Parameters<JSX.EventHandler<HTMLElement, KeyboardEvent>>[0]) {
    const listener = props.onKeyDown;
    if (typeof listener === "function") listener(event);
    else listener?.[0](listener[1], event);
    if (
      event.defaultPrevented ||
      props.disabled ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return;
    const focused = [...buttons].find(([, button]) => button === event.target)?.[0];
    if (focused === undefined) return;
    const forward = isRTL(event.currentTarget) ? -1 : 1;
    const next: Record<string, number> = {
      ArrowLeft: focused - forward,
      ArrowRight: focused + forward,
      ArrowUp: focused - 1,
      ArrowDown: focused + 1,
      Home: 0,
      End: total() - 1,
    };
    const index = next[event.key];
    if (index === undefined) return;
    event.preventDefault();
    const target = clamp(index);
    if (target === current()) buttons.get(target)?.focus();
    else {
      focusPage = target;
      select(target);
    }
  }

  function Dots() {
    return (
      <For each={pages()}>
        {(index) => {
          const offset = () => index - start();
          const overflow = () =>
            index !== current() &&
            ((offset() === 0 && start() > 0) ||
              (offset() === visible() - 1 && index < total() - 1));
          return (
            <Button
              ref={(node) => {
                buttons.set(index, node);
              }}
              tabindex={index === current() ? 0 : -1}
              disabled={props.disabled}
              aria-current={index === current() ? "page" : undefined}
              aria-label={(props.getPageLabel ?? defaultLabel)(index, total())}
              class={
                attributes(
                  s.button,
                  total() === 7 && s.sevenButton,
                  visible() === 9 && (offset() === 0 || offset() === 8) && s.edgeButton,
                ).class
              }
              onClick={() => select(index)}
            >
              <span
                aria-hidden="true"
                {...attributes(s.dot, index === current() && s.active, overflow() && s.overflow)}
              />
            </Button>
          );
        }}
      </For>
    );
  }

  return (
    <Show when={total()}>
      <Nav
        aria-label="Pages"
        {...omit(
          props,
          "count",
          "page",
          "defaultPage",
          "onPageChange",
          "getPageLabel",
          "variant",
          "disabled",
          "onKeyDown",
        )}
        data-variant={plain() ? "plain" : "prominent"}
        onKeyDown={keydown}
      >
        <Show
          when={plain()}
          fallback={
            <Glass
              xstyle={[s.track, total() === 7 && s.sevenTrack]}
              data-material="glass-small"
              data-lenso-slot="page-control-track"
            >
              <Dots />
            </Glass>
          }
        >
          <Track xstyle={total() === 7 && s.sevenTrack}>
            <Dots />
          </Track>
        </Show>
      </Nav>
    </Show>
  );
}
