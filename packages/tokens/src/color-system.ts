import { appleColors } from "./apple-colors.js";

export type ColorEnvironment = keyof typeof appleColors;
type RGB = readonly [number, number, number];
type RGBA = readonly [number, number, number, number];

export function contrastRatio(a: RGB, b: RGB): number {
  const luminance = (rgb: RGB) =>
    rgb.reduce(
      (sum, c, i) =>
        sum +
        (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4) * [0.2126, 0.7152, 0.0722][i]!,
      0,
    );
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
function rgb(c: RGBA): RGB {
  return [c[0], c[1], c[2]];
}
export function colorCSS(c: RGBA | RGB): string {
  const channels = c
    .slice(0, 3)
    .map((v) => Number((v * 255).toFixed(8)))
    .join(" ");
  return `rgb(${channels}${c.length === 4 && c[3] !== 1 ? ` / ${c[3]}` : ""})`;
}
function foreground(fill: RGB): RGB {
  return contrastRatio(fill, [0, 0, 0]) >= contrastRatio(fill, [1, 1, 1]) ? [0, 0, 0] : [1, 1, 1];
}
// Web text adaptation is separate from the untouched native source color.
function readable(source: RGB, backgrounds: RGB[], target: number, dark: boolean): RGB {
  for (let step = 0; step <= 1000; step++) {
    const amount = step / 1000;
    const candidate = source.map(
      (c) => c * (1 - amount) + (dark ? 1 : 0) * amount,
    ) as unknown as RGB;
    if (backgrounds.every((bg) => contrastRatio(candidate, bg) >= target)) return candidate;
  }
  throw new Error("No readable semantic foreground for the sampled backgrounds");
}
export function resolveColorRoles(environment: ColorEnvironment): Record<string, string> {
  const source = appleColors[environment];
  const dark = environment.startsWith("dark");
  const target = environment.includes("increased") ? 7 : 4.5;
  const backgrounds = Object.entries(source)
    .filter(([key]) => key.startsWith("background-"))
    .map(([, c]) => rgb(c));
  const values: Record<string, string> = Object.fromEntries(
    Object.entries(source).map(([key, color]) => [key, colorCSS(color)]),
  );
  const variable = (name: string) => `var(--lenso-${name})`;
  values["tint"] = variable("system-blue");
  values["action-destructive"] = variable("system-red");
  // Apple prominent action labels are authored white, not contrast-selected black.
  values["label-on-tint"] = colorCSS([1, 1, 1]);
  values["label-on-destructive"] = colorCSS([1, 1, 1]);
  values["tint-text"] = colorCSS(readable(rgb(source["system-blue"]), backgrounds, target, dark));
  values["action-destructive-text"] = colorCSS(
    readable(rgb(source["system-red"]), backgrounds, target, dark),
  );
  for (const [status, hue] of Object.entries({
    success: "green",
    warning: "orange",
    error: "red",
    info: "blue",
  } as const)) {
    const base = rgb(source[`system-${hue}`]);
    values[`status-${status}-indicator`] = variable(`system-${hue}`);
    values[`status-${status}-fill`] = variable(`system-${hue}`);
    values[`status-${status}-on-fill`] = colorCSS(foreground(base));
    values[`status-${status}-text`] = colorCSS(readable(base, backgrounds, target, dark));
    values[`status-${status}-border`] = colorCSS(readable(base, backgrounds, 3, dark));
  }
  values["background-inverse"] = dark ? "#fff" : "#000";
  values["label-on-inverse"] = dark ? "#000" : "#fff";
  values["control-border"] = colorCSS(readable(rgb(source["system-gray"]), backgrounds, 3, dark));
  values["control-border-strong"] = variable("label-primary");
  values["focus-ring"] = variable("tint-text");
  values["focus-ring-backing"] = variable("background-primary");

  values["selection-fill"] = variable("tint");
  values["selection-text"] = variable("label-on-tint");
  values["selection-inactive-fill"] = variable("background-secondary");
  values["selection-inactive-text"] = variable("label-primary");
  values["text-selection-fill"] = variable("selection-fill");
  values["text-selection-text"] = variable("selection-text");
  return values;
}

export const colorRoleNames = Object.freeze(Object.keys(resolveColorRoles("light-standard-base")));

export function tintOverrides(
  color: RGB,
  mode: "light" | "dark",
  contrast: "standard" | "increased" = "standard",
): Record<string, string> {
  if (color.length !== 3 || color.some((c) => !Number.isFinite(c) || c < 0 || c > 1))
    throw new TypeError("Tint requires three sRGB channels in [0, 1]");
  const backgrounds = (["base", "elevated"] as const).flatMap((level) =>
    Object.entries(appleColors[`${mode}-${contrast}-${level}`])
      .filter(([key]) => key.startsWith("background-"))
      .map(([, c]) => rgb(c)),
  );
  return {
    tint: colorCSS(color),
    "label-on-tint": colorCSS(foreground(color)),
    "tint-text": colorCSS(
      readable(color, backgrounds, contrast === "increased" ? 7 : 4.5, mode === "dark"),
    ),
  };
}
