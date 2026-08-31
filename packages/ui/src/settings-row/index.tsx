"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";

import { mergeClassName } from "../shared/merge-class-name.js";
import { createStyledPart } from "../shared/styled-part.js";
import { styles } from "./settings-row.stylex.js";

export interface SettingsRowRootProps extends React.ComponentPropsWithRef<"div"> {
  controlId?: string;
  disabled?: boolean;
  labelId?: string;
}

export interface SettingsRowControlRenderState {
  controlId: string;
  disabled: boolean;
  labelId: string;
  visualState: "hover" | undefined;
}

interface SettingsRowContextValue extends SettingsRowControlRenderState {
  setLabelHovered: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingsRowContext = React.createContext<SettingsRowContextValue>({
  controlId: "",
  disabled: false,
  labelId: "",
  setLabelHovered: () => {},
  visualState: undefined,
});

export function SettingsRowRoot({
  children,
  className,
  controlId: controlIdProp,
  disabled = false,
  labelId: labelIdProp,
  ref,
  ...props
}: SettingsRowRootProps) {
  const generatedId = React.useId();
  const [labelHovered, setLabelHovered] = React.useState(false);
  const controlId = controlIdProp ?? `${generatedId}-control`;
  const labelId = labelIdProp ?? `${generatedId}-label`;
  const hovered = !disabled && labelHovered;
  const contextValue = React.useMemo(
    () => ({
      controlId,
      disabled,
      labelId,
      setLabelHovered,
      visualState: hovered ? ("hover" as const) : undefined,
    }),
    [controlId, disabled, hovered, labelId],
  );

  return (
    <SettingsRowContext.Provider value={contextValue}>
      <div
        {...props}
        aria-disabled={disabled || undefined}
        className={mergeClassName(stylex.props(styles.root).className, className) as string}
        data-disabled={disabled ? "true" : undefined}
        data-slot="settings-row"
        ref={ref}
      >
        {children}
      </div>
    </SettingsRowContext.Provider>
  );
}

export const SettingsRowCopy = createStyledPart("div", "settings-row-copy", styles.copy);

export const SettingsRowTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithRef<"h3">
>(function SettingsRowTitle({ children, className, id, ...props }, ref) {
  const { labelId } = React.useContext(SettingsRowContext);

  return (
    <h3
      {...props}
      className={mergeClassName(stylex.props(styles.title).className, className) as string}
      data-slot="settings-row-title"
      id={id ?? labelId}
      ref={ref}
    >
      {children}
    </h3>
  );
});

export const SettingsRowDescription = createStyledPart(
  "p",
  "settings-row-description",
  styles.description,
);

export type SettingsRowLabelProps = Omit<React.ComponentPropsWithRef<"label">, "id">;

export const SettingsRowLabel = React.forwardRef<HTMLLabelElement, SettingsRowLabelProps>(
  function SettingsRowLabel({ className, htmlFor, onPointerEnter, onPointerLeave, ...props }, ref) {
    const { controlId, disabled, labelId, setLabelHovered } = React.useContext(SettingsRowContext);

    React.useEffect(() => () => setLabelHovered(false), [setLabelHovered]);

    return (
      <label
        {...props}
        aria-disabled={disabled || undefined}
        className={
          mergeClassName(
            stylex.props(styles.title, styles.interactiveLabel).className,
            className,
          ) as string
        }
        data-slot="settings-row-label"
        htmlFor={htmlFor ?? controlId}
        id={labelId}
        onPointerEnter={(event) => {
          if (!disabled && event.pointerType !== "touch") setLabelHovered(true);
          onPointerEnter?.(event);
        }}
        onPointerLeave={(event) => {
          setLabelHovered(false);
          onPointerLeave?.(event);
        }}
        ref={ref}
      />
    );
  },
);

export interface SettingsRowControlProps extends Omit<
  React.ComponentPropsWithRef<"div">,
  "children"
> {
  children?: React.ReactNode | ((state: SettingsRowControlRenderState) => React.ReactNode);
}

export const SettingsRowControl = React.forwardRef<HTMLDivElement, SettingsRowControlProps>(
  function SettingsRowControl({ children, className, ...props }, ref) {
    const { controlId, disabled, labelId, visualState } = React.useContext(SettingsRowContext);
    const content =
      typeof children === "function"
        ? children({ controlId, disabled, labelId, visualState })
        : children;

    return (
      <div
        {...props}
        className={mergeClassName(stylex.props(styles.control).className, className) as string}
        data-slot="settings-row-control"
        ref={ref}
      >
        {content}
      </div>
    );
  },
);

export const SettingsRow = {
  Control: SettingsRowControl,
  Copy: SettingsRowCopy,
  Description: SettingsRowDescription,
  Label: SettingsRowLabel,
  Root: SettingsRowRoot,
  Title: SettingsRowTitle,
} as const;
