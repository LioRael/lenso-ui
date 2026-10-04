"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";

import type { StyleXProps } from "./styled.js";

export type Theme = "light" | "dark";
export interface ThemeScopeProps extends StyleXProps<React.ComponentPropsWithRef<"div">> {
  theme?: Theme;
}

const PortalContext = React.createContext<HTMLElement | null>(null);

export function ThemeScope({ theme, xstyle, style, children, ref, ...props }: ThemeScopeProps) {
  const parentHost = React.useContext(PortalContext);
  const scopeRef = React.useRef<HTMLDivElement | null>(null);
  const [host, setHost] = React.useState<HTMLDivElement | null>(null);
  const compiled = stylex.props(xstyle);

  React.useImperativeHandle(ref, () => scopeRef.current!, []);

  React.useLayoutEffect(() => {
    const portal = document.createElement("div");
    portal.dataset["slot"] = "theme-portal-host";
    document.body.append(portal);
    // oxlint-disable-next-line react/set-state-in-effect -- Publish the committed external DOM host; creating browser nodes during render is unsafe.
    setHost(portal);
    return () => portal.remove();
  }, []);

  React.useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!host || !scope) return;
    const synchronize = () => {
      const computed = getComputedStyle(scope);
      // oxlint-disable-next-line react/immutability -- The state stores node identity; this browser-owned style declaration is mutable.
      host.style.cssText = "";
      // Copy the complete custom-property environment, not a fixed token list.
      // Consumer variables can participate in the upstream live color mixes.
      for (const property of computed) {
        if (property.startsWith("--")) {
          host.style.setProperty(property, computed.getPropertyValue(property));
        }
      }
      host.style.direction = computed.direction;
      host.style.fontFamily = computed.fontFamily;
      const themeOwner = scope.closest<HTMLElement>("[data-theme]");
      const scopedTheme = themeOwner?.dataset["theme"];
      if (scopedTheme) host.dataset["theme"] = scopedTheme;
      else delete host.dataset["theme"];
    };
    synchronize();
    const observer = new MutationObserver(synchronize);
    for (let ancestor: HTMLElement | null = scope; ancestor; ancestor = ancestor.parentElement) {
      observer.observe(ancestor, {
        attributes: true,
        attributeFilter: ["class", "style", "data-theme", "dir"],
      });
    }
    return () => observer.disconnect();
  });

  return (
    <PortalContext.Provider value={host ?? parentHost}>
      <div
        {...props}
        {...compiled}
        data-theme={theme}
        ref={scopeRef}
        style={mergeThemeStyle(compiled.style, style)}
      >
        {children}
      </div>
    </PortalContext.Provider>
  );
}

function mergeThemeStyle(
  compiled: React.CSSProperties | undefined,
  style: React.CSSProperties | undefined,
): React.CSSProperties {
  return { ...compiled, ...style };
}

export function useThemePortalContainer(): HTMLElement | null {
  return React.useContext(PortalContext);
}
