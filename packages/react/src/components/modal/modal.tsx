"use client";
// HeroUI v3.2.6 anatomy, Apache-2.0; interactions use Base UI 1.7.
import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { modalStyles as s } from "@lenso/tokens/modal";
import { closeButtonStyles } from "@lenso/tokens/close-button";
import { styledPart } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";

const ScrollContext = React.createContext<"inside" | "outside">("inside");
export function ModalRoot<Payload = unknown>({
  scroll = "inside",
  ...props
}: Dialog.Root.Props<Payload> & { scroll?: "inside" | "outside" }) {
  return (
    <ScrollContext.Provider value={scroll}>
      <Dialog.Root {...props} />
    </ScrollContext.Provider>
  );
}
export const ModalTrigger = styledPart(Dialog.Trigger, "modal-trigger", s.trigger);
export function ModalPortal({
  container,
  ...props
}: React.ComponentPropsWithRef<typeof Dialog.Portal>) {
  const themed = useThemePortalContainer();
  return (
    <Dialog.Portal
      {...props}
      container={container === undefined ? (themed ?? undefined) : container}
    />
  );
}
const Backdrop = styledPart(Dialog.Backdrop, "modal-backdrop", s.backdrop);
export function ModalBackdrop({
  variant = "opaque",
  xstyle,
  ...props
}: React.ComponentProps<typeof Backdrop> & { variant?: "transparent" | "opaque" | "blur" }) {
  return <Backdrop {...props} xstyle={[s[variant], xstyle]} />;
}
export const ModalViewport = styledPart(Dialog.Viewport, "modal-viewport", s.viewport);
const Popup = styledPart(Dialog.Popup, "modal-popup", s.popup);
export function ModalPopup({
  size = "md",
  placement = "auto",
  xstyle,
  ...props
}: React.ComponentProps<typeof Popup> & {
  size?: "xs" | "sm" | "md" | "lg" | "cover" | "full";
  placement?: "auto" | "top" | "center" | "bottom";
}) {
  const scroll = React.useContext(ScrollContext);
  return (
    <Popup
      {...props}
      data-size={size}
      data-placement={placement}
      data-scroll={scroll}
      xstyle={[s[size], s[scroll], xstyle]}
    />
  );
}
export const ModalTitle = styledPart(Dialog.Title, "modal-title", s.title);
export const ModalDescription = styledPart(Dialog.Description, "modal-description", s.description);
const Close = styledPart(Dialog.Close, "modal-close");
const CloseIcon = styledPart("svg", "close-button-icon", closeButtonStyles.icon);
export function ModalClose({
  children,
  render,
  xstyle,
  ...props
}: React.ComponentProps<typeof Close>) {
  const bare = children === undefined && render === undefined;
  return (
    <Close
      aria-label={bare ? "Close" : undefined}
      {...props}
      render={render}
      xstyle={[bare && closeButtonStyles.root, bare && s.close, xstyle]}
    >
      {bare ? (
        <CloseIcon viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="m4 4 8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </CloseIcon>
      ) : (
        children
      )}
    </Close>
  );
}
export const ModalHeader = styledPart("div", "modal-header", s.header);
const Body = styledPart("div", "modal-body", s.body);
export function ModalBody({ xstyle, ...props }: React.ComponentProps<typeof Body>) {
  const scroll = React.useContext(ScrollContext);
  return <Body {...props} xstyle={[scroll === "outside" && s.bodyOutside, xstyle]} />;
}
export const ModalFooter = styledPart("div", "modal-footer", s.footer);
export const ModalIcon = styledPart("div", "modal-icon", s.icon);
export const Modal = Object.assign(ModalRoot, {
  Root: ModalRoot,
  Trigger: ModalTrigger,
  Portal: ModalPortal,
  Backdrop: ModalBackdrop,
  Viewport: ModalViewport,
  Popup: ModalPopup,
  Title: ModalTitle,
  Description: ModalDescription,
  Close: ModalClose,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
  Icon: ModalIcon,
});
