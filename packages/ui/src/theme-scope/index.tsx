"use client";

import * as React from "react";

import { semanticTokenNames, type SemanticToken, type ThemeName } from "@lenso/tokens";

interface ThemeContextValue {
  overrides: Partial<Record<SemanticToken, string>>;
  portalHost: HTMLDivElement | null;
  theme: ThemeName | "system";
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export interface ThemeScopeProps extends React.ComponentPropsWithoutRef<"div"> {
  overrides?: Partial<Record<SemanticToken, string>>;
  theme?: ThemeName | "system";
}

export const ThemeScope = React.forwardRef<HTMLDivElement, ThemeScopeProps>(function ThemeScope(
  { children, className, overrides, style, theme, ...props },
  forwardedRef,
) {
  const parent = React.useContext(ThemeContext);
  const resolvedTheme = theme ?? parent?.theme ?? "light";
  const resolvedOverrides = React.useMemo(
    () => ({ ...parent?.overrides, ...overrides }),
    [overrides, parent?.overrides],
  );
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [portalHost, setPortalHost] = React.useState<HTMLDivElement | null>(null);
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      hostRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );
  const overrideStyle = React.useMemo(() => {
    const entries = Object.entries(resolvedOverrides).map(([path, value]) => [
      semanticTokenNames[path as SemanticToken],
      value,
    ]);
    return Object.fromEntries(entries) as React.CSSProperties;
  }, [resolvedOverrides]);

  React.useLayoutEffect(() => {
    const host = document.createElement("div");
    host.dataset.slot = "theme-portal-host";
    document.body.append(host);
    setPortalHost(host);
    return () => host.remove();
  }, []);

  React.useLayoutEffect(() => {
    if (!portalHost) return;
    portalHost.dataset.theme = resolvedTheme;
    for (const tokenName of Object.values(semanticTokenNames)) {
      portalHost.style.removeProperty(tokenName);
    }
    for (const [tokenName, value] of Object.entries(overrideStyle)) {
      if (value != null) portalHost.style.setProperty(tokenName, String(value));
    }
  }, [overrideStyle, portalHost, resolvedTheme]);

  const context = React.useMemo<ThemeContextValue>(
    () => ({ overrides: resolvedOverrides, portalHost, theme: resolvedTheme }),
    [portalHost, resolvedOverrides, resolvedTheme],
  );

  return (
    <ThemeContext.Provider value={context}>
      <div
        {...props}
        className={className}
        data-slot="theme-scope"
        data-theme={resolvedTheme}
        ref={setRef}
        style={{ ...overrideStyle, ...style }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
});

export function useThemePortalContainer(): HTMLDivElement | null {
  return React.useContext(ThemeContext)?.portalHost ?? null;
}
