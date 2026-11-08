"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Dialog as Base } from "@base-ui/react/dialog";
import { actionSheetStyles as s } from "@lenso/tokens/action-sheet";
import { modalStyles } from "@lenso/tokens/modal";
import { materialStyles } from "@lenso/tokens/materials";
import { MaterialBackground } from "../../utils/materials/render.js";
import { presentationMaterials } from "../../utils/materials/presentation.js";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";

const DimContext = React.createContext(true);
export function ActionSheetRoot<Payload = unknown>({
  dim = true,
  ...props
}: Base.Root.Props<Payload> & { dim?: boolean }) {
  return (
    <DimContext.Provider value={dim}>
      <Base.Root {...props} />
    </DimContext.Provider>
  );
}
export function ActionSheetPortal({
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
export function ActionSheetTrigger({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Trigger.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Trigger>, "ref">) {
  const ownPresentation =
    props.render == null ||
    (React.isValidElement(props.render) && typeof props.render.type === "string");
  const compiled = stylex.props(ownPresentation && modalStyles.trigger, xstyle);
  return (
    <Base.Trigger
      {...props}
      {...compiled}
      style={mergeStyle<Base.Trigger.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "action-sheet-trigger"}
    />
  );
}
export function ActionSheetBackdrop({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Backdrop.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Backdrop>, "ref">) {
  const dim = React.useContext(DimContext);
  const compiled = stylex.props(s.backdrop, !dim && s.undimmed, xstyle);
  return (
    <Base.Backdrop
      {...props}
      {...compiled}
      style={mergeStyle<Base.Backdrop.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "action-sheet-backdrop"}
    />
  );
}
export function ActionSheetViewport({
  placement = "center",
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Viewport.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Viewport>, "ref"> & {
    placement?: "auto" | "center" | "bottom";
  }) {
  const compiled = stylex.props(s.viewport, xstyle);
  return (
    <Base.Viewport
      {...props}
      {...compiled}
      style={mergeStyle<Base.Viewport.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "action-sheet-viewport"}
      data-placement={placement}
    />
  );
}
export function ActionSheetPopup({
  children,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Popup.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Popup>, "ref">) {
  const compiled = stylex.props(materialStyles.root, s.popup, materialStyles.accessible, xstyle);
  return (
    <Base.Popup
      {...props}
      {...compiled}
      style={mergeStyle<Base.Popup.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "action-sheet-popup"}
      data-material={presentationMaterials.compact}
    >
      <MaterialBackground variant={presentationMaterials.compact} liveGeometry />
      {children}
    </Base.Popup>
  );
}
export function ActionSheetTitle({
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "action-sheet-title"}
    />
  );
}
export function ActionSheetDescription({
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "action-sheet-description"}
    />
  );
}
export function ActionSheetClose({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Close.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Close>, "ref">) {
  const compiled = stylex.props(s.action, xstyle);
  return (
    <Base.Close
      {...props}
      {...compiled}
      style={mergeStyle<Base.Close.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "action-sheet-close"}
    />
  );
}
export function ActionSheetHeader({
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "action-sheet-header"}
    />
  );
}
export function ActionSheetActions({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(s.actions, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "action-sheet-actions"}
    />
  );
}
/** An operation that dismisses the sheet after its native click handler. */
export function ActionSheetAction({
  destructive = false,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Close.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Close>, "ref"> & { destructive?: boolean }) {
  const compiled = stylex.props(s.action, destructive && s.destructive, xstyle);
  return (
    <Base.Close
      {...props}
      {...compiled}
      style={mergeStyle<Base.Close.State>(compiled.style, style)}
      data-destructive={destructive || undefined}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "action-sheet-action"}
    />
  );
}
export const ActionSheet = Object.assign(ActionSheetRoot, {
  Root: ActionSheetRoot,
  Trigger: ActionSheetTrigger,
  Portal: ActionSheetPortal,
  Backdrop: ActionSheetBackdrop,
  Viewport: ActionSheetViewport,
  Popup: ActionSheetPopup,
  Header: ActionSheetHeader,
  Title: ActionSheetTitle,
  Description: ActionSheetDescription,
  Actions: ActionSheetActions,
  Action: ActionSheetAction,
  Close: ActionSheetClose,
});
