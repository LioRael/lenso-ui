// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Modified: bind shared optics and motion to the Solid element lifetime.
import { attachGlass } from "@lenso/glass";
import { observeGlassPreferences, glassIsOpaque, type FusionGroup } from "@lenso/glass/fusion";
import { bindPress, bindPressHighlight } from "@lenso/glass/motion";
import { glassStyles } from "@lenso/tokens/glass";
import {
  createContext,
  createEffect,
  createSignal,
  omit,
  useContext,
  type ComponentProps,
} from "solid-js";
import { htmlPart } from "./parts.js";

export const GlassFusionContext = createContext<() => FusionGroup | undefined>(() => undefined);

export function createGlassElement<Element extends HTMLElement>(options: {
  profile?: string;
  elastic: () => boolean;
  enabled?: () => boolean;
}) {
  const [element, setElement] = createSignal<Element>();
  const fusion = useContext(GlassFusionContext);
  createEffect(
    () => [element(), options.enabled?.() ?? true, fusion?.()] as const,
    ([node, enabled, group]) => {
      if (!node || !enabled) return;
      const stopGlass = attachGlass(node, { profileKey: options.profile });
      const stopHighlight = bindPressHighlight(node);
      function stopOptics() {
        stopHighlight();
        stopGlass();
      }
      if (!group || node.hasAttribute("popover") || node.tagName === "DIALOG") return stopOptics;
      const sync = () => {
        if (glassIsOpaque(node)) group.members.delete(node);
        else group.members.add(node);
        group.update();
      };
      const stopPreferences = observeGlassPreferences(node, sync);
      sync();
      return () => {
        stopPreferences();
        group.members.delete(node);
        group.update();
        stopOptics();
      };
    },
  );
  createEffect(
    () => [element(), options.elastic(), options.enabled?.() ?? true] as const,
    ([node, elastic, enabled]) => {
      return node && elastic && enabled ? bindPress(node) : undefined;
    },
  );
  return { element, ref: setElement };
}

const Surface = htmlPart<"div", { elastic?: boolean }>(
  "div",
  "glass",
  (props) => [
    glassStyles.root,
    glassStyles.optics,
    glassStyles.foreground,
    glassStyles.hotspot,
    props.elastic && glassStyles.elastic,
  ],
  "elastic",
);

export type GlassProps = ComponentProps<typeof Surface>;

export function Glass(props: GlassProps) {
  const { ref } = createGlassElement<HTMLDivElement>({
    profile: "glass-small",
    elastic: () => Boolean(props.elastic),
  });
  return <Surface {...omit(props, "ref")} ref={[ref, props.ref]} />;
}
