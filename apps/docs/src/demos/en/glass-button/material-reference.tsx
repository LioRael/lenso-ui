"use client";

import { Check, TrashBin } from "@gravity-ui/icons";
import { GlassButton } from "@lenso/ui/glass-button";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const s = stylex.create({
  scenes: { display: "flex", flexWrap: "wrap", gap: 24, alignItems: "start" },
  scene: { margin: 0 },
  caption: {
    fontSize: 12,
    lineHeight: "18px",
    color: "var(--lenso-label-secondary)",
    marginBottom: 8,
  },
  canvas: { position: "relative", width: 230, height: 320, flexShrink: 0 },
  backdrop: { position: "absolute", inset: 0 },
  light: { backgroundColor: "#fff" },
  dark: { backgroundColor: "#000" },
  action: (x: number, y: number, width: number) => ({
    position: "absolute",
    left: x,
    top: y,
    width,
  }),
});

// The exported kit's 230×320 light/dark examples, with local SVG icons instead of SF Symbols.
export function MaterialReference({
  captions = ["Light background", "Dark background"],
}: { captions?: readonly [string, string] } = {}) {
  const [activations, setActivations] = useState({ light: 0, dark: 0 });
  const activate = (theme: "light" | "dark") =>
    setActivations((counts) => ({ ...counts, [theme]: counts[theme] + 1 }));
  return (
    <div {...stylex.props(s.scenes)}>
      {(["light", "dark"] as const).map((theme) => (
        <figure key={theme} {...stylex.props(s.scene)}>
          <figcaption {...stylex.props(s.caption)}>
            {captions[theme === "light" ? 0 : 1]}
            <output aria-live="polite">
              {activations[theme] > 0 ? ` · ${activations[theme]}` : ""}
            </output>
          </figcaption>
          <div data-theme={theme} data-testid={`apple-${theme}`} {...stylex.props(s.canvas)}>
            <div data-lenso-backdrop {...stylex.props(s.backdrop, s[theme])} />
            {([30, 100, 170, 240] as const).map((y, index) => {
              const destructive = index >= 2;
              const variant = index % 2 === 0 ? "prominent" : "default";
              const label = destructive ? "Delete" : "Done";
              return (
                <div key={y}>
                  <GlassButton
                    variant={variant}
                    onClick={() => activate(theme)}
                    destructive={destructive}
                    xstyle={s.action(20, y, destructive ? 94 : 83)}
                  >
                    {label}
                  </GlassButton>
                  <GlassButton
                    variant={variant}
                    onClick={() => activate(theme)}
                    destructive={destructive}
                    isIconOnly
                    aria-label={`${label} symbol`}
                    icon={destructive ? <TrashBin /> : <Check />}
                    xstyle={s.action(150, y, 50)}
                  />
                </div>
              );
            })}
          </div>
        </figure>
      ))}
    </div>
  );
}
