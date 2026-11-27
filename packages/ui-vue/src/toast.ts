import {
  bindPillMarquee,
  bindPillSize,
  createPillTransition,
  createSpring,
} from "@lenso/glass/motion";
import { materialStyles } from "@lenso/tokens/materials";
import { toastStyles as s } from "@lenso/tokens/toast";
import * as stylex from "@stylexjs/stylex";
import {
  Toast as SdkRoot,
  ToastRegion as SdkRegion,
  ToastTitle as SdkTitle,
  ToastDescription as SdkDescription,
  ToastAction as SdkAction,
  ToastClose as SdkClose,
  type ToastData,
  type ToastItem,
} from "@ui-sdk/vue/toast";
import {
  computed,
  defineComponent,
  h,
  inject,
  provide,
  shallowRef,
  watch,
  watchPostEffect,
  type Component,
  type InjectionKey,
  type PropType,
  type VNode,
} from "vue";
import { ProgressCircle } from "./progress-circle.js";
import {
  htmlPart,
  partAttributes,
  sdkPart,
  type ComponentProps,
  type HtmlPart,
  type StyleXArgument,
  type StyledPart,
} from "./parts.js";

type Variant = "glass" | "pill" | "default" | "success" | "danger" | "accent" | "warning";
type Data = ToastData<string | VNode>;
const CurrentToast: InjectionKey<() => Data> = Symbol("ToastData");
const IsPill: InjectionKey<() => boolean> = Symbol("ToastIsPill");
const Root: StyledPart<typeof SdkRoot> = sdkPart(SdkRoot, "toast", () => s.root);
const Region: StyledPart<typeof SdkRegion> = sdkPart(SdkRegion, "toast-region", () => s.viewport);
const Title: StyledPart<typeof SdkTitle> = sdkPart(SdkTitle, "toast-title", () => s.title);
const Action: StyledPart<typeof SdkAction> = sdkPart(SdkAction, "toast-action", () => s.action);
const Close: StyledPart<typeof SdkClose> = sdkPart(SdkClose, "toast-close", () => s.close);
const Content = htmlPart("div", "toast-content", () => s.content);
export const ToastDescription: StyledPart<typeof SdkDescription> = sdkPart(
  SdkDescription,
  "toast-description",
  () => s.description,
);
export const ToastIndicator = htmlPart("span", "toast-indicator", () => s.indicator);
export { createToaster, toast, type ToastData, type Toaster } from "@ui-sdk/vue/toast";

function pillPart<C extends Component>(part: C, styles: StyleXArgument): C {
  return defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      const pill = inject(IsPill, () => false);
      return () =>
        h(part, { ...attrs, xstyle: [pill() && styles, attrs["xstyle"] as StyleXArgument] }, slots);
    },
  }) as unknown as C;
}
export const ToastTitle: typeof Title = pillPart(Title, s.pillTitle);
export const ToastAction: typeof Action = pillPart(Action, s.pillAction);
export const ToastClose: typeof Close = pillPart(Close, s.pillClose);
export const ToastContent: typeof Content = pillPart(Content, s.pillContent);

