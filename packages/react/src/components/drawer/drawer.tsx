"use client";
// HeroUI v3.2.6 anatomy, Apache-2.0; native Base UI swipe/snap contracts.
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Drawer as Base } from "@base-ui/react/drawer";
import { drawerStyles as s } from "@lenso/tokens/drawer";
import { modalStyles } from "@lenso/tokens/modal";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";

function cancelInterruptedSwipe(
  details: Pick<Base.Root.ChangeEventDetails, "reason" | "event" | "cancel">,
) {
  if (
    details.reason === "swipe" &&
    (details.event.type === "touchcancel" || details.event.type === "pointercancel")
  ) {
    details.cancel();
    return true;
  }
  return false;
}
export function DrawerRoot<Payload = unknown>({
  onOpenChange,
  onSnapPointChange,
  ...props
}: Base.Root.Props<Payload>) {
  return (
    <Base.Root
      {...props}
      onOpenChange={(open, details) => {
        if (cancelInterruptedSwipe(details)) return;
        onOpenChange?.(open, details);
      }}
      onSnapPointChange={(point, details) => {
        if (cancelInterruptedSwipe(details)) return;
        onSnapPointChange?.(point, details);
      }}
    />
  );
}
export const DrawerProvider = Base.Provider;
export function DrawerTrigger({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Trigger.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Trigger>, "ref">) {
  const compiled = stylex.props(modalStyles.trigger, xstyle);
  return (
    <Base.Trigger
      {...props}
      {...compiled}
      style={mergeStyle<Base.Trigger.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "drawer-trigger"}
    />
  );
}
export function DrawerPortal({
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
export function DrawerBackdrop({
  variant = "opaque",
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Backdrop.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Backdrop>, "ref"> & {
    variant?: "transparent" | "opaque" | "blur";
  }) {
  const compiled = stylex.props(s.backdrop, modalStyles[variant], xstyle);
  return (
    <Base.Backdrop
      {...props}
      {...compiled}
      style={mergeStyle<Base.Backdrop.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "drawer-backdrop"}
    />
  );
}
export function DrawerViewport({
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "drawer-viewport"}
    />
  );
}
export function DrawerPopup({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Popup.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Popup>, "ref">) {
  const compiled = stylex.props(s.popup, xstyle);
  return (
    <Base.Popup
      {...props}
      {...compiled}
      style={mergeStyle<Base.Popup.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "drawer-popup"}
    />
  );
}
export function DrawerContent({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Content.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Content>, "ref">) {
  const compiled = stylex.props(xstyle);
  return (
    <Base.Content
      {...props}
      {...compiled}
      style={mergeStyle<Base.Content.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "drawer-content"}
    />
  );
}
export function DrawerTitle({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Title.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Title>, "ref">) {
  const compiled = stylex.props(modalStyles.title, xstyle);
  return (
    <Base.Title
      {...props}
      {...compiled}
      style={mergeStyle<Base.Title.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "drawer-title"}
    />
  );
}
export function DrawerDescription({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Description.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Description>, "ref">) {
  const compiled = stylex.props(modalStyles.description, xstyle);
  return (
    <Base.Description
      {...props}
      {...compiled}
      style={mergeStyle<Base.Description.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "drawer-description"}
    />
  );
}
export function DrawerClose({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Close.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Close>, "ref">) {
  const compiled = stylex.props(modalStyles.close, xstyle);
  return (
    <Base.Close
      {...props}
      {...compiled}
      style={mergeStyle<Base.Close.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "drawer-close"}
    />
  );
}
export function DrawerHeader({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(modalStyles.header, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "drawer-header"}
    />
  );
}
export function DrawerBody({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(modalStyles.body, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "drawer-body"}
    />
  );
}
export function DrawerFooter({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(modalStyles.footer, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "drawer-footer"}
    />
  );
}
export function DrawerHandle({
  children,
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(s.handle, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "drawer-handle"}
    >
      {children ?? <span {...stylex.props(s.handleBar)} data-slot="drawer-handle-bar" />}
    </div>
  );
}
export function DrawerSwipeArea({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.SwipeArea.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.SwipeArea>, "ref">) {
  const compiled = stylex.props(xstyle);
  return (
    <Base.SwipeArea
      {...props}
      {...compiled}
      style={mergeStyle<Base.SwipeArea.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "drawer-swipe-area"}
    />
  );
}
export function DrawerIndent({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Indent.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Indent>, "ref">) {
  const compiled = stylex.props(xstyle);
  return (
    <Base.Indent
      {...props}
      {...compiled}
      style={mergeStyle<Base.Indent.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "drawer-indent"}
    />
  );
}
export function DrawerIndentBackground({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.IndentBackground.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.IndentBackground>, "ref">) {
  const compiled = stylex.props(xstyle);
  return (
    <Base.IndentBackground
      {...props}
      {...compiled}
      style={mergeStyle<Base.IndentBackground.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "drawer-indent-background"}
    />
  );
}
export const Drawer = Object.assign(DrawerRoot, {
  Root: DrawerRoot,
  Provider: DrawerProvider,
  Trigger: DrawerTrigger,
  Portal: DrawerPortal,
  Backdrop: DrawerBackdrop,
  Viewport: DrawerViewport,
  Popup: DrawerPopup,
  Content: DrawerContent,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Close: DrawerClose,
  Header: DrawerHeader,
  Body: DrawerBody,
  Footer: DrawerFooter,
  Handle: DrawerHandle,
  SwipeArea: DrawerSwipeArea,
  Indent: DrawerIndent,
  IndentBackground: DrawerIndentBackground,
  VirtualKeyboardProvider: Base.VirtualKeyboardProvider,
  createHandle: Base.createHandle,
});
