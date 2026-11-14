"use client";
import * as SdkDialog from "@ui-sdk/react/dialog";
import { slotRender } from "../../utils/sdk-render.js";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { actionSheetStyles as s } from "@lenso/tokens/action-sheet";
import { modalStyles } from "@lenso/tokens/modal";
import { useGlassRef } from "@lenso/glass/react";
import { liquidMaterialStyles, materialStyles } from "@lenso/tokens/materials";
import { presentationMaterials } from "../../utils/materials/presentation.js";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

const DimContext = React.createContext(true);
export function ActionSheetRoot({
  dim = true,
  ...props
}: React.ComponentProps<typeof SdkDialog.Dialog> & { dim?: boolean }) {
  return (
    <DimContext.Provider value={dim}>
      <SdkDialog.Dialog {...props} />
    </DimContext.Provider>
  );
}
export function ActionSheetTrigger({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkDialog.DialogTrigger>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkDialog.DialogTrigger>, "ref">) {
  const ownPresentation =
    props.render == null ||
    (React.isValidElement(props.render) && typeof props.render.type === "string");
  const compiled = stylex.props(ownPresentation && modalStyles.trigger, xstyle);
  return (
    <SdkDialog.DialogTrigger
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "button",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "action-sheet-trigger",
        props.render,
      )}
    />
  );
}
export function ActionSheetBackdrop({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkDialog.DialogBackdrop>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkDialog.DialogBackdrop>, "ref">) {
  const dim = React.useContext(DimContext);
  const compiled = stylex.props(s.backdrop, !dim && s.undimmed, xstyle);
  return (
    <SdkDialog.DialogBackdrop
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "div",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "action-sheet-backdrop",
        props.render,
      )}
    />
  );
}
export function ActionSheetContent({
  children,
  ref,
  placement = "auto",
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkDialog.DialogContent>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkDialog.DialogContent>, "ref"> & {
    placement?: "auto" | "bottom" | "center";
  }) {
  const glassRef = useGlassRef(
    ref,
    true,
    false,
    presentationMaterials.compact,
    undefined,
    false,
    true,
  );
  const compiled = stylex.props(
    materialStyles.root,
    liquidMaterialStyles.small,
    liquidMaterialStyles.medium,
    liquidMaterialStyles.compact,
    materialStyles.accessible,
    s.popup,
    s.nativeContent,
    s.placement(placement),
    xstyle,
  );
  return (
    <SdkDialog.DialogContent
      {...props}
      ref={glassRef}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "div",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "action-sheet-popup",
        props.render,
      )}
      data-placement={placement}
      data-material={presentationMaterials.compact}
    >
      {(state) => (
        <div {...stylex.props(s.scroller)} data-lenso-slot="action-sheet-scroller">
          {typeof children === "function" ? children(state) : children}
        </div>
      )}
    </SdkDialog.DialogContent>
  );
}
export function ActionSheetTitle({
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
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "action-sheet-title",
        props.render,
      )}
    />
  );
}
export function ActionSheetDescription({
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
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "action-sheet-description",
        props.render,
      )}
    />
  );
}
export function ActionSheetClose({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkDialog.DialogClose>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkDialog.DialogClose>, "ref">) {
  const compiled = stylex.props(s.action, xstyle);
  return (
    <SdkDialog.DialogClose
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "button",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "action-sheet-close",
        props.render,
      )}
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
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "action-sheet-header"
      }
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
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "action-sheet-actions"
      }
    />
  );
}
/** An operation that dismisses the sheet after its native click handler. */
export function ActionSheetAction({
  destructive = false,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkDialog.DialogClose>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkDialog.DialogClose>, "ref"> & {
    destructive?: boolean;
  }) {
  const compiled = stylex.props(s.action, destructive && s.destructive, xstyle);
  return (
    <SdkDialog.DialogClose
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-destructive={destructive || undefined}
      render={slotRender(
        "button",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "action-sheet-action",
        props.render,
      )}
    />
  );
}
export const ActionSheet = Object.assign(ActionSheetRoot, {
  Root: ActionSheetRoot,
  Trigger: ActionSheetTrigger,
  Backdrop: ActionSheetBackdrop,
  Content: ActionSheetContent,
  Header: ActionSheetHeader,
  Title: ActionSheetTitle,
  Description: ActionSheetDescription,
  Actions: ActionSheetActions,
  Action: ActionSheetAction,
  Close: ActionSheetClose,
});
