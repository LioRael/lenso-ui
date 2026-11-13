"use client";
import * as SdkTooltip from "@ui-sdk/react/tooltip";
import { slotRender } from "../../utils/sdk-render.js";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { materialStyles } from "@lenso/tokens/materials";
import { tooltipStyles as s } from "@lenso/tokens/tooltip";
import { AnchoredMaterial } from "../../utils/materials/anchored.js";
import { presentationMaterials } from "../../utils/materials/presentation.js";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

const ArrowPresenceContext = React.createContext<((present: boolean) => void) | null>(null);

export function TooltipRoot(props: React.ComponentProps<typeof SdkTooltip.Tooltip>) {
  return <SdkTooltip.Tooltip delay={1500} closeDelay={500} {...props} />;
}
export function TooltipTrigger({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentProps<typeof SdkTooltip.TooltipTrigger>>) {
  const compiled = stylex.props(s.trigger, xstyle);
  return (
    <SdkTooltip.TooltipTrigger
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("button", props["data-lenso-slot"] ?? "tooltip-trigger", props.render)}
    />
  );
}
export function TooltipContent({
  children,
  sideOffset,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkTooltip.TooltipContent>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkTooltip.TooltipContent>, "ref">) {
  const [hasArrow, setHasArrow] = React.useState(false);
  const compiled = stylex.props(
    materialStyles.root,
    materialStyles.accessible,
    materialStyles[presentationMaterials.anchored],
    s.positioner,
    s.popup,
    xstyle,
  );
  return (
    <ArrowPresenceContext value={setHasArrow}>
      <SdkTooltip.TooltipContent
        sideOffset={sideOffset ?? (hasArrow ? 7 : 3)}
        role="tooltip"
        {...props}
        {...compiled}
        style={mergeStyle(compiled.style, style)}
        render={slotRender(
          "div",
          (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "tooltip-popup",
          props.render,
        )}
        data-material={presentationMaterials.anchored}
      >
        {(state) => (
          <>
            <AnchoredMaterial kind="tooltip" />
            {typeof children === "function" ? children(state) : children}
          </>
        )}
      </SdkTooltip.TooltipContent>
    </ArrowPresenceContext>
  );
}
export function TooltipArrow({
  children,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkTooltip.TooltipArrow>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkTooltip.TooltipArrow>, "ref">) {
  const setArrowPresent = React.useContext(ArrowPresenceContext);
  React.useLayoutEffect(() => {
    setArrowPresent?.(true);
    return () => setArrowPresent?.(false);
  }, [setArrowPresent]);
  const compiled = stylex.props(s.arrow, xstyle);
  return (
    <SdkTooltip.TooltipArrow
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender(
        "div",
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "tooltip-arrow",
        props.render,
      )}
    >
      {children ?? (
        <span
          aria-hidden="true"
          data-lenso-slot="tooltip-arrow-material"
          {...stylex.props(s.arrowMaterial)}
        />
      )}
    </SdkTooltip.TooltipArrow>
  );
}
export const Tooltip = Object.assign(TooltipRoot, {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
  Arrow: TooltipArrow,
});
