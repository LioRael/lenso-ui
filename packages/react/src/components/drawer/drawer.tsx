"use client";
// HeroUI v3.2.6 anatomy, Apache-2.0; native Base UI swipe/snap contracts.
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Drawer as Base } from "@base-ui/react/drawer";
import { drawerStyles as s } from "@lenso/tokens/drawer";
import { modalStyles } from "@lenso/tokens/modal";
import { styledPart } from "../../utils/styled.js";
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
export const DrawerTrigger = styledPart(Base.Trigger, "drawer-trigger", modalStyles.trigger);
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
const Backdrop = styledPart(Base.Backdrop, "drawer-backdrop", s.backdrop);
export function DrawerBackdrop({
  variant = "opaque",
  xstyle,
  ...props
}: React.ComponentProps<typeof Backdrop> & { variant?: "transparent" | "opaque" | "blur" }) {
  return <Backdrop {...props} xstyle={[modalStyles[variant], xstyle]} />;
}
export const DrawerViewport = styledPart(Base.Viewport, "drawer-viewport", s.viewport);
export const DrawerPopup = styledPart(Base.Popup, "drawer-popup", s.popup);
export const DrawerContent = styledPart(Base.Content, "drawer-content");
export const DrawerTitle = styledPart(Base.Title, "drawer-title", modalStyles.title);
export const DrawerDescription = styledPart(
  Base.Description,
  "drawer-description",
  modalStyles.description,
);
export const DrawerClose = styledPart(Base.Close, "drawer-close", modalStyles.close);
export const DrawerHeader = styledPart("div", "drawer-header", modalStyles.header);
export const DrawerBody = styledPart("div", "drawer-body", modalStyles.body);
export const DrawerFooter = styledPart("div", "drawer-footer", modalStyles.footer);
const Handle = styledPart("div", "drawer-handle", s.handle);
export function DrawerHandle({ children, ...props }: React.ComponentProps<typeof Handle>) {
  return (
    <Handle {...props}>
      {children ?? <span {...stylex.props(s.handleBar)} data-slot="drawer-handle-bar" />}
    </Handle>
  );
}
export const DrawerSwipeArea = styledPart(Base.SwipeArea, "drawer-swipe-area");
export const DrawerIndent = styledPart(Base.Indent, "drawer-indent");
export const DrawerIndentBackground = styledPart(Base.IndentBackground, "drawer-indent-background");
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
