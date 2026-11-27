import { attachGlass } from "@lenso/glass";
import { glassIsOpaque, observeGlassPreferences } from "@lenso/glass/fusion";
import { trackSheetPresentation } from "@lenso/primitives/sheet/core";
import { vibrantStyles, materialStyles, liquidMaterialStyles } from "@lenso/tokens/materials";
import { modalStyles } from "@lenso/tokens/modal";
import { sheetStyles } from "@lenso/tokens/sheet";
import {
  type SnapPoint,
  Drawer as SdkRoot,
  DrawerTrigger as SdkTrigger,
  DrawerBackdrop as SdkBackdrop,
  DrawerContent as SdkContent,
  DrawerTitle as SdkTitle,
  DrawerDescription as SdkDescription,
  DrawerClose as SdkClose,
  DrawerHandle as SdkHandle,
} from "@ui-sdk/vue/drawer";
import {
  computed,
  defineComponent,
  h,
  inject,
  provide,
  shallowRef,
  watchPostEffect,
  type InjectionKey,
  type PropType,
} from "vue";
import { overlayClose } from "./overlay-close.js";
import {
  partAttributes,
  type HtmlPart,
  type StyleXArgument,
  htmlPart,
  sdkPart,
  type StyledPart,
} from "./parts.js";
import { slotElements } from "./slot-elements.js";

type Presentation = { snapPoints: readonly SnapPoint[]; attached: readonly SnapPoint[] };
const SheetContext: InjectionKey<{
  depth: number;
  dim: () => boolean;
  presentation: () => Presentation | undefined;
}> = Symbol("Sheet");
const defaultContext = { depth: 0, dim: () => true, presentation: () => undefined };
const samePoints = (a: readonly SnapPoint[], b: readonly SnapPoint[]) =>
  a.length === b.length && a.every((point, index) => point === b[index]);

export const SheetRoot = defineComponent({
  inheritAttrs: false,
  props: {
    dim: { type: Boolean, default: true },
    snapPoints: { type: Array as PropType<SnapPoint[]>, default: () => [0.525, 1] },
    edgeAttachedSnapPoints: Array as PropType<readonly SnapPoint[]>,
    expandOnScroll: Boolean,
  },
  setup(props, { attrs, slots }) {
    const parent = inject(SheetContext, defaultContext);
    const presentation = computed<Presentation | undefined>((previous) => {
      const attached = props.edgeAttachedSnapPoints;
      if (!attached) return undefined;
      const points = [...props.snapPoints],
        edges = [...attached];
      return previous &&
        samePoints(previous.snapPoints, points) &&
        samePoints(previous.attached, edges)
        ? previous
        : { snapPoints: points, attached: edges };
    });
    provide(SheetContext, {
      depth: parent.depth + 1,
      dim: () => props.dim,
      presentation: () => presentation.value,
    });
    return () =>
      h(
        SdkRoot,
        {
          ...attrs,
          snapPoints: props.snapPoints,
          expandOnScroll: props.expandOnScroll,
          side: "bottom",
        },
        slots,
      );
  },
}) as unknown as StyledPart<
  typeof SdkRoot,
  { dim?: boolean; edgeAttachedSnapPoints?: readonly SnapPoint[] }
