"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Toast as BaseToast } from "@base-ui/react/toast";
import { XIcon } from "lucide-react";

import type { StyleXProps } from "../shared/stylex-props.js";
import { useThemePortalContainer } from "../theme-scope/index.js";
import { styles } from "./toast.stylex.js";

export type ToastTone = "default" | "error" | "success";

export const ToastProvider = BaseToast.Provider;
export const useToastManager = BaseToast.useToastManager;
export const createToastManager = BaseToast.createToastManager;

export const ToastPortal = React.forwardRef<HTMLDivElement, BaseToast.Portal.Props>(
  function ToastPortal({ container, ...props }, ref) {
    const scopeContainer = useThemePortalContainer();
    return <BaseToast.Portal {...props} container={container ?? scopeContainer} ref={ref} />;
  },
);

export const ToastViewport = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseToast.Viewport.Props>
>(function ToastViewport({ xstyle, ...props }, ref) {
  return (
    <BaseToast.Viewport
      {...props}
      className={stylex.props(styles.viewport, xstyle).className}
      data-slot="toast-viewport"
      ref={ref}
    />
  );
});

export interface ToastRootProps extends StyleXProps<BaseToast.Root.Props> {
  tone?: ToastTone;
}

export const ToastRoot = React.forwardRef<HTMLDivElement, ToastRootProps>(function ToastRoot(
  { tone, toast, xstyle, ...props },
  ref,
) {
  const resolvedTone =
    tone ?? (toast.type === "success" || toast.type === "error" ? toast.type : "default");
  return (
    <BaseToast.Root
      {...props}
      aria-label={
        props["aria-label"] ??
        (typeof toast.title === "string"
          ? toast.title
          : typeof toast.description === "string"
            ? toast.description
            : undefined)
      }
      className={stylex.props(styles.root, xstyle).className}
      data-slot="toast-root"
      data-tone={resolvedTone}
      ref={ref}
      toast={toast}
    />
  );
});

export const ToastContent = React.forwardRef<HTMLDivElement, StyleXProps<BaseToast.Content.Props>>(
  function ToastContent({ xstyle, ...props }, ref) {
    return (
      <BaseToast.Content
        {...props}
        className={stylex.props(styles.content, xstyle).className}
        data-slot="toast-content"
        ref={ref}
      />
    );
  },
);

export interface ToastIconProps extends StyleXProps<React.ComponentPropsWithoutRef<"span">> {
  tone?: ToastTone;
}

export const ToastIcon = React.forwardRef<HTMLSpanElement, ToastIconProps>(function ToastIcon(
  { children, tone = "default", xstyle, ...props },
  ref,
) {
  const defaultIcon =
    tone === "success" ? (
      <span {...stylex.props(styles.statusGlyph)}>✓</span>
    ) : tone === "error" ? (
      <span {...stylex.props(styles.statusGlyph)}>!</span>
    ) : (
      <i {...stylex.props(styles.infoIcon)}>i</i>
    );
  return (
    <span
      {...props}
      aria-hidden="true"
      {...stylex.props(
        styles.icon,
        tone === "success" && styles.success,
        tone === "error" && styles.error,
        xstyle,
      )}
      data-slot="toast-icon"
      ref={ref}
    >
      {children ?? defaultIcon}
    </span>
  );
});

export const ToastTitle = React.forwardRef<HTMLHeadingElement, StyleXProps<BaseToast.Title.Props>>(
  function ToastTitle({ xstyle, ...props }, ref) {
    return (
      <BaseToast.Title
        {...props}
        className={stylex.props(styles.text, styles.title, xstyle).className}
        data-slot="toast-title"
        ref={ref}
      />
    );
  },
);

export const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  StyleXProps<BaseToast.Description.Props>
>(function ToastDescription({ xstyle, ...props }, ref) {
  return (
    <BaseToast.Description
      {...props}
      className={stylex.props(styles.text, xstyle).className}
      data-slot="toast-description"
      ref={ref}
    />
  );
});

export interface ToastCloseProps extends StyleXProps<BaseToast.Close.Props> {
  icon?: React.ReactNode;
}
export const ToastClose = React.forwardRef<HTMLButtonElement, ToastCloseProps>(function ToastClose(
  { children, icon, xstyle, ...props },
  ref,
) {
  const iconNode = icon === undefined ? <XIcon size={16} strokeWidth={1.5} /> : icon;
  return (
    <BaseToast.Close
      {...props}
      aria-label={
        children == null ? (props["aria-label"] ?? "Dismiss notification") : props["aria-label"]
      }
      className={stylex.props(styles.close, xstyle).className}
      data-slot="toast-close"
      ref={ref}
    >
      {children ??
        (iconNode === null ? null : (
          <span aria-hidden="true" data-slot="icon" {...stylex.props(styles.closeIcon)}>
            {iconNode}
          </span>
        ))}
    </BaseToast.Close>
  );
});

export const ToastAction = React.forwardRef<HTMLButtonElement, StyleXProps<BaseToast.Action.Props>>(
  function ToastAction({ xstyle, ...props }, ref) {
    return (
      <BaseToast.Action
        {...props}
        className={stylex.props(styles.action, xstyle).className}
        data-slot="toast-action"
        ref={ref}
      />
    );
  },
);

export function ToastList() {
  const { toasts } = BaseToast.useToastManager();
  return toasts.map((toast) => {
    const tone: ToastTone =
      toast.type === "success" || toast.type === "error" ? toast.type : "default";
    return (
      <ToastRoot key={toast.id} toast={toast} tone={tone}>
        <ToastContent>
          <ToastIcon tone={tone} />
          {toast.title && toast.description ? (
            <div {...stylex.props(styles.textStack)}>
              <ToastTitle />
              <ToastDescription />
            </div>
          ) : toast.title ? (
            <ToastTitle />
          ) : (
            <ToastDescription />
          )}
          <ToastClose />
        </ToastContent>
      </ToastRoot>
    );
  });
}

export const Toast = {
  Action: ToastAction,
  Close: ToastClose,
  Content: ToastContent,
  List: ToastList,
  Portal: ToastPortal,
  Provider: ToastProvider,
  Root: ToastRoot,
  Title: ToastTitle,
  Description: ToastDescription,
  Icon: ToastIcon,
  Viewport: ToastViewport,
  createToastManager,
  useToastManager,
} as const;
