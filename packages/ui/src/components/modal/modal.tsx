"use client";
import * as SdkDialog from "@ui-sdk/react/dialog";
import { slotRender } from "../../utils/sdk-render.js";
// Native top-layer interaction is owned by UI SDK.
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { modalStyles as s } from "@lenso/tokens/modal";
import { closeButtonStyles } from "@lenso/tokens/close-button";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

const ScrollContext = React.createContext<"inside" | "outside">("inside");
export function ModalRoot({
  scroll = "inside",
  ...props
}: React.ComponentProps<typeof SdkDialog.Dialog> & { scroll?: "inside" | "outside" }) {
  return (
    <ScrollContext.Provider value={scroll}>
      <SdkDialog.Dialog {...props} />
    </ScrollContext.Provider>
  );
}
export function ModalTrigger({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkDialog.DialogTrigger>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkDialog.DialogTrigger>, "ref">) {
  const ownPresentation =
    props.render == null ||
    (React.isValidElement(props.render) && typeof props.render.type === "string");
  const compiled = stylex.props(ownPresentation && s.trigger, xstyle);
  return (
    <SdkDialog.DialogTrigger
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "button",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "modal-trigger",
        props.render,
      )}
    />
  );
}
export function ModalBackdrop({
  variant = "opaque",
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkDialog.DialogBackdrop>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkDialog.DialogBackdrop>, "ref"> & {
    variant?: "transparent" | "opaque" | "blur";
  }) {
  const compiled = stylex.props(s.backdrop, s[variant], xstyle);
  return (
    <SdkDialog.DialogBackdrop
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "div",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "modal-backdrop",
        props.render,
      )}
    />
  );
}
export function ModalContent({
  size = "md",
  placement = "auto",
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkDialog.DialogContent>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkDialog.DialogContent>, "ref"> & {
    size?: "xs" | "sm" | "md" | "lg" | "cover" | "full";
    placement?: "auto" | "top" | "center" | "bottom";
  }) {
  const scroll = React.useContext(ScrollContext);
  const compiled = stylex.props(s.popup, s[size], s[scroll], s.nativeContent, xstyle);
  return (
    <SdkDialog.DialogContent
      {...props}
      data-size={size}
      data-placement={placement}
      data-scroll={scroll}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "div",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "modal-popup",
        props.render,
      )}
    />
  );
}
export function ModalTitle({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkDialog.DialogTitle>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkDialog.DialogTitle>, "ref">) {
  const compiled = stylex.props(s.title, xstyle);
  return (
    <SdkDialog.DialogTitle
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "h2",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "modal-title",
        props.render,
      )}
    />
  );
}
export function ModalDescription({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkDialog.DialogDescription>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkDialog.DialogDescription>, "ref">) {
  const compiled = stylex.props(s.description, xstyle);
  return (
    <SdkDialog.DialogDescription
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "p",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "modal-description",
        props.render,
      )}
    />
  );
}
export function ModalClose({
  children,
  render,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkDialog.DialogClose>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkDialog.DialogClose>, "ref">) {
  const bare = children === undefined && render === undefined;
  const compiled = stylex.props(bare && closeButtonStyles.root, bare && s.close, xstyle);
  return (
    <SdkDialog.DialogClose
      aria-label={bare ? "Close" : undefined}
      {...props}

      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "button",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "modal-close",
        render,
      )}
    >
      {bare ? (
        <svg
          {...stylex.props(closeButtonStyles.icon)}
          data-lenso-slot="close-button-icon"
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
    </SdkDialog.DialogClose>
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
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "modal-header"
      }
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
      data-lenso-slot={(props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "modal-body"}
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
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "modal-footer"
      }
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
      data-lenso-slot={(props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "modal-icon"}
    />
  );
}
export const Modal = Object.assign(ModalRoot, {
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
