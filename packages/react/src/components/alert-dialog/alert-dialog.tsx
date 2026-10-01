"use client";
// HeroUI v3.2.6 anatomy, Apache-2.0; native alertdialog semantics.
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { AlertDialog as Base } from "@base-ui/react/alert-dialog";
import { alertDialogStyles as s, alertDialogIconStyles as tones } from "@lenso/tokens/alert-dialog";
import { closeButtonStyles } from "@lenso/tokens/close-button";
import { DangerIcon, InfoIcon, SuccessIcon, WarningIcon } from "../../icons/index.js";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";

export function AlertDialogRoot<Payload = unknown>(props: Base.Root.Props<Payload>) {
  return <Base.Root {...props} />;
}
export function AlertDialogTrigger({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Trigger.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Trigger>, "ref">) {
  const compiled = stylex.props(s.trigger, xstyle);
  return (
    <Base.Trigger
      {...props}
      {...compiled}
      style={mergeStyle<Base.Trigger.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "alert-dialog-trigger"}
    />
  );
}
export function AlertDialogPortal({
  container,
  ...props
}: React.ComponentPropsWithRef<typeof Base.Portal>) {
  const themed = useThemePortalContainer();
  return (
    <Base.Portal
      {...props}
      container={container === undefined ? (themed ?? undefined) : container}
    />
  );
}
export function AlertDialogBackdrop({
  variant = "opaque",
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Backdrop.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Backdrop>, "ref"> & {
    variant?: "transparent" | "opaque" | "blur";
  }) {
  const compiled = stylex.props(s.backdrop, s[variant], xstyle);
  return (
    <Base.Backdrop
      {...props}
      {...compiled}
      style={mergeStyle<Base.Backdrop.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "alert-dialog-backdrop"}
    />
  );
}
export function AlertDialogViewport({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Viewport.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Viewport>, "ref">) {
  const compiled = stylex.props(s.viewport, xstyle);
  return (
    <Base.Viewport
      {...props}
      {...compiled}
      style={mergeStyle<Base.Viewport.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "alert-dialog-viewport"}
    />
  );
}
export function AlertDialogPopup({
  size = "md",
  placement = "auto",
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Popup.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Popup>, "ref"> & {
    size?: "xs" | "sm" | "md" | "lg" | "cover";
    placement?: "auto" | "top" | "center" | "bottom";
  }) {
  const compiled = stylex.props(s.popup, s[size], s.inside, xstyle);
  return (
    <Base.Popup
      {...props}
      data-placement={placement}
      {...compiled}
      style={mergeStyle<Base.Popup.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "alert-dialog-popup"}
    />
  );
}
export function AlertDialogTitle({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Title.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Title>, "ref">) {
  const compiled = stylex.props(s.title, xstyle);
  return (
    <Base.Title
      {...props}
      {...compiled}
      style={mergeStyle<Base.Title.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "alert-dialog-title"}
    />
  );
}
export function AlertDialogDescription({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Description.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Description>, "ref">) {
  const compiled = stylex.props(s.description, xstyle);
  return (
    <Base.Description
      {...props}
      {...compiled}
      style={mergeStyle<Base.Description.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "alert-dialog-description"}
    />
  );
}
export function AlertDialogClose({
  children,
  render,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Close.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Close>, "ref">) {
  const bare = children === undefined && render === undefined;
  const compiled = stylex.props(bare && closeButtonStyles.root, bare && s.close, xstyle);
  return (
    <Base.Close
      aria-label={bare ? "Close" : undefined}
      {...props}
      render={render}
      {...compiled}
      style={mergeStyle<Base.Close.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "alert-dialog-close"}
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
    </Base.Close>
  );
}
export function AlertDialogHeader({
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "alert-dialog-header"}
    />
  );
}
export function AlertDialogBody({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(s.body, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "alert-dialog-body"}
    />
  );
}
export function AlertDialogFooter({
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "alert-dialog-footer"}
    />
  );
}
export function AlertDialogIcon({
  variant = "danger",
  xstyle,
  children,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { variant?: keyof typeof tones }) {
  const DefaultIcon =
    variant === "success"
      ? SuccessIcon
      : variant === "warning"
        ? WarningIcon
        : variant === "danger"
          ? DangerIcon
          : InfoIcon;
  const compiled = stylex.props(s.icon, tones[variant], xstyle);
  return (
    <div
      aria-hidden={children == null ? true : undefined}
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "alert-dialog-icon"}
    >
      {children ?? <DefaultIcon data-slot="alert-dialog-default-icon" width={20} height={20} />}
    </div>
  );
}
export const AlertDialog = Object.assign(AlertDialogRoot, {
  Root: AlertDialogRoot,
  Trigger: AlertDialogTrigger,
  Portal: AlertDialogPortal,
  Backdrop: AlertDialogBackdrop,
  Viewport: AlertDialogViewport,
  Popup: AlertDialogPopup,
  Title: AlertDialogTitle,
  Description: AlertDialogDescription,
  Close: AlertDialogClose,
  Header: AlertDialogHeader,
  Body: AlertDialogBody,
  Footer: AlertDialogFooter,
  Icon: AlertDialogIcon,
});
