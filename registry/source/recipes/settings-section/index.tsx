import * as React from "react";
import * as stylex from "@stylexjs/stylex";

import { Surface, type SurfaceProps } from "@lenso/ui/surface";

import { styles } from "./settings-section.stylex";

type StyleXProps<Props> = Omit<Props, "className"> & { xstyle?: stylex.StyleXStyles };

export type SettingsSectionRootProps = StyleXProps<React.ComponentPropsWithoutRef<"section">>;

export const SettingsSectionRoot = React.forwardRef<HTMLElement, SettingsSectionRootProps>(
  function SettingsSectionRoot({ xstyle, ...props }, ref) {
    return (
      <section
        {...props}
        {...stylex.props(styles.root, xstyle)}
        data-slot="settings-section"
        ref={ref}
      />
    );
  },
);

export type SettingsSectionHeaderProps = StyleXProps<React.ComponentPropsWithoutRef<"header">>;

export const SettingsSectionHeader = React.forwardRef<HTMLElement, SettingsSectionHeaderProps>(
  function SettingsSectionHeader({ xstyle, ...props }, ref) {
    return (
      <header
        {...props}
        {...stylex.props(styles.header, xstyle)}
        data-slot="settings-section-header"
        ref={ref}
      />
    );
  },
);

export type SettingsSectionTitleProps = StyleXProps<React.ComponentPropsWithoutRef<"h2">>;

export const SettingsSectionTitle = React.forwardRef<HTMLHeadingElement, SettingsSectionTitleProps>(
  function SettingsSectionTitle({ children, xstyle, ...props }, ref) {
    return (
      <h2
        {...props}
        {...stylex.props(styles.title, xstyle)}
        data-slot="settings-section-title"
        ref={ref}
      >
        {children}
      </h2>
    );
  },
);

export type SettingsSectionDescriptionProps = StyleXProps<React.ComponentPropsWithoutRef<"p">>;

export const SettingsSectionDescription = React.forwardRef<
  HTMLParagraphElement,
  SettingsSectionDescriptionProps
>(function SettingsSectionDescription({ xstyle, ...props }, ref) {
  return (
    <p
      {...props}
      {...stylex.props(styles.description, xstyle)}
      data-slot="settings-section-description"
      ref={ref}
    />
  );
});

export type SettingsGroupProps = Omit<SurfaceProps, "level">;

/**
 * The visual rows container used inside a SettingsSection. It is also exposed
 * as SettingsSection.Group so both spellings share this one implementation.
 */
export const SettingsGroup = React.forwardRef<HTMLElement, SettingsGroupProps>(
  function SettingsGroup({ children, xstyle, ...props }, ref) {
    const rows = React.Children.toArray(children);
    return (
      <Surface
        {...props}
        xstyle={[styles.group, xstyle]}
        data-recipe="settings-group"
        level="panel"
        ref={ref}
      >
        {rows.map((row, index) =>
          React.isValidElement<{ xstyle?: stylex.StyleXStyles }>(row) && index === rows.length - 1
            ? React.cloneElement(row, {
                xstyle: [styles.lastRow, row.props.xstyle],
              })
            : row,
        )}
      </Surface>
    );
  },
);

export const SettingsSection = {
  Description: SettingsSectionDescription,
  Group: SettingsGroup,
  Header: SettingsSectionHeader,
  Root: SettingsSectionRoot,
  Title: SettingsSectionTitle,
} as const;
