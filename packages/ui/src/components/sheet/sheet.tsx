"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Drawer as Base } from "@base-ui/react/drawer";
import { materialStyles, vibrantStyles } from "@lenso/tokens/materials";
import { sheetStyles as s } from "@lenso/tokens/sheet";
import { DrawerRoot, DrawerTrigger, DrawerPortal, DrawerClose } from "../drawer/drawer.js";
import { GlassButton } from "../glass-button/glass-button.js";
import { CloseIcon } from "../../icons/index.js";
import { MaterialBackground } from "../../utils/materials/render.js";
import { presentationMaterials } from "../../utils/materials/presentation.js";
import { assignRef } from "../../utils/interaction/ref.js";
import { trackSheetPresentation } from "./track-presentation.js";
import { mergeStyle, type StyleXProps, type XStyle } from "../../utils/styled.js";

const defaultSnapPoints: Base.Root.SnapPoint[] = [0.525, 1];
const DimContext = React.createContext(true);
const SheetDepthContext = React.createContext(0);
type SheetPresentation = {
  snapPoints: readonly Base.Root.SnapPoint[];
  attached: readonly Base.Root.SnapPoint[];
};
const PresentationContext = React.createContext<SheetPresentation | null>(null);
const samePoints = (left: readonly Base.Root.SnapPoint[], right: readonly Base.Root.SnapPoint[]) =>
  left.length === right.length && left.every((point, index) => Object.is(point, right[index]));

export type SheetRootProps<Payload = unknown> = Omit<Base.Root.Props<Payload>, "swipeDirection"> & {
  dim?: boolean;
  /** Snap points that meet the bottom edge. Omit to retain the default floating partial sheet. */
  edgeAttachedSnapPoints?: readonly Base.Root.SnapPoint[];
};

export function SheetRoot<Payload = unknown>({
  dim = true,
  snapPoints = defaultSnapPoints,
  edgeAttachedSnapPoints,
  ...props
}: SheetRootProps<Payload>) {
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
          <DrawerRoot {...props} snapPoints={snapPoints} swipeDirection="down" />
        </PresentationContext.Provider>
      </DimContext.Provider>
    </SheetDepthContext.Provider>
  );
}

export function SheetTrigger(props: React.ComponentPropsWithRef<typeof DrawerTrigger>) {
  return (
    <DrawerTrigger
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "sheet-trigger"}
    />
  );
}
export function SheetPortal(props: React.ComponentPropsWithRef<typeof DrawerPortal>) {
  return <DrawerPortal {...props} />;
}
export function SheetBackdrop({
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "sheet-backdrop"}
    />
  );
}
export function SheetViewport({
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "sheet-viewport"}
    />
  );
}
export function SheetPopup({
  ref,
  children,
  surfaceXstyle,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Popup.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Popup>, "ref"> & { surfaceXstyle?: XStyle }) {
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
    const surface = popup.querySelector<HTMLElement>('[data-slot="sheet-surface"]');
    const viewport = popup.parentElement;
    if (!surface || !viewport) return;
    return trackSheetPresentation(popup, surface, viewport, presentation);
  }, [popup, presentation]);
  const compiled = stylex.props(s.popup, presentation && s.adaptivePopup, xstyle);
  return (
    <Base.Popup
      {...props}
      ref={popupRef}
      data-sheet-adaptive={presentation ? "" : undefined}
      {...compiled}
      style={mergeStyle<Base.Popup.State>(compiled.style, style)}
      data-sheet-nested={nested ? "" : undefined}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "sheet-popup"}
    >
      <SheetSurface xstyle={surfaceXstyle}>{children}</SheetSurface>
    </Base.Popup>
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
      data-slot="sheet-surface"
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
      <div data-slot="sheet-solid" {...stylex.props(s.solid)} />
      {children}
    </div>
  );
}

export function SheetHandle({
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "sheet-handle"}
      aria-hidden="true"
    >
      <span
        {...stylex.props(vibrantStyles.fill, vibrantStyles.primaryFill, s.handleBar)}
        data-slot="sheet-handle-bar"
      />
    </div>
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "sheet-header"}
    />
  );
}
export function SheetTitle({
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "sheet-title"}
    />
  );
}
export function SheetDescription({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Description.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Description>, "ref">) {
  const compiled = stylex.props(xstyle);
  return (
    <Base.Description
      {...props}
      {...compiled}
      style={mergeStyle<Base.Description.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "sheet-description"}
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "sheet-body"}
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "sheet-footer"}
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "sheet-close"}
    >
      {children}
    </DrawerClose>
  );
}

export const Sheet = Object.assign(SheetRoot, {
  Root: SheetRoot,
  Provider: Base.Provider,
  Trigger: SheetTrigger,
  Portal: SheetPortal,
  Backdrop: SheetBackdrop,
  Viewport: SheetViewport,
  Popup: SheetPopup,
  Handle: SheetHandle,
  Header: SheetHeader,
  Title: SheetTitle,
  Description: SheetDescription,
  Body: SheetBody,
  Footer: SheetFooter,
  Close: SheetClose,
  createHandle: Base.createHandle,
});
