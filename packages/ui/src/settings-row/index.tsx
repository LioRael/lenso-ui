"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";

import { createStyledPart } from "../shared/styled-part.js";
import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./settings-row.stylex.js";

export interface SettingsRowRootProps extends StyleXProps<React.ComponentPropsWithRef<"div">> {
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
  controlId: controlIdProp,
  disabled = false,
  labelId: labelIdProp,
  ref,
  xstyle,
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
        {...stylex.props(styles.root, xstyle)}
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
  StyleXProps<React.ComponentPropsWithRef<"h3">>
>(function SettingsRowTitle({ children, id, xstyle, ...props }, ref) {
  const { labelId } = React.useContext(SettingsRowContext);

  return (
    <h3
      {...props}
      {...stylex.props(styles.title, xstyle)}
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

export type SettingsRowLabelProps = Omit<StyleXProps<React.ComponentPropsWithRef<"label">>, "id">;

export const SettingsRowLabel = React.forwardRef<HTMLLabelElement, SettingsRowLabelProps>(
  function SettingsRowLabel({ htmlFor, onPointerEnter, onPointerLeave, xstyle, ...props }, ref) {
    const { controlId, disabled, labelId, setLabelHovered } = React.useContext(SettingsRowContext);

    React.useEffect(() => () => setLabelHovered(false), [setLabelHovered]);

    return (
      <label
        {...props}
        aria-disabled={disabled || undefined}
        {...stylex.props(styles.title, styles.interactiveLabel, xstyle)}
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
  StyleXProps<React.ComponentPropsWithRef<"div">>,
  "children"
> {
  children?: React.ReactNode | ((state: SettingsRowControlRenderState) => React.ReactNode);
}

export const SettingsRowControl = React.forwardRef<HTMLDivElement, SettingsRowControlProps>(
  function SettingsRowControl({ children, xstyle, ...props }, ref) {
    const { controlId, disabled, labelId, visualState } = React.useContext(SettingsRowContext);
    const content =
      typeof children === "function"
        ? children({ controlId, disabled, labelId, visualState })
        : children;

    return (
      <div
        {...props}
        {...stylex.props(styles.control, xstyle)}
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
