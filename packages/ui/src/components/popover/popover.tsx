"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Popover as Base } from "@base-ui/react/popover";
import { materialStyles } from "@lenso/tokens/materials";
import { AnchoredMaterial } from "../../utils/materials/anchored.js";
import { presentationMaterials } from "../../utils/materials/presentation.js";
import { useDirection } from "@base-ui/react/direction-provider";
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
  const ownPresentation =
    props.render == null ||
    (React.isValidElement(props.render) && typeof props.render.type === "string");
  const compiled = stylex.props(ownPresentation && s.trigger, xstyle);
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
  sideOffset = 16,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Positioner.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Positioner>, "ref">) {
  const compiled = stylex.props(s.positioner, xstyle);
  return (
    <Base.Positioner
      sideOffset={sideOffset}
      {...props}
      {...compiled}
      style={mergeStyle<Base.Positioner.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "popover-positioner"}
    />
  );
}
export function PopoverPopup({
  children,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Popup.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Popup>, "ref">) {
  const direction = useDirection();
  const compiled = stylex.props(
    materialStyles.root,
    materialStyles[presentationMaterials.anchored],
    s.popup,
    materialStyles.accessible,
    xstyle,
  );
  return (
    <Base.Popup
      {...props}
      {...compiled}
      style={mergeStyle<Base.Popup.State>(compiled.style, style)}
      data-direction={direction}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "popover-popup"}
      data-material={presentationMaterials.anchored}
    >
      <AnchoredMaterial kind="popover" />
      {children}
    </Base.Popup>
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
  const direction = useDirection();
  const compiled = stylex.props(s.arrow, xstyle);
  return (
    <Base.Arrow
      {...props}
      {...compiled}
      style={mergeStyle<Base.Arrow.State>(compiled.style, style)}
      data-direction={direction}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "popover-arrow"}
    >
      {children ?? (
        <span
          aria-hidden="true"
          data-slot="popover-arrow-material"
          {...stylex.props(s.arrowMaterial)}
        />
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
