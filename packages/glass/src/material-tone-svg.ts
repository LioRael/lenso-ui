// Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz. SPDX-License-Identifier: MIT.
// SVG transfer graph for the fitted samples in material-tone.ts.
import { toneParameters, toneTables, type MaterialTone } from "./material-tone.js";
const node = (name: string, attrs: Record<string, string | number>) => {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, String(value));
  return element;
};
export function appendMaterialTone(
  filter: SVGElement,
  source: string,
  tone: MaterialTone,
  linearSurface = false,
) {
  filter.setAttribute("data-lenso-tone", tone.mode);
  filter.setAttribute("data-lenso-tone-size", String(tone.size));
  filter.setAttribute("data-lenso-tone-clarity", String(tone.clarity));
  if (linearSurface) filter.setAttribute("data-lenso-tone-transfer", "linear");
  const linear = (result: string, clarity: number) => {
    const p = toneParameters({ ...tone, clarity });
    const contrast = node("feComponentTransfer", { in: source, result: `${result}-contrast` });
    const bright = node("feComponentTransfer", {
      in: `${result}-contrast`,
      result: `${result}-brightness`,
    });
    for (const channel of ["feFuncR", "feFuncG", "feFuncB"]) {
      contrast.append(
        node(channel, { type: "linear", slope: p.contrast, intercept: 0.5 - 0.5 * p.contrast }),
      );
      bright.append(node(channel, { type: "linear", slope: p.brightness }));
    }
    filter.append(
      contrast,
      bright,
      node("feColorMatrix", {
        in: `${result}-brightness`,
        type: "saturate",
        values: p.saturation,
        result,
      }),
    );
  };
  if (tone.mode === "light" || linearSurface) {
    linear("material-face", tone.clarity);
    return;
  }
  // This is a backdrop material, clipped by its lens rather than input alpha.
  // Blur can leave partial coverage at the sampling boundary; multiplying that
  // alpha through the fitted RGB arithmetic produces opaque black bands.
  const opaque = node("feComponentTransfer", { in: source, result: "tone-input" });
  opaque.append(node("feFuncA", { type: "linear", slope: 0, intercept: 1 }));
  filter.append(opaque);
  source = "tone-input";
  const tables = toneTables(tone.size),
    range = 1.3;
  const [r, g, b] = [0.2126, 0.7152, 0.0722];
  filter.append(
    node("feColorMatrix", {
      in: source,
      values: `${r} ${g} ${b} 0 0 ${r} ${g} ${b} 0 0 ${r} ${g} ${b} 0 0 0 0 0 1 0`,
      result: "tone-luminance",
    }),
  );
  const table = (values: number[], result: string) => {
    const transfer = node("feComponentTransfer", { in: "tone-luminance", result });
    for (const channel of ["feFuncR", "feFuncG", "feFuncB"])
      transfer.append(node(channel, { type: "table", tableValues: values.join(" ") }));
    filter.append(transfer);
  };
  const gain = tables.chroma.map((n) => n / range);
  table(tables.brightness, "tone-brightness");
  table(gain, "tone-gain");
  table(
    gain.map((n) => 0.5 * (1 - n)),
    "tone-offset",
  );
  const row = (own: number) =>
    [r, g, b].map((weight, i) => (range / 2) * ((i === own ? 1 : 0) - weight)).join(" ");
  filter.append(
    node("feColorMatrix", {
      in: source,
      values: `${row(0)} 0 .5 ${row(1)} 0 .5 ${row(2)} 0 .5 0 0 0 1 0`,
      result: "tone-colour",
    }),
    node("feComposite", {
      in: "tone-colour",
      in2: "tone-gain",
      operator: "arithmetic",
      k1: 1,
      result: "tone-scaled",
    }),
    node("feComposite", {
      in: "tone-scaled",
      in2: "tone-offset",
      operator: "arithmetic",
      k2: 1,
      k3: 1,
      result: "tone-centred",
    }),
    node("feComposite", {
      in: "tone-centred",
      in2: "tone-brightness",
      operator: "arithmetic",
      k2: 2,
      k3: 1,
      k4: -1,
      result: tone.clarity === 0 ? "material-face" : "tone-regular",
    }),
  );
  if (tone.clarity > 0) {
    linear("tone-clear", 1);
    filter.append(
      node("feComposite", {
        in: "tone-regular",
        in2: "tone-clear",
        operator: "arithmetic",
        k2: 1 - tone.clarity,
        k3: tone.clarity,
        result: "material-face",
      }),
    );
  }
}
