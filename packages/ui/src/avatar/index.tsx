"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Avatar as BaseAvatar } from "@base-ui/react/avatar";

import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./avatar.stylex.js";

export type AvatarSize = "compact" | "default" | "large" | "xlarge";
export type AvatarStatusState = "away" | "busy" | "offline" | "online";
export type AvatarStatusSize = "default" | "small";

const AvatarSizeContext = React.createContext<AvatarSize>("compact");

export interface AvatarRootProps extends StyleXProps<BaseAvatar.Root.Props> {
  size?: AvatarSize;
}

export const AvatarRoot = React.forwardRef<HTMLSpanElement, AvatarRootProps>(function AvatarRoot(
  { size = "compact", xstyle, ...props },
  ref,
) {
  return (
    <AvatarSizeContext.Provider value={size}>
      <BaseAvatar.Root
        {...props}
        className={stylex.props(styles.root, styles[size], xstyle).className}
        data-size={size}
        data-slot="avatar-root"
        ref={ref}
      />
    </AvatarSizeContext.Provider>
  );
});

export type AvatarImageProps = StyleXProps<BaseAvatar.Image.Props>;
export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  function AvatarImage({ xstyle, ...props }, ref) {
    return (
      <BaseAvatar.Image
        {...props}
        className={stylex.props(styles.image, xstyle).className}
        data-slot="avatar-image"
        ref={ref}
      />
    );
  },
);

export type AvatarFallbackProps = StyleXProps<BaseAvatar.Fallback.Props>;
export const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  function AvatarFallback({ xstyle, ...props }, ref) {
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
        className={stylex.props(styles.fallback, sizeStyle, xstyle).className}
        data-slot="avatar-fallback"
        ref={ref}
      />
    );
  },
);

export interface AvatarStatusProps extends StyleXProps<
  Omit<React.HTMLAttributes<HTMLSpanElement>, "children">
> {
  attached?: boolean;
  size?: AvatarStatusSize;
  state?: AvatarStatusState;
}

export const AvatarStatus = React.forwardRef<HTMLSpanElement, AvatarStatusProps>(
  function AvatarStatus(
    {
      "aria-label": ariaLabel,
      attached = false,
      size = "small",
      state = "online",
      xstyle,
      ...props
    },
    ref,
  ) {
    return (
      <span
        {...props}
        className={
          stylex.props(
            styles.status,
            attached && styles.statusAttached,
            size === "small" ? styles.statusSmall : styles.statusDefault,
            styles[state],
            xstyle,
          ).className
        }
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

export interface AvatarGroupProps extends StyleXProps<React.HTMLAttributes<HTMLSpanElement>> {
  children: React.ReactNode;
}

export const AvatarGroup = React.forwardRef<HTMLSpanElement, AvatarGroupProps>(function AvatarGroup(
  { children, xstyle, ...props },
  ref,
) {
  return (
    <span
      {...props}
      className={stylex.props(styles.group, xstyle).className}
      data-slot="avatar-group"
      ref={ref}
    >
      {React.Children.map(children, (child, index) => (
        <span
          data-slot="avatar-group-item"
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
