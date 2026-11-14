"use client";
import * as SdkAlertDialog from "@ui-sdk/react/alert-dialog";
import { slotRender } from "../../utils/sdk-render.js";
// native alertdialog semantics.
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { alertDialogStyles as s, alertDialogIconStyles as tones } from "@lenso/tokens/alert-dialog";
import { useGlassRef } from "@lenso/glass/react";
import { liquidMaterialStyles, materialStyles } from "@lenso/tokens/materials";
import { presentationMaterials } from "../../utils/materials/presentation.js";
import { closeButtonStyles } from "@lenso/tokens/close-button";
import { DangerIcon, InfoIcon, SuccessIcon, WarningIcon } from "../../icons/index.js";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

export function AlertDialogRoot(props: React.ComponentProps<typeof SdkAlertDialog.AlertDialog>) {
  return <SdkAlertDialog.AlertDialog {...props} />;
}
export function AlertDialogTrigger({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkAlertDialog.AlertDialogTrigger>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkAlertDialog.AlertDialogTrigger>, "ref">) {
  const ownPresentation =
    props.render == null ||
    (React.isValidElement(props.render) && typeof props.render.type === "string");
  const compiled = stylex.props(ownPresentation && s.trigger, xstyle);
  return (
    <SdkAlertDialog.AlertDialogTrigger
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "button",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "alert-dialog-trigger",
        props.render,
      )}
    />
  );
}
export function AlertDialogBackdrop({
  variant = "opaque",
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkAlertDialog.AlertDialogBackdrop>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkAlertDialog.AlertDialogBackdrop>, "ref"> & {
    variant?: "transparent" | "opaque" | "blur";
  }) {
  const compiled = stylex.props(s.backdrop, s[variant], xstyle);
  return (
    <SdkAlertDialog.AlertDialogBackdrop
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "div",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "alert-dialog-backdrop",
        props.render,
      )}
    />
  );
}
export function AlertDialogContent({
  size = "md",
  placement = "center",
  children,
  ref,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkAlertDialog.AlertDialogContent>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkAlertDialog.AlertDialogContent>, "ref"> & {
    size?: "xs" | "sm" | "md" | "lg" | "cover";
    placement?: "auto" | "top" | "center" | "bottom";
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
    s[size],
    s.nativeContent,
    xstyle,
  );
  return (
    <SdkAlertDialog.AlertDialogContent
      {...props}
      ref={glassRef}
      data-placement={placement}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "div",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "alert-dialog-popup",
        props.render,
      )}
      data-material={presentationMaterials.compact}
    >
      {(state) => (
        <div {...stylex.props(s.scroller)} data-lenso-slot="alert-dialog-scroller">
          {typeof children === "function" ? children(state) : children}
        </div>
      )}
    </SdkAlertDialog.AlertDialogContent>
  );
}
export function AlertDialogTitle({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkAlertDialog.AlertDialogTitle>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkAlertDialog.AlertDialogTitle>, "ref">) {
  const compiled = stylex.props(s.title, xstyle);
  return (
    <SdkAlertDialog.AlertDialogTitle
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "h2",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "alert-dialog-title",
        props.render,
      )}
    />
  );
}
export function AlertDialogDescription({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkAlertDialog.AlertDialogDescription>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkAlertDialog.AlertDialogDescription>, "ref">) {
  const compiled = stylex.props(s.description, xstyle);
  return (
    <SdkAlertDialog.AlertDialogDescription
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "p",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "alert-dialog-description",
        props.render,
      )}
    />
  );
}
export function AlertDialogClose({
  children,
  render,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkAlertDialog.AlertDialogClose>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkAlertDialog.AlertDialogClose>, "ref">) {
  const bare = children === undefined && render === undefined;
  const compiled = stylex.props(
    bare && closeButtonStyles.root,
    bare && s.close,
    !bare && render == null && s.action,
    xstyle,
  );
  return (
    <SdkAlertDialog.AlertDialogClose
      aria-label={bare ? "Close" : undefined}
      {...props}

      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "button",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "alert-dialog-close",
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
    </SdkAlertDialog.AlertDialogClose>
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
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "alert-dialog-header"
      }
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
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "alert-dialog-body"
      }
    />
  );
}
export function AlertDialogFooter({
  layout = "auto",
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & {
  layout?: "auto" | "side-by-side" | "stacked";
}) {
  const compiled = stylex.props(s.footer, xstyle);
  return (
    <div
      {...props}
      data-layout={layout}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "alert-dialog-footer"
      }
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
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "alert-dialog-icon"
      }
    >
      {children ?? (
        <DefaultIcon data-lenso-slot="alert-dialog-default-icon" width={20} height={20} />
      )}
    </div>
  );
}
export function AlertDialogAction({
  variant = "default",
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkAlertDialog.AlertDialogClose>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkAlertDialog.AlertDialogClose>, "ref"> & {
    variant?: "default" | "cancel" | "destructive";
  }) {
  const compiled = stylex.props(
    s.action,
    variant === "default" && s.defaultAction,
    variant === "destructive" && s.destructive,
    xstyle,
  );
  return (
    <SdkAlertDialog.AlertDialogClose
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("button", "alert-dialog-action", props.render)}
      data-variant={variant}
    />
  );
}
export function AlertDialogFields({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(s.fields, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="alert-dialog-fields"
    />
  );
}

export const AlertDialog = Object.assign(AlertDialogRoot, {
  Root: AlertDialogRoot,
  Trigger: AlertDialogTrigger,
  Backdrop: AlertDialogBackdrop,
  Content: AlertDialogContent,
  Title: AlertDialogTitle,
  Description: AlertDialogDescription,
  Close: AlertDialogClose,
  Header: AlertDialogHeader,
  Body: AlertDialogBody,
  Footer: AlertDialogFooter,
  Action: AlertDialogAction,
  Fields: AlertDialogFields,
  Icon: AlertDialogIcon,
});
