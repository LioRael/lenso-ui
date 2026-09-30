"use client";
// HeroUI v3.2.6 anatomy, Apache-2.0.
import * as React from "react";
import { Popover as Base } from "@base-ui/react/popover";
import { popoverStyles as s } from "@lenso/tokens/popover";
import { styledPart } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";

export function PopoverRoot<Payload = unknown>(props: Base.Root.Props<Payload>) {
  return <Base.Root {...props} />;
}
export const PopoverTrigger = styledPart(Base.Trigger, "popover-trigger", s.trigger);
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
export const PopoverPositioner = styledPart(Base.Positioner, "popover-positioner", s.positioner);
export const PopoverPopup = styledPart(Base.Popup, "popover-popup", s.popup);
export const PopoverTitle = styledPart(Base.Title, "popover-title", s.title);
export const PopoverDescription = styledPart(
  Base.Description,
  "popover-description",
  s.description,
);
export const PopoverClose = styledPart(Base.Close, "popover-close");
export const PopoverBackdrop = styledPart(Base.Backdrop, "popover-backdrop");
const Arrow = styledPart(Base.Arrow, "popover-arrow", s.arrow);
export function PopoverArrow({ children, ...props }: React.ComponentProps<typeof Arrow>) {
  return (
    <Arrow {...props}>
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
    </Arrow>
  );
}
export const PopoverViewport = styledPart(Base.Viewport, "popover-viewport");
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
