"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import * as SdkDrawer from "@ui-sdk/react/drawer";
import { slotRender } from "../../utils/sdk-render.js";
import { materialStyles, vibrantStyles } from "@lenso/tokens/materials";
import { sheetStyles as s } from "@lenso/tokens/sheet";
import { DrawerRoot, DrawerTrigger, DrawerClose } from "../drawer/drawer.js";
import { GlassButton } from "../glass-button/glass-button.js";
import { CloseIcon } from "../../icons/index.js";
import { MaterialBackground } from "../../utils/materials/render.js";
import { presentationMaterials } from "../../utils/materials/presentation.js";
import { assignRef } from "../../utils/interaction/ref.js";
import { trackSheetPresentation } from "./track-presentation.js";
import { mergeStyle, type StyleXProps, type XStyle } from "../../utils/styled.js";

const defaultSnapPoints: SdkDrawer.SnapPoint[] = [0.525, 1];
const DimContext = React.createContext(true);
const SheetDepthContext = React.createContext(0);
type SheetPresentation = {
  snapPoints: readonly SdkDrawer.SnapPoint[];
  attached: readonly SdkDrawer.SnapPoint[];
};
const PresentationContext = React.createContext<SheetPresentation | null>(null);
const samePoints = (left: readonly SdkDrawer.SnapPoint[], right: readonly SdkDrawer.SnapPoint[]) =>
  left.length === right.length && left.every((point, index) => Object.is(point, right[index]));

export type SheetRootProps = Omit<React.ComponentProps<typeof SdkDrawer.Drawer>, "side"> & {
  dim?: boolean;
  /** Snap points that meet the bottom edge. Omit to retain the default floating partial sheet. */
  edgeAttachedSnapPoints?: readonly SdkDrawer.SnapPoint[];
};

export function SheetRoot({
  dim = true,
  expandOnScroll = false,
  snapPoints = defaultSnapPoints,
  edgeAttachedSnapPoints,
  ...props
}: SheetRootProps) {
  const depth = React.useContext(SheetDepthContext);
  const nextPresentation = edgeAttachedSnapPoints
    ? { snapPoints, attached: edgeAttachedSnapPoints }
    : null;
  const [presentation, setPresentation] = React.useState<SheetPresentation | null>(
    nextPresentation,
  );
  // Inline arrays are common in controlled sheets. Keep their animation clock
  // attached when only the selected detent changes, rather than restarting it.
  if (
    presentation && nextPresentation
      ? !samePoints(presentation.snapPoints, nextPresentation.snapPoints) ||
        !samePoints(presentation.attached, nextPresentation.attached)
      : presentation !== nextPresentation
  )
    setPresentation(nextPresentation);
  return (
    <SheetDepthContext.Provider value={depth + 1}>
      <DimContext.Provider value={dim}>
        <PresentationContext.Provider value={presentation}>
          <DrawerRoot
            {...props}
            expandOnScroll={expandOnScroll}
            snapPoints={snapPoints}
            side="bottom"
          />
        </PresentationContext.Provider>
      </DimContext.Provider>
    </SheetDepthContext.Provider>
  );
}

export function SheetTrigger(props: React.ComponentPropsWithRef<typeof DrawerTrigger>) {
  return (
    <DrawerTrigger
      {...props}
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "sheet-trigger"
      }
    />
  );
}
export function SheetBackdrop({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkDrawer.DrawerBackdrop>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkDrawer.DrawerBackdrop>, "ref">) {
  const dim = React.useContext(DimContext);
  const compiled = stylex.props(s.backdrop, !dim && s.undimmed, xstyle);
  return (
    <SdkDrawer.DrawerBackdrop
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "div",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "sheet-backdrop",
        props.render,
      )}
    />
  );
}
export function SheetContent({
  ref,
  children,
  surfaceXstyle,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkDrawer.DrawerContent>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkDrawer.DrawerContent>, "ref"> & {
    surfaceXstyle?: XStyle;
  }) {
  const nested = React.useContext(SheetDepthContext) > 1;
  const presentation = React.useContext(PresentationContext);
  const [popup, setPopup] = React.useState<HTMLElement | null>(null);
  const popupRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      setPopup(node);
      return assignRef(ref, node);
    },
    [ref],
  );
  React.useLayoutEffect(() => {
    if (!popup || !presentation) return;
    const surface = popup.querySelector<HTMLElement>('[data-lenso-slot="sheet-surface"]');
    const viewport = popup.parentElement;
    if (!surface || !viewport) return;
    return trackSheetPresentation(popup, surface, viewport, presentation);
  }, [popup, presentation]);
  const compiled = stylex.props(s.popup, s.nativeContent, presentation && s.adaptivePopup, xstyle);
  return (
    <SdkDrawer.DrawerContent
      {...props}
      ref={popupRef}
      data-sheet-adaptive={presentation ? "" : undefined}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-sheet-nested={nested ? "" : undefined}
      render={slotRender(
        "div",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "sheet-popup",
        props.render,
      )}
    >
      {(state) => (
        <SheetSurface xstyle={surfaceXstyle}>
          {typeof children === "function" ? children(state) : children}
        </SheetSurface>
      )}
    </SdkDrawer.DrawerContent>
  );
}

