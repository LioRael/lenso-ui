"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import type { StyleXProps } from "../shared/stylex-props.js";
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

export const DialogBackdrop = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseDialog.Backdrop.Props>
>(function DialogBackdrop({ xstyle, ...props }, ref) {
  return (
    <BaseDialog.Backdrop
      {...props}
      className={stylex.props(styles.backdrop, xstyle).className}
      data-slot="dialog-backdrop"
      ref={ref}
    />
  );
});

export const DialogViewport = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseDialog.Viewport.Props>
>(function DialogViewport({ xstyle, ...props }, ref) {
  return (
    <BaseDialog.Viewport
      {...props}
      className={stylex.props(styles.viewport, xstyle).className}
      data-slot="dialog-viewport"
      ref={ref}
    />
  );
});

export const DialogPopup = React.forwardRef<HTMLDivElement, StyleXProps<BaseDialog.Popup.Props>>(
  function DialogPopup({ xstyle, ...props }, ref) {
    return (
      <BaseDialog.Popup
        {...props}
        className={stylex.props(styles.popup, xstyle).className}
        data-slot="dialog-popup"
        ref={ref}
      />
    );
  },
);

export const DialogHeader = React.forwardRef<
  HTMLDivElement,
  StyleXProps<React.ComponentPropsWithoutRef<"div">>
>(function DialogHeader({ xstyle, ...props }, ref) {
  return (
    <div {...props} {...stylex.props(styles.header, xstyle)} data-slot="dialog-header" ref={ref} />
  );
});

export const DialogBody = React.forwardRef<
  HTMLDivElement,
  StyleXProps<React.ComponentPropsWithoutRef<"div">>
>(function DialogBody({ xstyle, ...props }, ref) {
  return (
    <div {...props} {...stylex.props(styles.body, xstyle)} data-slot="dialog-body" ref={ref} />
  );
});

export const DialogFooter = React.forwardRef<
  HTMLDivElement,
  StyleXProps<React.ComponentPropsWithoutRef<"div">>
>(function DialogFooter({ xstyle, ...props }, ref) {
  return (
    <div {...props} {...stylex.props(styles.footer, xstyle)} data-slot="dialog-footer" ref={ref} />
  );
});

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  StyleXProps<BaseDialog.Title.Props>
>(function DialogTitle({ xstyle, ...props }, ref) {
  return (
    <BaseDialog.Title
      {...props}
      className={stylex.props(styles.title, xstyle).className}
      data-slot="dialog-title"
      ref={ref}
    />
  );
});

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  StyleXProps<BaseDialog.Description.Props>
>(function DialogDescription({ xstyle, ...props }, ref) {
  return (
    <BaseDialog.Description
      {...props}
      className={stylex.props(styles.description, xstyle).className}
      data-slot="dialog-description"
      ref={ref}
    />
  );
});

export interface DialogCloseProps extends StyleXProps<BaseDialog.Close.Props> {
  icon?: React.ReactNode;
}

export const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  function DialogClose({ children, icon, xstyle, ...props }, ref) {
    const isIconOnly = children == null;
    const iconNode = icon === undefined ? <XIcon /> : icon;
    return (
      <BaseDialog.Close
        {...props}
        aria-label={isIconOnly ? (props["aria-label"] ?? "Close") : props["aria-label"]}
        className={stylex.props(isIconOnly && styles.close, xstyle).className}
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
  Body: DialogBody,
  Close: DialogClose,
  Description: DialogDescription,
  Footer: DialogFooter,
  Header: DialogHeader,
  Popup: DialogPopup,
  Portal: DialogPortal,
  Root: DialogRoot,
  Title: DialogTitle,
  Trigger: DialogTrigger,
  Viewport: DialogViewport,
} as const;
