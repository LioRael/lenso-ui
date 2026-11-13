"use client";
import { use, type ComponentProps } from "react";
import * as Sdk from "@ui-sdk/react/color-picker";
import type { ColorChannel, ColorSpace } from "react-stately/Color";
import * as stylex from "@stylexjs/stylex";
import { colorAreaStyles as styles } from "@lenso/tokens/color-area";
import { colorSliderStyles as sliderStyles } from "@lenso/tokens/color-slider";
import { ColorScope, ColorValueContext, type ColorScopeProps } from "../../utils/color-state.js";
import { slotRender } from "../../utils/sdk-render.js";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
export type ColorAreaRootProps = StyleXProps<
  Omit<ColorScopeProps, "children" | "render" | "style">
> &
  Pick<ComponentProps<typeof Sdk.ColorPickerArea>, "children" | "render" | "style"> & {
    colorSpace?: ColorSpace;
    xChannel?: ColorChannel;
    yChannel?: ColorChannel;
    isDisabled?: boolean;
    showDots?: boolean;
  };
export function ColorAreaRoot({
  value,
  defaultValue,
  onChange,
  onChangeEnd,
  colorSpace,
  isDisabled,
  disabled = isDisabled,
  onValueChange,
  onValueCommit,
  controller,
  name,
  form,
  space,
  format,
  gamut,
  readOnly,
  required,
  ...props
}: ColorAreaRootProps) {
  const parent = use(ColorValueContext);
  if (parent && value === undefined && defaultValue === undefined) return <Area {...props} />;
  return (
    <ColorScope
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      onChangeEnd={onChangeEnd}
      onValueChange={onValueChange}
      onValueCommit={onValueCommit}
      controller={controller}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      name={name}
      form={form}
      gamut={gamut}
      format={format}
      space={space ?? (colorSpace === "rgb" ? "srgb" : colorSpace === "hsb" ? "hsv" : colorSpace)}
      aria-label={props["aria-label"]}
      aria-labelledby={props["aria-labelledby"]}
      style={{ display: "contents" }}
    >
      <Area {...props} />
    </ColorScope>
  );
}
type AreaProps = StyleXProps<ComponentProps<typeof Sdk.ColorPickerArea>> &
  Pick<ColorAreaRootProps, "xChannel" | "yChannel" | "showDots">;
function Area({ xChannel, yChannel, showDots, xstyle, style, render, ...props }: AreaProps) {
  const compiled = stylex.props(styles.root, showDots && styles.dots, xstyle);
  return (
    <Sdk.ColorPickerArea
      {...props}
      x={xChannel}
      y={yChannel}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "color-area", render)}
    />
  );
}
export type ColorAreaThumbProps = StyleXProps<ComponentProps<typeof Sdk.ColorPickerAreaThumb>>;
export function ColorAreaThumb({ xstyle, style, children, ...props }: ColorAreaThumbProps) {
  const compiled = stylex.props(styles.thumb, xstyle);
  return (
    <Sdk.ColorPickerAreaThumb
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "color-area-thumb", props.render)}
    >
      {(native) => (
        <>
          <span aria-hidden="true" {...stylex.props(sliderStyles.optical)}>
            <span style={{ backgroundColor: "var(--color-picker-color)" }} />
          </span>
          {typeof children === "function" ? children(native) : children}
        </>
      )}
    </Sdk.ColorPickerAreaThumb>
  );
}