type VariantOption = { variant?: Variant };
export const ToastRoot: StyledPart<typeof SdkRoot, VariantOption> = defineComponent({
  name: "LensoToast",
  inheritAttrs: false,
  props: { variant: { type: String as PropType<Variant>, default: "glass" } },
  setup(props, { attrs, slots }) {
    const data = inject(CurrentToast, undefined);
    const pill = () => props.variant === "pill";
    const glass = () => pill() || props.variant === "glass";
    const measure = shallowRef<HTMLDivElement>();
    const previous = shallowRef<HTMLDivElement>();
    const transition = shallowRef<ReturnType<typeof createPillTransition>>();
    provide(IsPill, pill);
    watchPostEffect((cleanup) => {
      const node = measure.value;
      const layer = previous.value;
      if (!node || !layer || !pill()) return;
      const size = bindPillSize(node);
      const swap = createPillTransition(node, layer);
      transition.value = swap;
      cleanup(() => {
        size?.destroy();
        swap.destroy();
        transition.value = undefined;
      });
    });
    watch(
      () => [transition.value, data?.().version, data?.().type] as const,
      ([swap, version, phase]) => {
        if (version !== undefined) swap?.update(phase);
      },
      { flush: "post" },
    );
    return () =>
      h(
        Root,
        {
          ...attrs,
          "data-variant": props.variant,
          "data-material": glass() ? (pill() ? "glass-medium" : "glass-small") : undefined,
          xstyle: [
            glass() && materialStyles.root,
            glass() && s.glass,
            pill() && s.pill,
            glass() && materialStyles.accessible,
            attrs["xstyle"] as StyleXArgument,
          ],
        },
        {
          ...slots,
          default: (scope: Record<string, unknown>) => {
            const children = slots["default"]?.(scope);
            return pill()
              ? h("div", stylex.attrs(s.pillClip), [
                  h(
                    "div",
                    {
                      ...stylex.attrs(s.pillMeasure),
                      ref: measure,
                      "data-lenso-slot": "toast-pill-measure",
                    },
                    children,
                  ),
                  h("div", {
                    ...stylex.attrs(s.pillPrevious),
                    ref: previous,
                    "aria-hidden": "true",
                    inert: true,
                  }),
                ])
              : children;
          },
        },
      );
  },
}) as unknown as StyledPart<typeof SdkRoot, VariantOption>;
export type ToastRootProps = ComponentProps<typeof ToastRoot>;

const ItemData = defineComponent({
  name: "LensoToastItemData",
  props: { toast: { type: Object as PropType<Data>, required: true } },
  setup(props, { slots }) {
    provide(CurrentToast, () => props.toast);
    return () => slots["default"]?.();
  },
});
export const ToastRegion: StyledPart<typeof SdkRegion, VariantOption> = defineComponent({
  name: "LensoToastRegion",
  inheritAttrs: false,
  props: { variant: String as PropType<Variant> },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        Region,
        { side: "bottom", align: "center", ...attrs },
        {
          default: (scope: { toast: Data; item: ToastItem<string | VNode> }) =>
            h(
              ItemData,
              { toast: scope.toast },
              {
                default: slots["default"]
                  ? () => slots["default"]?.(scope)
                  : () =>
                      h(
                        ToastRoot,
                        { variant: props.variant },
                        {
                          default: () =>
                            h(ToastContent, null, {
                              default: () => [
                                h(ToastTitle),
                                h(ToastDescription),
                                h(ToastAction),
                                h(
                                  ToastClose,
                                  {
                                    "aria-label": "Close",
                                  },
                                  { default: () => "×" },
                                ),
                              ],
                            }),
                        },
                      ),
              },
            ),
        },
      );
  },
}) as unknown as StyledPart<typeof SdkRegion, VariantOption>;
export type ToastRegionProps = ComponentProps<typeof ToastRegion>;

export const ToastMarquee: HtmlPart<"span"> = defineComponent({
  name: "LensoToastMarquee",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const box = shallowRef<HTMLSpanElement>();
    const text = shallowRef<HTMLSpanElement>();
    watchPostEffect((cleanup) => {
      if (!box.value || !text.value) return;
      const dispose = bindPillMarquee(box.value, text.value);
      if (dispose) cleanup(dispose);
    });
    return () =>
      h("span", { ...partAttributes("toast-marquee", s.marquee, attrs), ref: box }, [
        h("span", { ...stylex.attrs(s.marqueeText), ref: text }, slots["default"]?.()),
      ]);
  },
}) as unknown as HtmlPart<"span">;

