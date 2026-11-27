import { modalStyles } from "@lenso/tokens/modal";
import {
  Dialog as SdkRoot,
  DialogTrigger as SdkTrigger,
  DialogBackdrop as SdkBackdrop,
  DialogContent as SdkContent,
  DialogTitle as SdkTitle,
  DialogDescription as SdkDescription,
  DialogClose as SdkClose,
} from "@ui-sdk/vue/dialog";
import { defineComponent, h, inject, provide, type InjectionKey, type PropType } from "vue";
import { overlayClose } from "./overlay-close.js";
import { partAttributes, htmlPart, sdkPart, type StyledPart } from "./parts.js";

type Scroll = "inside" | "outside";
type Placement = "auto" | "top" | "center" | "bottom";
type Size = "xs" | "sm" | "md" | "lg" | "cover" | "full";
const ModalScroll: InjectionKey<() => Scroll> = Symbol("ModalScroll");

export const ModalRoot = defineComponent({
  inheritAttrs: false,
  props: { scroll: { type: String as PropType<Scroll>, default: "inside" } },
  setup(props, { attrs, slots }) {
    provide(ModalScroll, () => props.scroll);
    return () => h(SdkRoot, attrs, slots);
  },
}) as unknown as StyledPart<typeof SdkRoot, { scroll?: Scroll }>;
export const ModalTrigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "modal-trigger",
  () => modalStyles.trigger,
);
export const ModalBackdrop: StyledPart<
  typeof SdkBackdrop,
  { variant?: "transparent" | "opaque" | "blur" }
> = sdkPart<typeof SdkBackdrop, { variant?: "transparent" | "opaque" | "blur" }>(
  SdkBackdrop,
  "modal-backdrop",
  (props) => [modalStyles.backdrop, modalStyles[props.variant ?? "opaque"]],
  "variant",
);
export const ModalContent = defineComponent({
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<Size>, default: "md" },
    placement: { type: String as PropType<Placement>, default: "auto" },
    scroll: String as PropType<Scroll>,
  },
  setup(props, { attrs, slots }) {
    const inherited = inject(ModalScroll, () => "inside" as Scroll);
    return () => {
      const scroll = props.scroll ?? inherited();
      return h(
        SdkContent,
        partAttributes(
          "modal-popup",
          [
            modalStyles.popup,
            modalStyles[props.size],
            modalStyles[scroll],
            modalStyles.nativeContent,
          ],
          {
            ...attrs,
            "data-size": props.size,
            "data-placement": props.placement,
            "data-scroll": scroll,
          },
        ),
        slots,
      );
    };
  },
}) as unknown as StyledPart<
  typeof SdkContent,
  { size?: Size; placement?: Placement; scroll?: Scroll }
>;
export const ModalTitle: StyledPart<typeof SdkTitle> = sdkPart(
  SdkTitle,
  "modal-title",
  () => modalStyles.title,
);
export const ModalDescription: StyledPart<typeof SdkDescription> = sdkPart(
  SdkDescription,
  "modal-description",
  () => modalStyles.description,
);
export const ModalClose: StyledPart<typeof SdkClose> = overlayClose(
  SdkClose,
  "modal-close",
  modalStyles.close,
);
export const ModalHeader = htmlPart("div", "modal-header", () => modalStyles.header);
export const ModalBody = htmlPart("div", "modal-body", () => modalStyles.body);
export const ModalFooter = htmlPart("div", "modal-footer", () => modalStyles.footer);
export const ModalIcon = htmlPart("div", "modal-icon", () => modalStyles.icon);

export const Modal: typeof ModalRoot & {
  Root: typeof ModalRoot;
  Trigger: typeof ModalTrigger;
  Backdrop: typeof ModalBackdrop;
  Content: typeof ModalContent;
  Title: typeof ModalTitle;
  Description: typeof ModalDescription;
  Close: typeof ModalClose;
  Header: typeof ModalHeader;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
  Icon: typeof ModalIcon;
} = Object.assign(ModalRoot, {
  Root: ModalRoot,
  Trigger: ModalTrigger,
  Backdrop: ModalBackdrop,
  Content: ModalContent,
  Title: ModalTitle,
  Description: ModalDescription,
  Close: ModalClose,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
  Icon: ModalIcon,
});
