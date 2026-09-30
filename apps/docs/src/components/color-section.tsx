"use client";

// Adapted from HeroUI v3.2.6 color-section.tsx (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { Gear } from "@gravity-ui/icons";
import { Tooltip } from "@lenso/ui";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { useState, type ReactNode, type ReactElement } from "react";
import { colors as styles } from "@/styles/color-handbook.stylex";
import { notebook } from "@/styles/notebook.stylex";

interface ColorSample {
  label: string;
  variable: string;
  cssValue?: string | undefined;
  tooltip?: string | undefined;
  border?: boolean;
}
interface ColorValues {
  baseVariable: string;
  baseCssValue?: string;
  baseTooltip?: string;
  foregroundVariable: string;
  foregroundCssValue?: string;
  foregroundTooltip?: string;
  hoverVariable: string;
  hoverCssValue?: string;
  hoverTooltip?: string;
}
interface ColorSectionProps extends ColorValues {
  name: string;
  soft?: ColorValues;
}

function ColorTooltip({
  children,
  content,
}: {
  children: ReactElement;
  content?: string | undefined;
}) {
  if (!content) return children;
  return (
    <Tooltip.Root>
      <BaseTooltip.Trigger delay={0} render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup xstyle={styles.tooltip}>
            <pre {...stylex.props(styles.tooltipText)}>{content}</pre>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

function ColorBlock({
  label,
  variable,
  cssValue,
  tooltip,
  border,
  swatch = false,
  header = false,
  foreground = false,
  children,
}: ColorSample & {
  swatch?: boolean;
  header?: boolean;
  foreground?: boolean;
  children?: ReactNode;
}) {
  const [status, setStatus] = useState("");
  const background = cssValue ?? `var(${variable})`;
  return (
    <>
      <ColorTooltip content={tooltip}>
        <button
          type="button"
          title={tooltip ?? variable}
          aria-label={`Copy ${label} color value`}
          {...stylex.props(
            header ? styles.header(background) : styles.block(background),
            border && styles.border,
            swatch && styles.swatch,
          )}
          onClick={async (event) => {
            const value = getComputedStyle(event.currentTarget).backgroundColor;
            try {
              await navigator.clipboard.writeText(value);
              setStatus(`Copied ${label}: ${value}`);
            } catch {
              setStatus("Clipboard unavailable. Select the color value to copy it.");
            }
          }}
        >
          <span {...stylex.props(styles.labelGroup)}>
            <span
              {...stylex.props(
                header ? styles.title : styles.label,
                foreground ? styles.foreground : styles.contrast(`var(${variable})`),
              )}
            >
              {label}
            </span>
            <span
              {...stylex.props(
                styles.token,
                foreground ? styles.foreground : styles.contrast(`var(${variable})`),
              )}
            >
              {tooltip?.split(":")[0]?.trim() || variable}
            </span>
          </span>
          {children}
        </button>
      </ColorTooltip>
      <output {...stylex.props(notebook.hidden)}>{status}</output>
    </>
  );
}

function ThemeChip({ theme }: { theme: string }) {
  return (
    <span {...stylex.props(styles.chip)}>
      <Gear width={14} height={14} aria-hidden="true" />
      {theme}
    </span>
  );
}

function NestedPanel({
  name,
  values,
  soft = false,
}: {
  name: string;
  values: ColorValues;
  soft?: boolean;
}) {
  const background = values.baseCssValue ?? `var(${values.baseVariable})`;
  return (
    <div {...stylex.props(styles.panel(background), soft && styles.softPanel(background))}>
      <span
        title={values.baseTooltip}
        {...stylex.props(styles.panelLabel, soft ? styles.foreground : styles.contrast(background))}
      >
        {name}
      </span>
      <ColorBlock
        label="Hover"
        variable={values.hoverVariable}
        cssValue={values.hoverCssValue}
        tooltip={values.hoverTooltip}
        border={soft}
        foreground={soft}
      />
      <ColorBlock
        label="Foreground"
        variable={values.foregroundVariable}
        cssValue={values.foregroundCssValue}
        tooltip={values.foregroundTooltip}
      />
    </div>
  );
}

function ThemeColumn({
  theme,
  name,
  soft,
  ...values
}: ColorSectionProps & { theme: "light" | "dark" }) {
  const background = `var(${values.baseVariable})`;
  return (
    <div data-theme={theme} {...stylex.props(styles.column)}>
      <ColorBlock label={name} variable={values.baseVariable} tooltip={values.baseTooltip} header>
        <span {...stylex.props(styles.themeText, styles.contrast(background))}>
          {theme === "light" ? "Light" : "Dark"}
        </span>
      </ColorBlock>
      <div {...stylex.props(soft ? styles.nestedRow : styles.stack)}>
        <NestedPanel name={name} values={values} />
        {soft && <NestedPanel name={`${name} Soft`} values={soft} soft />}
      </div>
    </div>
  );
}

export function ColorSectionSideBySide(props: ColorSectionProps) {
  return (
    <div {...stylex.props(styles.columns)}>
      <ThemeColumn {...props} theme="light" />
      <ThemeColumn {...props} theme="dark" />
    </div>
  );
}

export function ColorSectionPrimitive({ colors }: { colors: ColorSample[] }) {
  return (
    <div {...stylex.props(styles.row)}>
      {colors.map((color) => (
        <ColorBlock
          key={`${color.variable}-${color.label}-${color.cssValue ?? ""}`}
          {...color}
          swatch
        />
      ))}
    </div>
  );
}

export function ColorSectionStacked({
  lightColors,
  darkColors,
}: {
  lightColors: ColorSample[];
  darkColors: ColorSample[];
}) {
  return (
    <div {...stylex.props(styles.stack)}>
      {(["light", "dark"] as const).map((theme) => (
        <section key={theme} data-theme={theme} {...stylex.props(styles.stack)}>
          <ThemeChip theme={theme === "light" ? "Light" : "Dark"} />
          <ColorSectionPrimitive colors={theme === "light" ? lightColors : darkColors} />
        </section>
      ))}
    </div>
  );
}

interface FormFieldColors {
  bg: string;
  bgTooltip?: string;
  bgHover: string;
  bgHoverTooltip?: string;
  bgFocusTooltip?: string;
  placeholder: string;
  placeholderTooltip?: string;
  foreground: string;
  foregroundTooltip?: string;
}
export function ColorSectionFormField({ colors }: { colors: FormFieldColors }) {
  return (
    <div {...stylex.props(styles.stack)}>
      {(["light", "dark"] as const).map((theme) => (
        <section key={theme} data-theme={theme} {...stylex.props(styles.stack)}>
          <ThemeChip theme={theme === "light" ? "Light" : "Dark"} />
          <div {...stylex.props(styles.nestedRow)}>
            <div {...stylex.props(styles.panel(`var(${colors.bg})`), styles.border)}>
              <span
                title={colors.bgTooltip}
                {...stylex.props(styles.panelLabel, styles.contrast(`var(${colors.bg})`))}
              >
                Bg
              </span>
              <ColorBlock
                label="Hover"
                variable={colors.bg}
                cssValue={colors.bgHover}
                tooltip={colors.bgHoverTooltip}
                border
              />
              <ColorBlock
                label="Focus"
                variable={colors.bg}
                tooltip={colors.bgFocusTooltip}
                border
              />
            </div>
            <div {...stylex.props(styles.formAside)}>
              <ColorBlock
                label="Placeholder"
                variable={colors.placeholder}
                tooltip={colors.placeholderTooltip}
                border
                swatch
              />
              <ColorBlock
                label="Foreground"
                variable={colors.foreground}
                tooltip={colors.foregroundTooltip}
                swatch
              />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