const PillDigit = defineComponent({
  name: "LensoToastDigit",
  props: { place: { type: Number, required: true }, value: { type: Number, required: true } },
  setup(props) {
    const node = shallowRef<HTMLSpanElement>();
    const digit = (value: number) => Math.floor(value / props.place) % 10;
    const visible = (value: number) => (props.place === 1 || value >= props.place ? 1 : 0);
    const initial = props.value;
    watch(
      node,
      (element, _, cleanup) => {
        const template = element?.firstElementChild as HTMLElement | null;
        if (!template || !element) return;
        let last = initial;
        let target = 0;
        const roll = createSpring(0, 900, 48, (position) => {
          for (const child of Array.from(element.children)) {
            const glyph = child as HTMLElement;
            const distance = Number(glyph.dataset["row"]) - position;
            if (position === target && distance !== 0) {
              glyph.remove();
              continue;
            }
            glyph.style.transform = `translateY(${distance * 100}%)`;
            glyph.style.opacity = String(Math.max(0, 1 - Math.abs(distance)));
            glyph.style.filter = `blur(${Math.min(2, Math.abs(distance) * 1.5)}px)`;
          }
        });
        const width = createSpring(visible(initial), 900, 48, (value) =>
          element.style.setProperty(
            "--toast-digit-presence",
            String(Math.min(1, Math.max(0, value))),
          ),
        );
        const update = (value: number) => {
          if (digit(value) !== digit(last)) {
            target += value > last ? 1 : -1;
            element.querySelector(`[data-row="${target}"]`)?.remove();
            const row = template.cloneNode(false) as HTMLElement;
            row.dataset["row"] = String(target);
            row.textContent = String(digit(value));
            element.append(row);
          }
          last = value;
          roll.set(target);
          roll.paint();
          width.set(visible(value));
        };
        const preference = matchMedia("(prefers-reduced-motion: reduce)");
        const settle = () => update(last);
        preference.addEventListener("change", settle);
        const stop = watch(() => props.value, update, { immediate: true, flush: "post" });
        cleanup(() => {
          stop();
          preference.removeEventListener("change", settle);
          roll.stop();
          width.stop();
        });
      },
      { flush: "post" },
    );
    return () =>
      h(
        "span",
        {
          ...stylex.attrs(s.digit),
          ref: node,
          style: { "--toast-digit-presence": String(visible(initial)) },
        },
        [h("span", { ...stylex.attrs(s.digitRow), "data-row": "0" }, String(digit(initial)))],
      );
  },
});

export const ToastProgress: typeof ProgressCircle.Root = defineComponent({
  name: "LensoToastProgress",
  inheritAttrs: false,
  props: { value: Number, min: Number, max: Number },
  setup(props, { attrs, slots }) {
    const percent = computed(() => {
      const min = props.min ?? 0;
      const max = props.max ?? 100;
      return max > min
        ? Math.round(100 * Math.min(1, Math.max(0, ((props.value ?? min) - min) / (max - min))))
        : 0;
    });
    return () =>
      h(
        ProgressCircle.Root,
        {
          ...attrs,
          value: props.value,
          min: props.min,
          max: props.max,
          "data-lenso-slot": "toast-progress",
          xstyle: [s.pillProgress, attrs["xstyle"] as StyleXArgument],
        },
        {
          ...slots,
          default: (scope: Record<string, unknown>) => [
            h(
              ProgressCircle.Track,
              { xstyle: s.pillProgressTrack },
              {
                default: () => [
                  h(ProgressCircle.TrackCircle, { xstyle: s.pillProgressTrackCircle }),
                  h(ProgressCircle.FillCircle, { xstyle: s.progressFill }),
                ],
              },
            ),
            slots["default"]?.(scope),
            props.value != null &&
              h("span", { ...stylex.attrs(s.pillProgressValue), "aria-hidden": "true" }, [
                h(
                  "span",
                  stylex.attrs(s.number),
                  [100, 10, 1].map((place) =>
                    h(PillDigit, {
                      key: place,
                      place,
                      value: percent.value,
                    }),
                  ),
                ),
                "%",
              ]),
          ],
        },
      );
  },
}) as unknown as typeof ProgressCircle.Root;

export const Toast: typeof ToastRoot & {
  Root: typeof ToastRoot;
  Region: typeof ToastRegion;
  Progress: typeof ToastProgress;
  Marquee: typeof ToastMarquee;
  Title: typeof ToastTitle;
  Description: typeof ToastDescription;
  Action: typeof ToastAction;
  Close: typeof ToastClose;
  Content: typeof ToastContent;
  Indicator: typeof ToastIndicator;
} = Object.assign(ToastRoot, {
  Root: ToastRoot,
  Region: ToastRegion,
  Progress: ToastProgress,
  Marquee: ToastMarquee,
  Title: ToastTitle,
  Description: ToastDescription,
  Action: ToastAction,
  Close: ToastClose,
  Content: ToastContent,
  Indicator: ToastIndicator,
});
