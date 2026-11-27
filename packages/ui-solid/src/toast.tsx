import {
  createSpring,
  bindPillSize,
  createPillTransition,
  bindPillMarquee,
} from "@lenso/glass/motion";
import { materialStyles } from "@lenso/tokens/materials";
import {
  createContext,
  useContext,
  createSignal,
  createEffect,
  omit,
  For,
  untrack,
  Show,
  type ComponentProps,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import type { ToastData } from "@ui-sdk/solid/toast";
import { ProgressCircle } from "./progress-circle.jsx";
import { toastStyles } from "@lenso/tokens/toast";
import {
  Toast as SdkRoot,
  ToastRegion as SdkRegion,
  ToastTitle as SdkTitle,
  ToastDescription as SdkDescription,
  ToastAction as SdkAction,
  ToastClose as SdkClose,
} from "@ui-sdk/solid/toast";
import { attributes, htmlPart, sdkPart, type StyledPart } from "./parts.js";

type Variant = "glass" | "pill" | "default" | "success" | "danger" | "accent" | "warning";
const Data = createContext<ToastData<JSX.Element> | null>(null);
const Appearance = createContext<() => boolean>(() => false);
const Root: StyledPart<typeof SdkRoot> = sdkPart(SdkRoot, "toast", () => toastStyles.root);
const Region: StyledPart<typeof SdkRegion> = sdkPart(
  SdkRegion,
  "toast-region",
  () => toastStyles.viewport,
);
const BaseTitle: StyledPart<typeof SdkTitle> = sdkPart(
  SdkTitle,
  "toast-title",
  () => toastStyles.title,
);
export const ToastDescription: StyledPart<typeof SdkDescription> = sdkPart(
  SdkDescription,
  "toast-description",
  () => toastStyles.description,
);
const BaseAction: StyledPart<typeof SdkAction> = sdkPart(
  SdkAction,
  "toast-action",
  () => toastStyles.action,
);
const BaseClose: StyledPart<typeof SdkClose> = sdkPart(
  SdkClose,
  "toast-close",
  () => toastStyles.close,
);
const BaseContent = htmlPart("div", "toast-content", () => toastStyles.content);
export const ToastIndicator = htmlPart("span", "toast-indicator", () => toastStyles.indicator);

export { createToaster, toast, type ToastData, type Toaster } from "@ui-sdk/solid/toast";

export function ToastTitle(props: ComponentProps<typeof BaseTitle>) {
  const pill = useContext(Appearance);
  return <BaseTitle {...props} xstyle={[pill() && toastStyles.pillTitle, props.xstyle]} />;
}
export function ToastAction(props: ComponentProps<typeof BaseAction>) {
  const pill = useContext(Appearance);
  return <BaseAction {...props} xstyle={[pill() && toastStyles.pillAction, props.xstyle]} />;
}
export function ToastClose(props: ComponentProps<typeof BaseClose>) {
  const pill = useContext(Appearance);
  return <BaseClose {...props} xstyle={[pill() && toastStyles.pillClose, props.xstyle]} />;
}
export function ToastContent(props: ComponentProps<typeof BaseContent>) {
  const pill = useContext(Appearance);
  return <BaseContent {...props} xstyle={[pill() && toastStyles.pillContent, props.xstyle]} />;
}
export type ToastRootProps = ComponentProps<typeof Root> & { variant?: Variant };
export function ToastRoot(props: ToastRootProps) {
  const data = useContext(Data);
  const variant = () => props.variant ?? "glass";
  const pill = () => variant() === "pill";
  const glass = () => pill() || variant() === "glass";
  const [measure, setMeasure] = createSignal<HTMLDivElement>();
  const [previous, setPrevious] = createSignal<HTMLDivElement>();
  const [motion, setMotion] = createSignal<ReturnType<typeof createPillTransition>>();
  createEffect(
    () => [measure(), previous(), pill()] as const,
    ([content, layer, enabled]) => {
      if (!content || !layer || !enabled) return;
      const size = bindPillSize(content);
      const swap = createPillTransition(content, layer);
      setMotion(swap);
      return () => {
        size?.destroy();
        swap.destroy();
        setMotion(undefined);
      };
    },
  );
  createEffect(
    () => [motion(), data?.version, data?.type] as const,
    ([swap, version, phase]) => {
      if (version !== undefined) swap?.update(phase);
    },
  );
  return (
    <Appearance value={pill}>
      <Root
        {...omit(props, "variant", "children", "xstyle")}
        data-variant={variant()}
        data-material={glass() ? (pill() ? "glass-medium" : "glass-small") : undefined}
        xstyle={[
          glass() && materialStyles.root,
          glass() && toastStyles.glass,
          pill() && toastStyles.pill,
          glass() && materialStyles.accessible,
          props.xstyle,
        ]}
      >
        {(state) => {
          const content = () =>
            typeof props.children === "function" ? props.children(state) : props.children;
          return (
            <Show when={pill()} fallback={content()}>
              <div {...attributes(toastStyles.pillClip)}>
                <div
                  data-lenso-slot="toast-pill-measure"
                  ref={setMeasure}
                  {...attributes(toastStyles.pillMeasure)}
                >
                  {content()}
                </div>
                <div
                  ref={setPrevious}
                  aria-hidden="true"
                  inert
                  {...attributes(toastStyles.pillPrevious)}
                />
              </div>
            </Show>
          );
        }}
      </Root>
    </Appearance>
  );
}
export type ToastRegionProps = ComponentProps<typeof Region> & { variant?: Variant };
export function ToastRegion(props: ToastRegionProps) {
  return (
    <Region side="bottom" align="center" {...omit(props, "variant", "children")}>
      {(data, item) => (
        <Data value={data}>
          {props.children ? (
            props.children(data, item)
          ) : (
            <ToastRoot variant={props.variant}>
              <ToastContent>
                <ToastTitle />
                <ToastDescription />
                <ToastAction />
                <ToastClose aria-label="Close">×</ToastClose>
              </ToastContent>
            </ToastRoot>
          )}
        </Data>
      )}
    </Region>
  );
}
const Marquee = htmlPart("span", "toast-marquee", () => toastStyles.marquee);
export function ToastMarquee(props: ComponentProps<typeof Marquee>) {
  const [box, setBox] = createSignal<HTMLSpanElement>();
  const [text, setText] = createSignal<HTMLSpanElement>();
  createEffect(
    () => [box(), text()] as const,
    ([outer, inner]) => (outer && inner ? bindPillMarquee(outer, inner) : undefined),
  );
  return (
    <Marquee {...omit(props, "children", "ref")} ref={[setBox, props.ref]}>
      <span ref={setText} {...attributes(toastStyles.marqueeText)}>
        {props.children}
      </span>
    </Marquee>
  );
}
function PillDigit(props: { value: number; place: number }) {
  const digit = (value: number) => Math.floor(value / props.place) % 10;
  const visible = (value: number) => (props.place === 1 || value >= props.place ? 1 : 0);
  const [node, setNode] = createSignal<HTMLSpanElement>();
  // Solid tracks the next value in the effect. The first row also renders on the server.
  const initial = untrack(() => props.value);
  const [motion, setMotion] = createSignal<{ update: (value: number) => void }>();
  createEffect(node, (element) => {
    const template = element?.firstElementChild as HTMLElement | null;
    if (!template || !element) return;
    let last = initial,
      target = 0;
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
      element.style.setProperty("--toast-digit-presence", String(Math.min(1, Math.max(0, value)))),
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
    setMotion({ update });
    return () => {
      preference.removeEventListener("change", settle);
      roll.stop();
      width.stop();
    };
  });
  createEffect(
    () => [motion(), props.value] as const,
    ([binding, next]) => binding?.update(next),
  );
  return (
    <span
      ref={setNode}
      {...attributes(toastStyles.digit)}
      style={{ "--toast-digit-presence": String(visible(initial)) }}
    >
      <span data-row="0" {...attributes(toastStyles.digitRow)}>
        {digit(initial)}
      </span>
    </span>
  );
}
export function ToastProgress(props: ComponentProps<typeof ProgressCircle.Root>) {
  const percent = () => {
    const min = props.min ?? 0,
      max = props.max ?? 100;
    return max > min
      ? Math.round(100 * Math.min(1, Math.max(0, ((props.value ?? min) - min) / (max - min))))
      : 0;
  };
  return (
    <ProgressCircle.Root
      {...omit(props, "children", "xstyle")}
      data-lenso-slot="toast-progress"
      xstyle={[toastStyles.pillProgress, props.xstyle]}
    >
      {(state) => (
        <>
          <ProgressCircle.Track xstyle={toastStyles.pillProgressTrack}>
            <ProgressCircle.TrackCircle xstyle={toastStyles.pillProgressTrackCircle} />
            <ProgressCircle.FillCircle xstyle={toastStyles.progressFill} />
          </ProgressCircle.Track>
          {typeof props.children === "function" ? props.children(state) : props.children}
          <Show when={props.value != null}>
            <span aria-hidden="true" {...attributes(toastStyles.pillProgressValue)}>
              <span {...attributes(toastStyles.number)}>
                <For each={[100, 10, 1]}>
                  {(place) => <PillDigit place={place} value={percent()} />}
                </For>
              </span>
              %
            </span>
          </Show>
        </>
      )}
    </ProgressCircle.Root>
  );
}
export const Toast: typeof ToastRoot & {
  Progress: typeof ToastProgress;
  Marquee: typeof ToastMarquee;
  Root: typeof ToastRoot;
  Region: typeof ToastRegion;
  Title: typeof ToastTitle;
  Description: typeof ToastDescription;
  Action: typeof ToastAction;
  Close: typeof ToastClose;
  Content: typeof ToastContent;
  Indicator: typeof ToastIndicator;
} = Object.assign(ToastRoot, {
  Progress: ToastProgress,
  Marquee: ToastMarquee,
  Root: ToastRoot,
  Region: ToastRegion,
  Title: ToastTitle,
  Description: ToastDescription,
  Action: ToastAction,
  Close: ToastClose,
  Content: ToastContent,
  Indicator: ToastIndicator,
});