function SheetSurface({
  children,
  xstyle,
}: {
  children: React.ReactNode;
  xstyle?: XStyle | undefined;
}) {
  const compiled = stylex.props(materialStyles.root, materialStyles.accessible, s.surface, xstyle);
  const presentation = React.useContext(PresentationContext);
  const surfaceRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const syncFilter = () => {
      const lens = surface.querySelector<HTMLElement>(":scope > [data-material-lens]");
      const filter = lens?.style.getPropertyValue("--lg-filter") || "saturate(1)";
      if (surface.style.getPropertyValue("--sheet-glass-filter") !== filter)
        surface.style.setProperty("--sheet-glass-filter", filter);
    };
    // Clipped surfaces must filter their own backdrop. A negative-z child
    // samples an empty backdrop in Chromium's composited drawer.
    const observer = new MutationObserver((records) => {
      if (
        records.some(
          (record) =>
            record.type === "childList" ||
            (record.target instanceof HTMLElement &&
              record.target.parentElement === surface &&
              record.target.hasAttribute("data-material-lens")),
        )
      )
        syncFilter();
    });
    observer.observe(surface, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style"],
    });
    syncFilter();
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={surfaceRef}
      data-lenso-slot="sheet-surface"
      {...compiled}
      style={
        {
          ...compiled.style,
          ...(presentation && {
            "--sheet-visible-height":
              "calc(100% - var(--sheet-shared-position, var(--sheet-presentation-offset, var(--sheet-snap-offset, 0px))) - var(--sheet-nesting-offset, 0px) - var(--sheet-edge-inset, 0px))",
            "--sheet-adaptive-background": "transparent",
            "--sheet-adaptive-shadow":
              "0 15px 75px rgb(0 0 0 / calc(.18 * var(--sheet-solid-opacity, 0)))",
            "--sheet-adaptive-filter":
              "blur(var(--lenso-glass-medium-blur, 8px)) var(--sheet-glass-filter, saturate(1))",
            "--sheet-glass-display": "block",
            "--sheet-solid-display": "block",
          }),
          // Keep light-dark intact through the Vite StyleX pipeline.
          "--sheet-base-solid-background":
            "light-dark(var(--lenso-background-primary), var(--lenso-background-secondary))",
        } as React.CSSProperties
      }
    >
      <MaterialBackground
        variant={presentationMaterials.sheet}
        liveGeometry
        layerXstyle={s.glass}
      />
      <div data-lenso-slot="sheet-solid" {...stylex.props(s.solid)} />
      {children}
    </div>
  );
}

export function SheetHandle({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentProps<typeof SdkDrawer.DrawerHandle>>) {
  const compiled = stylex.props(s.handle, xstyle);
  return (
    <SdkDrawer.DrawerHandle
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      render={slotRender(
        "button",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "sheet-handle",
        props.render,
      )}
      aria-label="Resize sheet"
    >
      <span
        {...stylex.props(vibrantStyles.fill, vibrantStyles.primaryFill, s.handleBar)}
        data-lenso-slot="sheet-handle-bar"
      />
    </SdkDrawer.DrawerHandle>
  );
}
export function SheetHeader({
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
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "sheet-header"
      }
    />
  );
}
export function SheetTitle({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkDrawer.DrawerTitle>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkDrawer.DrawerTitle>, "ref">) {
  const compiled = stylex.props(s.title, xstyle);
  return (
    <SdkDrawer.DrawerTitle
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "h2",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "sheet-title",
        props.render,
      )}
    />
  );
}
export function SheetDescription({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkDrawer.DrawerDescription>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkDrawer.DrawerDescription>, "ref">) {
  const compiled = stylex.props(xstyle);
  return (
    <SdkDrawer.DrawerDescription
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "div",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "sheet-description",
        props.render,
      )}
    />
  );
}
export function SheetBody({
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
      data-lenso-slot={(props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "sheet-body"}
    />
  );
}
export function SheetFooter({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(s.footer, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "sheet-footer"
      }
    />
  );
}
export function SheetClose({
  children,
  render,
  xstyle,
  ...props
}: React.ComponentPropsWithRef<typeof DrawerClose>) {
  const bare = children === undefined && render === undefined;
  return (
    <DrawerClose
      {...props}
      aria-label={bare ? (props["aria-label"] ?? "Close") : props["aria-label"]}
      render={
        bare ? <GlassButton isIconOnly icon={<CloseIcon />} xstyle={[s.close, xstyle]} /> : render
      }
      xstyle={bare ? undefined : xstyle}
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "sheet-close"
      }
    >
      {children}
    </DrawerClose>
  );
}

export const Sheet = Object.assign(SheetRoot, {
  Root: SheetRoot,
  Trigger: SheetTrigger,
  Backdrop: SheetBackdrop,
  Content: SheetContent,
  Handle: SheetHandle,
  Header: SheetHeader,
  Title: SheetTitle,
  Description: SheetDescription,
  Body: SheetBody,
  Footer: SheetFooter,
  Close: SheetClose,
});
