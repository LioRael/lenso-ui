"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";

import type { StyleXProps } from "./styled.js";
import { synchronizeThemePortal } from "./sync-theme-portal.js";

export type Theme = "light" | "dark";
export interface ThemeScopeProps extends StyleXProps<React.ComponentPropsWithRef<"div">> {
  theme?: Theme;
  /** Legacy opacity: 0 is solid; 1 retains the appearance selected by glassTint. Inherited by nested scopes and portals. */
  glassTransparency?: number;
  /** 0 is more clear, 0.5 is the reference recipe, and 1 is more tinted. */
  glassTint?: number;
  contrast?: "standard" | "increased";
  level?: "base" | "elevated";
  "data-contrast"?: "standard" | "increased";
  "data-level"?: "base" | "elevated";
}

const AppearanceContext = React.createContext<{
  contrast?: "standard" | "increased";
  level?: "base" | "elevated";
}>({});

const PortalContext = React.createContext<HTMLElement | null>(null);

export function ThemeScope({
  theme,
  glassTransparency,
  glassTint,
  contrast,
  level,
  xstyle,
  style,
  children,
  ref,
  ...props
}: ThemeScopeProps) {
  const parentHost = React.useContext(PortalContext);
  const inherited = React.useContext(AppearanceContext);
  const appearance = {
    contrast: contrast ?? props["data-contrast"] ?? inherited.contrast,
    level: level ?? props["data-level"] ?? inherited.level,
  };
  const scopeRef = React.useRef<HTMLDivElement | null>(null);
  const [host, setHost] = React.useState<HTMLDivElement | null>(null);
  const compiled = stylex.props(xstyle);

  React.useImperativeHandle(ref, () => scopeRef.current!, []);

  React.useLayoutEffect(() => {
    const portal = document.createElement("div");
    portal.dataset["lensoSlot"] = "theme-portal-host";
    document.body.append(portal);
    // oxlint-disable-next-line react/set-state-in-effect -- Publish the committed external DOM host; creating browser nodes during render is unsafe.
    setHost(portal);
    return () => portal.remove();
  }, []);

  React.useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!host || !scope) return;
    const synchronize = () => synchronizeThemePortal(scope, host);
    synchronize();
    const observer = new MutationObserver(synchronize);
    for (let ancestor: HTMLElement | null = scope; ancestor; ancestor = ancestor.parentElement) {
      observer.observe(ancestor, {
        attributes: true,
        attributeFilter: [
          "class",
          "style",
          "data-theme",
          "data-lenso-theme",
          "data-contrast",
          "data-level",
          "dir",
        ],
      });
    }
    const media = [
      "(prefers-color-scheme: dark)",
      "(prefers-contrast: more)",
      "(prefers-reduced-transparency: reduce)",
      "(forced-colors: active)",
    ].map((query) => matchMedia(query));
    for (const query of media) query.addEventListener("change", synchronize);
    return () => {
      observer.disconnect();
      for (const query of media) query.removeEventListener("change", synchronize);
    };
  });

  return (
    <AppearanceContext value={appearance}>
      <PortalContext.Provider value={host ?? parentHost}>
        <div
          {...props}
          {...compiled}
          data-theme={theme}
          data-contrast={appearance.contrast}
          data-level={appearance.level}
          ref={scopeRef}
          style={mergeThemeStyle(
            {
              ...compiled.style,
              ...(glassTint === undefined
                ? {}
                : {
                    "--lenso-glass-tint-amount": Number.isFinite(glassTint)
                      ? Math.max(0, Math.min(1, glassTint))
                      : 0.5,
                  }),
              ...(glassTransparency === undefined
                ? {}
                : {
                    "--lenso-glass-transparency": Number.isFinite(glassTransparency)
                      ? Math.max(0, Math.min(1, glassTransparency))
                      : 1,
                  }),
            } as React.CSSProperties,
            style,
          )}
        >
          {children}
        </div>
      </PortalContext.Provider>
    </AppearanceContext>
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
