"use client";
// HeroUI v3.2.6 anatomy, Apache-2.0; native alertdialog semantics.
import * as React from "react";
import { AlertDialog as Base } from "@base-ui/react/alert-dialog";
import { alertDialogStyles as s, alertDialogIconStyles as tones } from "@lenso/tokens/alert-dialog";
import { closeButtonStyles } from "@lenso/tokens/close-button";
import { DangerIcon, InfoIcon, SuccessIcon, WarningIcon } from "../../icons/index.js";
import { styledPart } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";

export function AlertDialogRoot<Payload = unknown>(props: Base.Root.Props<Payload>) {
  return <Base.Root {...props} />;
}
export const AlertDialogTrigger = styledPart(Base.Trigger, "alert-dialog-trigger", s.trigger);
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
const Backdrop = styledPart(Base.Backdrop, "alert-dialog-backdrop", s.backdrop);
export function AlertDialogBackdrop({
  variant = "opaque",
  xstyle,
  ...props
}: React.ComponentProps<typeof Backdrop> & { variant?: "transparent" | "opaque" | "blur" }) {
  return <Backdrop {...props} xstyle={[s[variant], xstyle]} />;
}
export const AlertDialogViewport = styledPart(Base.Viewport, "alert-dialog-viewport", s.viewport);
const Popup = styledPart(Base.Popup, "alert-dialog-popup", s.popup);
export function AlertDialogPopup({
  size = "md",
  placement = "auto",
  xstyle,
  ...props
}: React.ComponentProps<typeof Popup> & {
  size?: "xs" | "sm" | "md" | "lg" | "cover";
  placement?: "auto" | "top" | "center" | "bottom";
}) {
  return <Popup {...props} data-placement={placement} xstyle={[s[size], s.inside, xstyle]} />;
}
export const AlertDialogTitle = styledPart(Base.Title, "alert-dialog-title", s.title);
export const AlertDialogDescription = styledPart(
  Base.Description,
  "alert-dialog-description",
  s.description,
);
const Close = styledPart(Base.Close, "alert-dialog-close");
const CloseIcon = styledPart("svg", "close-button-icon", closeButtonStyles.icon);
export function AlertDialogClose({
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
export const AlertDialogHeader = styledPart("div", "alert-dialog-header", s.header);
export const AlertDialogBody = styledPart("div", "alert-dialog-body", s.body);
export const AlertDialogFooter = styledPart("div", "alert-dialog-footer", s.footer);
const Icon = styledPart("div", "alert-dialog-icon", s.icon);
export function AlertDialogIcon({
  variant = "danger",
  xstyle,
  children,
  ...props
}: React.ComponentProps<typeof Icon> & { variant?: keyof typeof tones }) {
  const DefaultIcon =
    variant === "success"
      ? SuccessIcon
      : variant === "warning"
        ? WarningIcon
        : variant === "danger"
          ? DangerIcon
          : InfoIcon;
  return (
    <Icon
      aria-hidden={children == null ? true : undefined}
      {...props}
      xstyle={[tones[variant], xstyle]}
    >
      {children ?? <DefaultIcon data-slot="alert-dialog-default-icon" width={20} height={20} />}
    </Icon>
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
