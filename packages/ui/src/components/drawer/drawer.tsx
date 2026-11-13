"use client";
import * as SdkDrawer from "@ui-sdk/react/drawer";
import { slotRender } from "../../utils/sdk-render.js";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { drawerStyles as s } from "@lenso/tokens/drawer";
import { modalStyles } from "@lenso/tokens/modal";
import { closeButtonStyles } from "@lenso/tokens/close-button";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
export function DrawerRoot(props: React.ComponentProps<typeof SdkDrawer.Drawer>) {
  return <SdkDrawer.Drawer {...props} />;
}
export function DrawerLayout({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(s.content, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="drawer-layout"
    />
  );
}
export function DrawerTrigger({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkDrawer.DrawerTrigger>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkDrawer.DrawerTrigger>, "ref">) {
  const ownPresentation =
    props.render == null ||
    (React.isValidElement(props.render) && typeof props.render.type === "string");
  const compiled = stylex.props(ownPresentation && modalStyles.trigger, xstyle);
  return (
    <SdkDrawer.DrawerTrigger
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "button",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "drawer-trigger",
        props.render,
      )}
    />
  );
}
export function DrawerBackdrop({
  variant = "opaque",
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkDrawer.DrawerBackdrop>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkDrawer.DrawerBackdrop>, "ref"> & {
    variant?: "transparent" | "opaque" | "blur";
  }) {
  const compiled = stylex.props(s.backdrop, modalStyles[variant], xstyle);
  return (
    <SdkDrawer.DrawerBackdrop
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "div",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "drawer-backdrop",
        props.render,
      )}
    />
  );
}
export function DrawerContent({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkDrawer.DrawerContent>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkDrawer.DrawerContent>, "ref">) {
  const compiled = stylex.props(s.popup, s.nativeContent, xstyle);
  return (
    <SdkDrawer.DrawerContent
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "div",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "drawer-popup",
        props.render,
      )}
    />
  );
}
export function DrawerTitle({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkDrawer.DrawerTitle>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkDrawer.DrawerTitle>, "ref">) {
  const compiled = stylex.props(modalStyles.title, xstyle);
  return (
    <SdkDrawer.DrawerTitle
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "h2",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "drawer-title",
        props.render,
      )}
    />
  );
}
export function DrawerDescription({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkDrawer.DrawerDescription>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkDrawer.DrawerDescription>, "ref">) {
  const compiled = stylex.props(modalStyles.description, xstyle);
  return (
    <SdkDrawer.DrawerDescription
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "p",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "drawer-description",
        props.render,
      )}
    />
  );
}
export function DrawerClose({
  children,
  render,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkDrawer.DrawerClose>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkDrawer.DrawerClose>, "ref">) {
  const bare = children === undefined && render === undefined;
  const compiled = stylex.props(bare && closeButtonStyles.root, bare && modalStyles.close, xstyle);
  return (
    <SdkDrawer.DrawerClose
      aria-label={bare ? "Close" : undefined}
      {...props}

      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "button",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "drawer-close",
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
    </SdkDrawer.DrawerClose>
  );
}
export function DrawerHeader({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(modalStyles.header, s.fixedSection, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "drawer-header"
      }
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
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "drawer-body"
      }
    />
  );
}
export function DrawerFooter({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(modalStyles.footer, s.fixedSection, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "drawer-footer"
      }
    />
  );
}
export function DrawerHandle({
  children,
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentProps<typeof SdkDrawer.DrawerHandle>>) {
  const compiled = stylex.props(s.handle, s.fixedSection, xstyle);
  return (
    <SdkDrawer.DrawerHandle
      aria-label="Resize drawer"
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("button", "drawer-handle", props.render)}
    >
      {children ?? <span {...stylex.props(s.handleBar)} data-lenso-slot="drawer-handle-bar" />}
    </SdkDrawer.DrawerHandle>
  );
}
export const Drawer = Object.assign(DrawerRoot, {
  Root: DrawerRoot,
  Trigger: DrawerTrigger,
  Backdrop: DrawerBackdrop,
  Content: DrawerContent,
  Layout: DrawerLayout,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Close: DrawerClose,
  Header: DrawerHeader,
  Body: DrawerBody,
  Footer: DrawerFooter,
  Handle: DrawerHandle,
});