>;
export const SheetTrigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "sheet-trigger",
  () => modalStyles.trigger,
);
export const SheetBackdrop = defineComponent({
  inheritAttrs: false,
  props: { dim: { type: Boolean, default: undefined } },
  setup(props, { attrs, slots }) {
    const context = inject(SheetContext, defaultContext);
    return () =>
      h(
        SdkBackdrop,
        partAttributes(
          "sheet-backdrop",
          [sheetStyles.backdrop, !(props.dim ?? context.dim()) && sheetStyles.undimmed],
          attrs,
        ),
        slots,
      );
  },
}) as unknown as StyledPart<typeof SdkBackdrop, { dim?: boolean }>;
export const SheetContent = defineComponent({
  inheritAttrs: false,
  props: { surfaceXstyle: [Array, Object] as PropType<StyleXArgument> },
  setup(props, { attrs, slots }) {
    const context = inject(SheetContext, defaultContext);
    return () =>
      h(
        SdkContent,
        partAttributes(
          "sheet-popup",
          [
            sheetStyles.popup,
            sheetStyles.nativeContent,
            !!context.presentation() && sheetStyles.adaptivePopup,
          ],
          {
            ...attrs,
            "data-sheet-adaptive": context.presentation() ? "" : undefined,
            "data-sheet-nested": context.depth > 1 ? "" : undefined,
          },
        ),
        {
          ...slots,
          default: (state: unknown) => {
            const children = slots["default"]?.(state);
            const elements = slotElements(children);
            if (elements.length === 1 && elements[0]?.type === SheetSurface) return children;
            return h(SheetSurface, { xstyle: props.surfaceXstyle }, { default: () => children });
          },
        },
      );
  },
}) as unknown as StyledPart<typeof SdkContent, { surfaceXstyle?: StyleXArgument }>;
export const SheetTitle: StyledPart<typeof SdkTitle> = sdkPart(
  SdkTitle,
  "sheet-title",
  () => sheetStyles.title,
);
export const SheetDescription: StyledPart<typeof SdkDescription> = sdkPart(
  SdkDescription,
  "sheet-description",
  () => undefined,
);
export const SheetClose: StyledPart<typeof SdkClose> = overlayClose(
  SdkClose,
  "sheet-close",
  sheetStyles.close,
);
export const SheetHeader = htmlPart("div", "sheet-header", () => sheetStyles.header);
export const SheetBody = htmlPart("div", "sheet-body", () => sheetStyles.body);
export const SheetFooter = htmlPart("div", "sheet-footer", () => sheetStyles.footer);
export const SheetHandle = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        SdkHandle,
        partAttributes("sheet-handle", sheetStyles.handle, {
          "aria-label": "Resize sheet",
          ...attrs,
        }),
        {
          ...slots,
          default:
            slots["default"] ??
            (() =>
              h(
                "span",
                partAttributes(
                  "sheet-handle-bar",
                  [vibrantStyles.fill, vibrantStyles.primaryFill, sheetStyles.handleBar],
                  {},
                ),
              )),
        },
      );
  },
}) as unknown as StyledPart<typeof SdkHandle>;
const adaptiveSurface = {
  "--sheet-visible-height":
    "calc(100% - var(--sheet-shared-position, var(--sheet-presentation-offset, var(--sheet-snap-offset, 0px))) - var(--sheet-nesting-offset, 0px) - var(--sheet-edge-inset, 0px))",
  "--sheet-adaptive-background": "transparent",
  "--sheet-adaptive-shadow": "0 15px 75px rgb(0 0 0 / calc(.18 * var(--sheet-solid-opacity, 0)))",
  "--sheet-adaptive-filter":
    "blur(var(--lenso-glass-medium-blur, 8px)) var(--sheet-glass-filter, saturate(1))",
  "--sheet-glass-display": "block",
  "--sheet-solid-display": "block",
};
export const SheetSurface = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const context = inject(SheetContext, defaultContext),
      surface = shallowRef<HTMLElement>(),
      lens = shallowRef<HTMLElement>(),
      opaque = shallowRef(false);
    watchPostEffect((cleanup) => {
      const node = surface.value;
      if (!node) return;
      const update = () => {
        opaque.value = glassIsOpaque(node);
        node.toggleAttribute("data-material-opaque", opaque.value);
      };
      update();
      cleanup(observeGlassPreferences(node, update));
    });
    watchPostEffect((cleanup) => {
      const node = surface.value,
        glass = lens.value;
      if (!node || !glass) return;
      const stop = attachGlass(glass, { profileKey: "glass-medium", liveGeometry: true });
      const sync = () =>
        node.style.setProperty(
          "--sheet-glass-filter",
          glass.style.getPropertyValue("--lg-filter") || "saturate(1)",
        );
      const observer = new MutationObserver(sync);
      observer.observe(glass, { attributes: true, attributeFilter: ["style"] });
      sync();
      cleanup(() => {
        observer.disconnect();
        stop();
        node.style.removeProperty("--sheet-glass-filter");
      });
    });
    watchPostEffect((cleanup) => {
      const node = surface.value,
        popup = node?.parentElement,
        viewport = popup?.parentElement,
        presentation = context.presentation();
      if (node && popup && viewport && presentation)
        cleanup(trackSheetPresentation(popup, node, viewport, presentation));
    });
    return () =>
      h(
        "div",
        {
          ...partAttributes(
            "sheet-surface",
            [materialStyles.root, materialStyles.accessible, sheetStyles.surface],
            {
              ...attrs,
              style: [
                {
                  "--sheet-base-solid-background":
                    "light-dark(var(--lenso-background-primary), var(--lenso-background-secondary))",
                },
                context.presentation() && adaptiveSurface,
                attrs["style"],
              ],
            },
          ),
          ref: surface,
        },
        [
          !opaque.value &&
            h("span", {
              ...partAttributes(
                "sheet-glass",
                [
                  materialStyles.layer,
                  liquidMaterialStyles.small,
                  liquidMaterialStyles.medium,
                  sheetStyles.glass,
                ],
                { "aria-hidden": true, "data-material-lens": "" },
              ),
              ref: lens,
            }),
          h("div", partAttributes("sheet-solid", sheetStyles.solid, {})),
          slots["default"]?.(),
        ],
      );
  },
}) as unknown as HtmlPart<"div">;
export const Sheet: typeof SheetRoot & {
  Root: typeof SheetRoot;
  Trigger: typeof SheetTrigger;
  Backdrop: typeof SheetBackdrop;
  Content: typeof SheetContent;
  Title: typeof SheetTitle;
  Description: typeof SheetDescription;
  Close: typeof SheetClose;
  Header: typeof SheetHeader;
  Body: typeof SheetBody;
  Footer: typeof SheetFooter;
  Handle: typeof SheetHandle;
  Surface: typeof SheetSurface;
} = Object.assign(SheetRoot, {
  Root: SheetRoot,
  Trigger: SheetTrigger,
  Backdrop: SheetBackdrop,
  Content: SheetContent,
  Title: SheetTitle,
  Description: SheetDescription,
  Close: SheetClose,
  Header: SheetHeader,
  Body: SheetBody,
  Footer: SheetFooter,
  Handle: SheetHandle,
  Surface: SheetSurface,
});
