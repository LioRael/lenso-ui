"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Avatar as BaseAvatar } from "@base-ui/react/avatar";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./avatar.stylex.js";

export type AvatarSize = "compact" | "default" | "large" | "xlarge";
export type AvatarStatusState = "away" | "busy" | "offline" | "online";
export type AvatarStatusSize = "default" | "small";

const AvatarSizeContext = React.createContext<AvatarSize>("compact");

export interface AvatarRootProps extends BaseAvatar.Root.Props {
  size?: AvatarSize;
}

export const AvatarRoot = React.forwardRef<HTMLSpanElement, AvatarRootProps>(function AvatarRoot(
  { className, size = "compact", ...props },
  ref,
) {
  return (
    <AvatarSizeContext.Provider value={size}>
      <BaseAvatar.Root
        {...props}
        className={mergeClassName(stylex.props(styles.root, styles[size]).className, className)}
        data-size={size}
        data-slot="avatar-root"
        ref={ref}
      />
    </AvatarSizeContext.Provider>
  );
});

export const AvatarImage = React.forwardRef<HTMLImageElement, BaseAvatar.Image.Props>(
  function AvatarImage({ className, ...props }, ref) {
    return (
      <BaseAvatar.Image
        {...props}
        className={mergeClassName(stylex.props(styles.image).className, className)}
        data-slot="avatar-image"
        ref={ref}
      />
    );
  },
);

export const AvatarFallback = React.forwardRef<HTMLSpanElement, BaseAvatar.Fallback.Props>(
  function AvatarFallback({ className, ...props }, ref) {
    const size = React.useContext(AvatarSizeContext);
    const sizeStyle = {
      compact: styles.fallbackCompact,
      default: styles.fallbackDefault,
      large: styles.fallbackLarge,
      xlarge: styles.fallbackXlarge,
    }[size];
    return (
      <BaseAvatar.Fallback
        {...props}
        className={mergeClassName(stylex.props(styles.fallback, sizeStyle).className, className)}
        data-slot="avatar-fallback"
        ref={ref}
      />
    );
  },
);

export interface AvatarStatusProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  attached?: boolean;
  size?: AvatarStatusSize;
  state?: AvatarStatusState;
}

export const AvatarStatus = React.forwardRef<HTMLSpanElement, AvatarStatusProps>(
  function AvatarStatus(
    {
      "aria-label": ariaLabel,
      attached = false,
      className,
      size = "small",
      state = "online",
      ...props
    },
    ref,
  ) {
    return (
      <span
        {...props}
        className={[
          stylex.props(
            styles.status,
            attached && styles.statusAttached,
            size === "small" ? styles.statusSmall : styles.statusDefault,
            styles[state],
          ).className,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        data-size={size}
        data-slot="avatar-status"
        data-state={state}
        ref={ref}
      >
        <span {...stylex.props(styles.visuallyHidden)}>{ariaLabel ?? `${state} status`}</span>
      </span>
    );
  },
);

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const AvatarGroup = React.forwardRef<HTMLSpanElement, AvatarGroupProps>(function AvatarGroup(
  { children, className, ...props },
  ref,
) {
  const items = React.Children.toArray(children);
  return (
    <span
      {...props}
      className={[stylex.props(styles.group).className, className].filter(Boolean).join(" ")}
      data-slot="avatar-group"
      ref={ref}
    >
      {items.map((child, index) => (
        <span
          data-slot="avatar-group-item"
          key={React.isValidElement(child) && child.key != null ? child.key : index}
          {...stylex.props(styles.groupItem, index === 0 && styles.groupFirst)}
        >
          {child}
        </span>
      ))}
    </span>
  );
});

export const Avatar = {
  Fallback: AvatarFallback,
  Group: AvatarGroup,
  Image: AvatarImage,
  Root: AvatarRoot,
  Status: AvatarStatus,
} as const;
