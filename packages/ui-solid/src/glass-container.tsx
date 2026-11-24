import { attachFusion, type FusionGroup } from "@lenso/glass/fusion";
import { glassContainerStyles } from "@lenso/tokens/glass-container";
import * as stylex from "@stylexjs/stylex";
import { createEffect, createSignal, omit, type ComponentProps } from "solid-js";
import { Glass, GlassFusionContext } from "./glass.jsx";
import { htmlPart } from "./parts.js";

const Container = htmlPart<"div", { tint?: string }>(
  "div",
  "glass-container",
  (props) => [
    glassContainerStyles.root,
    props.tint ? glassContainerStyles.tint(props.tint) : false,
  ],
  "tint",
);

export type GlassContainerProps = ComponentProps<typeof Container> & {
  spacing?: number;
  disabled?: boolean;
};

function Root(props: GlassContainerProps) {
  const [element, setElement] = createSignal<HTMLDivElement>();
  const [surface, setSurface] = createSignal<HTMLDivElement>();
  const group: FusionGroup = { members: new Set(), update: () => {} };
  createEffect(
    () => [element(), surface(), props.disabled, props.spacing ?? 20] as const,
    ([node, paint, disabled, spacing]) => {
      if (node && paint && !disabled) {
        return attachFusion(
          node,
          paint,
          group,
          Number.isFinite(spacing) ? Math.max(0, spacing) : 20,
        );
      }
    },
  );

  return (
    <GlassFusionContext value={() => (props.disabled ? undefined : group)}>
      <Container
        {...omit(props, "ref", "children", "disabled", "spacing")}
        ref={[setElement, props.ref]}
      >
        {props.children}
        <div
          ref={setSurface}
          {...stylex.attrs(glassContainerStyles.surface)}
          data-lenso-glass-fusion=""
          aria-hidden="true"
          hidden
        >
          <div {...stylex.attrs(glassContainerStyles.rim)} />
        </div>
      </Container>
    </GlassFusionContext>
  );
}

export const GlassContainer = Object.assign(Root, { Item: Glass });
