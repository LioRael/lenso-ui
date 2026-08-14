"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { mergeClassName } from "../shared/merge-class-name.js";
import { useThemePortalContainer } from "../theme-scope/index.js";
import { styles } from "./dialog.stylex.js";

export const DialogRoot = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;

export const DialogPortal = React.forwardRef<HTMLDivElement, BaseDialog.Portal.Props>(
  function DialogPortal({ container, ...props }, ref) {
    const scopeContainer = useThemePortalContainer();
    return (
      <BaseDialog.Portal
        {...props}
        container={container ?? scopeContainer}
        data-slot="dialog-portal"
        ref={ref}
      />
    );
  },
);

export const DialogBackdrop = React.forwardRef<HTMLDivElement, BaseDialog.Backdrop.Props>(
  function DialogBackdrop({ className, ...props }, ref) {
    return (
      <BaseDialog.Backdrop
        {...props}
        className={mergeClassName(stylex.props(styles.backdrop).className, className)}
        data-slot="dialog-backdrop"
        ref={ref}
      />
    );
  },
);

export const DialogViewport = React.forwardRef<HTMLDivElement, BaseDialog.Viewport.Props>(
  function DialogViewport({ className, ...props }, ref) {
    return (
      <BaseDialog.Viewport
        {...props}
        className={mergeClassName(stylex.props(styles.viewport).className, className)}
        data-slot="dialog-viewport"
        ref={ref}
      />
    );
  },
);

export const DialogPopup = React.forwardRef<HTMLDivElement, BaseDialog.Popup.Props>(
  function DialogPopup({ className, ...props }, ref) {
    return (
      <BaseDialog.Popup
        {...props}
        className={mergeClassName(stylex.props(styles.popup).className, className)}
        data-slot="dialog-popup"
        ref={ref}
      />
    );
  },
);

export const DialogTitle = React.forwardRef<HTMLHeadingElement, BaseDialog.Title.Props>(
  function DialogTitle({ className, ...props }, ref) {
    return (
      <BaseDialog.Title
        {...props}
        className={mergeClassName(stylex.props(styles.title).className, className)}
        data-slot="dialog-title"
        ref={ref}
      />
    );
  },
);

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  BaseDialog.Description.Props
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <BaseDialog.Description
      {...props}
      className={mergeClassName(stylex.props(styles.description).className, className)}
      data-slot="dialog-description"
      ref={ref}
    />
  );
});

export interface DialogCloseProps extends BaseDialog.Close.Props {
  icon?: React.ReactNode;
}

export const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  function DialogClose({ children, className, icon, ...props }, ref) {
    const isIconOnly = children == null;
    const iconNode = icon === undefined ? <XIcon /> : icon;
    return (
      <BaseDialog.Close
        {...props}
        aria-label={isIconOnly ? (props["aria-label"] ?? "Close") : props["aria-label"]}
        className={mergeClassName(stylex.props(styles.close).className, className)}
        data-slot="dialog-close"
        ref={ref}
      >
        {children ??
          (iconNode === null ? null : (
            <span aria-hidden="true" data-slot="icon" {...stylex.props(styles.closeIcon)}>
              {iconNode}
            </span>
          ))}
      </BaseDialog.Close>
    );
  },
);

export const Dialog = {
  Backdrop: DialogBackdrop,
  Close: DialogClose,
  Description: DialogDescription,
  Popup: DialogPopup,
  Portal: DialogPortal,
  Root: DialogRoot,
  Title: DialogTitle,
  Trigger: DialogTrigger,
  Viewport: DialogViewport,
} as const;
