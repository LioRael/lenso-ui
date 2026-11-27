import { attachGlass } from "@lenso/glass";
import { alertDialogIconStyles, alertDialogStyles } from "@lenso/tokens/alert-dialog";
import { materialStyles, liquidMaterialStyles } from "@lenso/tokens/materials";
import {
  AlertDialog as SdkRoot,
  AlertDialogTrigger as SdkTrigger,
  AlertDialogBackdrop as SdkBackdrop,
  AlertDialogContent as SdkContent,
  AlertDialogTitle as SdkTitle,
  AlertDialogDescription as SdkDescription,
  AlertDialogClose as SdkClose,
  AlertDialogClose as SdkAction,
} from "@ui-sdk/vue/alert-dialog";
import { defineComponent, h, type PropType, shallowRef, watchPostEffect } from "vue";
import { DangerIcon, InfoIcon, SuccessIcon, WarningIcon } from "./icons.js";
import { overlayClose } from "./overlay-close.js";
import {
  partAttributes,
  type HtmlPart,
  forwardPart,
  htmlPart,
  sdkPart,
  type StyledPart,
} from "./parts.js";

type Size = "xs" | "sm" | "md" | "lg" | "cover";
type Placement = "auto" | "top" | "center" | "bottom";

export const AlertDialogRoot: typeof SdkRoot = forwardPart(SdkRoot);
export const AlertDialogTrigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "alert-dialog-trigger",
  () => alertDialogStyles.trigger,
);
export const AlertDialogBackdrop: StyledPart<
  typeof SdkBackdrop,
  { variant?: "transparent" | "opaque" | "blur" }
> = sdkPart<typeof SdkBackdrop, { variant?: "transparent" | "opaque" | "blur" }>(
  SdkBackdrop,
  "alert-dialog-backdrop",
  (props) => [alertDialogStyles.backdrop, alertDialogStyles[props.variant ?? "opaque"]],
  "variant",
);
export const AlertDialogContent = defineComponent({
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<Size>, default: "md" },
    placement: { type: String as PropType<Placement>, default: "center" },
  },
  setup(props, { attrs, slots }) {
    const scroller = shallowRef<HTMLElement>();
    watchPostEffect((cleanup) => {
      const popup = scroller.value?.parentElement;
      if (popup) cleanup(attachGlass(popup, { profileKey: "glass-medium", liveGeometry: true }));
    });
    return () =>
      h(
        SdkContent,
        partAttributes(
          "alert-dialog-popup",
          [
            materialStyles.root,
            liquidMaterialStyles.small,
            liquidMaterialStyles.medium,
            liquidMaterialStyles.compact,
            materialStyles.accessible,
            alertDialogStyles.popup,
            alertDialogStyles[props.size],
            alertDialogStyles.nativeContent,
          ],
          { ...attrs, "data-material": "glass-medium", "data-placement": props.placement },
        ),
        {
          ...slots,
          default: (state: unknown) =>
            h(
              "div",
              {
                ...partAttributes("alert-dialog-scroller", alertDialogStyles.scroller, {}),
                ref: scroller,
              },
              slots["default"]?.(state),
            ),
        },
      );
  },
}) as unknown as StyledPart<typeof SdkContent, { size?: Size; placement?: Placement }>;
export const AlertDialogTitle: StyledPart<typeof SdkTitle> = sdkPart(
  SdkTitle,
  "alert-dialog-title",
  () => alertDialogStyles.title,
);
export const AlertDialogDescription: StyledPart<typeof SdkDescription> = sdkPart(
  SdkDescription,
  "alert-dialog-description",
  () => alertDialogStyles.description,
);
export const AlertDialogClose: StyledPart<typeof SdkClose> = overlayClose(
  SdkClose,
  "alert-dialog-close",
  alertDialogStyles.close,
  alertDialogStyles.action,
);
export const AlertDialogHeader = htmlPart(
  "div",
  "alert-dialog-header",
  () => alertDialogStyles.header,
);
export const AlertDialogBody = htmlPart("div", "alert-dialog-body", () => alertDialogStyles.body);
type Layout = "auto" | "stacked" | "side-by-side";
export const AlertDialogFooter = defineComponent({
  inheritAttrs: false,
  props: { layout: { type: String, default: "auto" } },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "div",
        partAttributes("alert-dialog-footer", alertDialogStyles.footer, {
          ...attrs,
          "data-layout": props.layout,
        }),
        slots["default"]?.(),
      );
  },
}) as unknown as HtmlPart<"div", { layout?: Layout }>;
export const AlertDialogAction = defineComponent({
  inheritAttrs: false,
  props: { variant: { type: String, default: "default" } },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        SdkAction,
        partAttributes(
          "alert-dialog-action",
          [
            alertDialogStyles.action,
            props.variant === "default" && alertDialogStyles.defaultAction,
            props.variant === "destructive" && alertDialogStyles.destructive,
          ],
          { ...attrs, "data-variant": props.variant },
        ),
        slots,
      );
  },
}) as unknown as StyledPart<typeof SdkAction, { variant?: "default" | "cancel" | "destructive" }>;
export const AlertDialogFields = htmlPart(
  "div",
  "alert-dialog-fields",
  () => alertDialogStyles.fields,
);
const icons = {
  danger: DangerIcon,
  success: SuccessIcon,
  default: InfoIcon,
  accent: InfoIcon,
  warning: WarningIcon,
};
export const AlertDialogIcon = defineComponent({
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<keyof typeof alertDialogIconStyles>, default: "danger" },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "div",
        partAttributes(
          "alert-dialog-icon",
          [alertDialogStyles.icon, alertDialogIconStyles[props.variant]],
          { "aria-hidden": slots["default"] ? undefined : true, ...attrs },
        ),
        slots["default"]?.() ?? [
          h(icons[props.variant] ?? InfoIcon, {
            "data-lenso-slot": "alert-dialog-default-icon",
            width: 20,
            height: 20,
          }),
        ],
      );
  },
}) as unknown as HtmlPart<"div", { variant?: keyof typeof alertDialogIconStyles }>;
export const AlertDialog: typeof AlertDialogRoot & {
  Root: typeof AlertDialogRoot;
  Trigger: typeof AlertDialogTrigger;
  Backdrop: typeof AlertDialogBackdrop;
  Content: typeof AlertDialogContent;
  Title: typeof AlertDialogTitle;
  Description: typeof AlertDialogDescription;
  Close: typeof AlertDialogClose;
  Header: typeof AlertDialogHeader;
  Body: typeof AlertDialogBody;
  Footer: typeof AlertDialogFooter;
  Action: typeof AlertDialogAction;
  Fields: typeof AlertDialogFields;
  Icon: typeof AlertDialogIcon;
} = Object.assign(AlertDialogRoot, {
  Root: AlertDialogRoot,
  Trigger: AlertDialogTrigger,
  Backdrop: AlertDialogBackdrop,
  Content: AlertDialogContent,
  Title: AlertDialogTitle,
  Description: AlertDialogDescription,
  Close: AlertDialogClose,
  Header: AlertDialogHeader,
  Body: AlertDialogBody,
  Footer: AlertDialogFooter,
  Action: AlertDialogAction,
  Fields: AlertDialogFields,
  Icon: AlertDialogIcon,
});
