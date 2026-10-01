"use client";
// HeroUI v3.2.6 anatomy, Apache-2.0.
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Popover as Base } from "@base-ui/react/popover";
import { popoverStyles as s } from "@lenso/tokens/popover";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";

export function PopoverRoot<Payload = unknown>(props: Base.Root.Props<Payload>) {
  return <Base.Root {...props} />;
}
export function PopoverTrigger({
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "popover-trigger"}
    />
  );
}
export function PopoverPortal({
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
export function PopoverPositioner({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Positioner.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Positioner>, "ref">) {
  const compiled = stylex.props(s.positioner, xstyle);
  return (
    <Base.Positioner
      {...props}
      {...compiled}
      style={mergeStyle<Base.Positioner.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "popover-positioner"}
    />
  );
}
export function PopoverPopup({
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "popover-popup"}
    />
  );
}
export function PopoverTitle({
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "popover-title"}
    />
  );
}
export function PopoverDescription({
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "popover-description"}
    />
  );
}
export function PopoverClose({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Close.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Close>, "ref">) {
  const compiled = stylex.props(xstyle);
  return (
    <Base.Close
      {...props}
      {...compiled}
      style={mergeStyle<Base.Close.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "popover-close"}
    />
  );
}
export function PopoverBackdrop({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Backdrop.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Backdrop>, "ref">) {
  const compiled = stylex.props(xstyle);
  return (
    <Base.Backdrop
      {...props}
      {...compiled}
      style={mergeStyle<Base.Backdrop.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "popover-backdrop"}
    />
  );
}
export function PopoverArrow({
  children,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Arrow.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Arrow>, "ref">) {
  const compiled = stylex.props(s.arrow, xstyle);
  return (
    <Base.Arrow
      {...props}
      {...compiled}
      style={mergeStyle<Base.Arrow.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "popover-arrow"}
    >
      {children ?? (
        <svg
          data-slot="popover-overlay-arrow"
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 0C5.48483 8 6.5 8 12 0Z" />
        </svg>
      )}
    </Base.Arrow>
  );
}
export function PopoverViewport({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Viewport.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Viewport>, "ref">) {
  const compiled = stylex.props(xstyle);
  return (
    <Base.Viewport
      {...props}
      {...compiled}
      style={mergeStyle<Base.Viewport.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "popover-viewport"}
    />
  );
}
export const Popover = Object.assign(PopoverRoot, {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Portal: PopoverPortal,
  Positioner: PopoverPositioner,
  Popup: PopoverPopup,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: PopoverClose,
  Backdrop: PopoverBackdrop,
  Arrow: PopoverArrow,
  Viewport: PopoverViewport,
});
