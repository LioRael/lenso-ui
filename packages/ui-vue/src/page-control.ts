// Keyboard behavior adapted from onlymoein/liquidglass, MIT.
// Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz.
import { pageControlStyles as s } from "@lenso/tokens/page-control";
import { isRTL } from "@ui-sdk/core";
import { Button } from "@ui-sdk/vue/button";
import { defineComponent, h, shallowRef, watch, type HTMLAttributes, type PropType } from "vue";
import { Glass } from "./glass.js";
import { partAttributes, type ComponentProps, type StyledPart } from "./parts.js";

const defaultLabel = (index: number, count: number) => `Page ${index + 1} of ${count}`;
const Pages = defineComponent({
  name: "LensoPageControl",
  inheritAttrs: false,
  props: {
    count: { type: Number, required: true },
    page: Number,
    defaultPage: { type: Number, default: 0 },
    onPageChange: Function as PropType<(page: number) => void>,
    getPageLabel: Function as PropType<(page: number, count: number) => string>,
    disabled: Boolean,
    variant: String as PropType<"prominent" | "plain">,
    onKeydown: Function as PropType<(event: KeyboardEvent) => void>,
  },
  emits: { "update:page": (_page: number) => true },
  setup(props, { attrs, emit }) {
    const local = shallowRef(props.defaultPage);
    const nav = shallowRef<HTMLElement>();
    let focusPage: number | undefined;
    const total = () => (Number.isFinite(props.count) ? Math.max(0, Math.trunc(props.count)) : 0);
    const clamp = (page: number) =>
      Math.max(0, Math.min(total() - 1, Number.isFinite(page) ? Math.trunc(page) : 0));
    const current = () => clamp(props.page ?? local.value);
    const focus = (index: number) =>
      nav.value?.querySelector<HTMLElement>(`[data-page="${index}"]`)?.focus();

    watch(
      current,
      (index) => {
        if (index === focusPage) focus(index);
        focusPage = undefined;
      },
      { flush: "post" },
    );

    function select(index: number) {
      if (index === current()) return;
      if (props.page === undefined) local.value = index;
      props.onPageChange?.(index);
      emit("update:page", index);
    }
    function keydown(event: KeyboardEvent) {
      props.onKeydown?.(event);
      if (
        event.defaultPrevented ||
        props.disabled ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return;
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.hasAttribute("data-page")) return;
      const index = Number(target.dataset["page"]);
      const forward = nav.value && isRTL(nav.value) ? -1 : 1;
      const next = (
        {
          ArrowLeft: index - forward,
          ArrowRight: index + forward,
          ArrowUp: index - 1,
          ArrowDown: index + 1,
          Home: 0,
          End: total() - 1,
        } as Record<string, number>
      )[event.key];
      if (next === undefined) return;
      event.preventDefault();
      const targetPage = clamp(next);
      if (targetPage === current()) focus(targetPage);
      else {
        focusPage = targetPage;
        select(targetPage);
      }
    }

    function dots(count: number, active: number) {
      const visible = Math.min(count, 9);
      const start = Math.max(0, Math.min(active - 4, count - visible));
      return Array.from({ length: visible }, (_, offset) => {
        const index = start + offset;
        const selected = index === active;
        const overflow =
          !selected &&
          ((offset === 0 && start > 0) || (offset === visible - 1 && index < count - 1));
        return h(
          Button,
          {
            key: index,
            ...partAttributes(
              "page-control-button",
              [
                s.button,
                count === 7 && s.sevenButton,
                visible === 9 && (offset === 0 || offset === 8) && s.edgeButton,
              ],
              {
                "data-page": index,
                tabindex: selected ? 0 : -1,
                disabled: props.disabled,
                "aria-current": selected ? "page" : undefined,
                "aria-label": (props.getPageLabel ?? defaultLabel)(index, count),
                onClick: () => select(index),
              },
            ),
          },
          {
            default: () =>
              h(
                "span",
                partAttributes(
                  "page-control-dot",
                  [s.dot, selected && s.active, overflow && s.overflow],
                  { "aria-hidden": "true" },
                ),
              ),
          },
        );
      });
    }

    return () => {
      const count = total();
      if (!count) return null;
      const active = current();
      const plain = props.variant === "plain";
      const track = [s.track, count === 7 && s.sevenTrack];
      return h(
        "nav",
        {
          ...partAttributes("page-control", s.root, {
            "aria-label": "Pages",
            ...attrs,
            "data-variant": plain ? "plain" : "prominent",
          }),
          ref: nav,
          onKeydown: keydown,
        },
        [
          plain
            ? h(
                "div",
                partAttributes("page-control-track", [track, s.plainTrack], {}),
                dots(count, active),
              )
            : h(
                Glass,
                {
                  "data-material": "glass-small",
                  "data-lenso-slot": "page-control-track",
                  xstyle: track,
                },
                { default: () => dots(count, active) },
              ),
        ],
      );
    };
  },
});
export const PageControl: StyledPart<typeof Pages, HTMLAttributes> = Pages as unknown as StyledPart<
  typeof Pages,
  HTMLAttributes
>;
export type PageControlProps = ComponentProps<typeof PageControl>;
