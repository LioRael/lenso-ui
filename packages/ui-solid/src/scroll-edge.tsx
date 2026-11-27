import {
  bindScrollEdge,
  softEdgeBands,
  softEdgeMask,
  createSoftEdgeTintMask,
  type ScrollEdgeSide,
} from "@lenso/glass/motion";
import { materialStyles as s } from "@lenso/tokens/materials";
import { For, createSignal, createEffect, omit, type ComponentProps } from "solid-js";
import { htmlPart, attributes } from "./parts.js";
const Root = htmlPart("div", "scroll-edge", () => s.edge);
export type ScrollEdgeProps = ComponentProps<typeof Root> & {
  variant?: "soft" | "hard";
  edge?: ScrollEdgeSide;
  scrollRef?: HTMLElement | null;
  fadeStart?: number;
};
export function ScrollEdge(props: ScrollEdgeProps) {
  const [node, setNode] = createSignal<HTMLDivElement>();
  createEffect(
    () => [node(), props.scrollRef, props.edge ?? "top"] as const,
    ([element, viewport, edge]) =>
      element && viewport ? bindScrollEdge(element, viewport, edge) : undefined,
  );
  const styles = () => {
    const variant = props.variant ?? "soft",
      edge = props.edge ?? "top";
    return [
      s.edge,
      variant === "soft" && s.soft,
      variant === "hard" && s.hard,
      variant === "hard" &&
        {
          top: s.hardTop,
          bottom: s.hardBottom,
          "inline-start": s.hardInlineStart,
          "inline-end": s.hardInlineEnd,
        }[edge],
      s[edge],
      s.edgeAccessible,
      props.xstyle,
    ];
  };
  return (
    <Root
      {...omit(props, "variant", "edge", "scrollRef", "fadeStart", "children", "ref", "xstyle")}
      ref={[setNode, props.ref]}
      aria-hidden="true"
      data-edge={props.edge ?? "top"}
      data-variant={props.variant ?? "soft"}
      data-scroll-bound={props.scrollRef ? "" : undefined}
      xstyle={styles()}
    >
      {props.variant === "hard" ? (
        props.children
      ) : (
        <>
          <For each={softEdgeBands}>
            {(band) => (
              <span
                {...attributes(
                  s.softLayer,
                  s.softProgressive(
                    band.blur,
                    props.fadeStart
                      ? softEdgeMask(band.start, band.end, 1, props.fadeStart)
                      : band.mask,
                  ),
                )}
              />
            )}
          </For>
          <span
            {...attributes(
              s.softLayer,
              s.softTint,
              s.softMask(createSoftEdgeTintMask(props.fadeStart)),
            )}
          />
        </>
      )}
    </Root>
  );
}
