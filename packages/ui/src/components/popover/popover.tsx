"use client";
import * as SdkPopover from "@ui-sdk/react/popover";
import { slotRender } from "../../utils/sdk-render.js";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { materialStyles } from "@lenso/tokens/materials";
import { AnchoredMaterial } from "../../utils/materials/anchored.js";
import { presentationMaterials } from "../../utils/materials/presentation.js";
import { popoverStyles as s } from "@lenso/tokens/popover";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

export function PopoverRoot(props: React.ComponentProps<typeof SdkPopover.Popover>) {
  return <SdkPopover.Popover {...props} />;
}
export function PopoverTrigger({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkPopover.PopoverTrigger>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkPopover.PopoverTrigger>, "ref">) {
  const ownPresentation =
    props.render == null ||
    (React.isValidElement(props.render) && typeof props.render.type === "string");
  const compiled = stylex.props(ownPresentation && s.trigger, xstyle);
  return (
    <SdkPopover.PopoverTrigger
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "button",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "popover-trigger",
        props.render,
      )}
    />
  );
}
export function PopoverContent({
  children,
  sideOffset = 16,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkPopover.PopoverContent>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkPopover.PopoverContent>, "ref">) {
  const compiled = stylex.props(
    materialStyles.root,
    materialStyles.accessible,
    materialStyles[presentationMaterials.anchored],
    s.positioner,
    s.popup,
    xstyle,
  );
  return (
    <SdkPopover.PopoverContent
      sideOffset={sideOffset}
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "div",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "popover-popup",
        props.render,
      )}
      data-material={presentationMaterials.anchored}
    >
      {(state) => (
        <>
          <AnchoredMaterial kind="popover" />
          {typeof children === "function" ? children(state) : children}
        </>
      )}
    </SdkPopover.PopoverContent>
  );
}
export function PopoverTitle({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkPopover.PopoverTitle>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkPopover.PopoverTitle>, "ref">) {
  const compiled = stylex.props(s.title, xstyle);
  return (
    <SdkPopover.PopoverTitle
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "h2",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "popover-title",
        props.render,
      )}
    />
  );
}
export function PopoverDescription({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkPopover.PopoverDescription>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkPopover.PopoverDescription>, "ref">) {
  const compiled = stylex.props(s.description, xstyle);
  return (
    <SdkPopover.PopoverDescription
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "p",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "popover-description",
        props.render,
      )}
    />
  );
}
export function PopoverClose({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkPopover.PopoverClose>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkPopover.PopoverClose>, "ref">) {
  const compiled = stylex.props(xstyle);
  return (
    <SdkPopover.PopoverClose
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "button",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "popover-close",
        props.render,
      )}
    />
  );
}
export function PopoverArrow({
  children,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkPopover.PopoverArrow>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkPopover.PopoverArrow>, "ref">) {
  const compiled = stylex.props(s.arrow, xstyle);
  return (
    <SdkPopover.PopoverArrow
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "div",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "popover-arrow",
        props.render,
      )}
    >
      {children ?? (
        <span
          aria-hidden="true"
          data-lenso-slot="popover-arrow-material"
          {...stylex.props(s.arrowMaterial)}
        />
      )}
    </SdkPopover.PopoverArrow>
  );
}
export const Popover = Object.assign(PopoverRoot, {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: PopoverClose,
  Arrow: PopoverArrow,
});
