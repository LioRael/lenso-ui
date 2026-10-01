"use client";
// HeroUI v3.2.6 anatomy, Apache-2.0; interactions use Base UI 1.7.
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Dialog } from "@base-ui/react/dialog";
import { modalStyles as s } from "@lenso/tokens/modal";
import { closeButtonStyles } from "@lenso/tokens/close-button";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
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
export function ModalTrigger({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Dialog.Trigger.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Dialog.Trigger>, "ref">) {
  const compiled = stylex.props(s.trigger, xstyle);
  return (
    <Dialog.Trigger
      {...props}
      {...compiled}
      style={mergeStyle<Dialog.Trigger.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "modal-trigger"}
    />
  );
}
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
export function ModalBackdrop({
  variant = "opaque",
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Dialog.Backdrop.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Dialog.Backdrop>, "ref"> & {
    variant?: "transparent" | "opaque" | "blur";
  }) {
  const compiled = stylex.props(s.backdrop, s[variant], xstyle);
  return (
    <Dialog.Backdrop
      {...props}
      {...compiled}
      style={mergeStyle<Dialog.Backdrop.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "modal-backdrop"}
    />
  );
}
export function ModalViewport({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Dialog.Viewport.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Dialog.Viewport>, "ref">) {
  const compiled = stylex.props(s.viewport, xstyle);
  return (
    <Dialog.Viewport
      {...props}
      {...compiled}
      style={mergeStyle<Dialog.Viewport.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "modal-viewport"}
    />
  );
}
export function ModalPopup({
  size = "md",
  placement = "auto",
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Dialog.Popup.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Dialog.Popup>, "ref"> & {
    size?: "xs" | "sm" | "md" | "lg" | "cover" | "full";
    placement?: "auto" | "top" | "center" | "bottom";
  }) {
  const scroll = React.useContext(ScrollContext);
  const compiled = stylex.props(s.popup, s[size], s[scroll], xstyle);
  return (
    <Dialog.Popup
      {...props}
      data-size={size}
      data-placement={placement}
      data-scroll={scroll}
      {...compiled}
      style={mergeStyle<Dialog.Popup.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "modal-popup"}
    />
  );
}
export function ModalTitle({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Dialog.Title.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Dialog.Title>, "ref">) {
  const compiled = stylex.props(s.title, xstyle);
  return (
    <Dialog.Title
      {...props}
      {...compiled}
      style={mergeStyle<Dialog.Title.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "modal-title"}
    />
  );
}
export function ModalDescription({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Dialog.Description.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Dialog.Description>, "ref">) {
  const compiled = stylex.props(s.description, xstyle);
  return (
    <Dialog.Description
      {...props}
      {...compiled}
      style={mergeStyle<Dialog.Description.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "modal-description"}
    />
  );
}
export function ModalClose({
  children,
  render,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Dialog.Close.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Dialog.Close>, "ref">) {
  const bare = children === undefined && render === undefined;
  const compiled = stylex.props(bare && closeButtonStyles.root, bare && s.close, xstyle);
  return (
    <Dialog.Close
      aria-label={bare ? "Close" : undefined}
      {...props}
      render={render}
      {...compiled}
      style={mergeStyle<Dialog.Close.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "modal-close"}
    >
      {bare ? (
        <svg
          {...stylex.props(closeButtonStyles.icon)}
          data-slot="close-button-icon"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m4 4 8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        children
      )}
    </Dialog.Close>
  );
}
export function ModalHeader({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(s.header, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "modal-header"}
    />
  );
}
export function ModalBody({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">>) {
  const scroll = React.useContext(ScrollContext);
  const compiled = stylex.props(s.body, scroll === "outside" && s.bodyOutside, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "modal-body"}
    />
  );
}
export function ModalFooter({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(s.footer, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "modal-footer"}
    />
  );
}
export function ModalIcon({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(s.icon, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "modal-icon"}
    />
  );
}
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
