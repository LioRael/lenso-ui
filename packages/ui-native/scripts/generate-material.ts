import { readFile, writeFile } from "node:fs/promises";
import { darkBrightness, darkChroma, toneParameters } from "../../glass/src/material-tone.ts";

const number = (value: number) => value.toFixed(10);
function curve(name: string, rows: readonly (readonly number[])[], divisor: number) {
  const sample = (i: number) =>
    `mix(${number(rows[0]![i]! / divisor)},${number(rows[1]![i]! / divisor)},size)`;
  return `float ${name}(float x,float size){
  float t=clamp(x,0.0,1.0)*8.0;
  ${Array.from({ length: 8 }, (_, i) => `if(t<${i + 1}.0)return mix(${sample(i)},${sample(i + 1)},t-${i}.0);`).join("\n  ")}
  return ${sample(8)};
}`;
}
const light = [0, 1].map((size) => toneParameters({ mode: "light", size, clarity: 0 }));
const clear = toneParameters({ mode: "light", size: 0, clarity: 1 });
const parameter = (key: keyof typeof clear) =>
  `mix(mix(${number(light[0]![key])},${number(light[1]![key])},size),${number(clear[key])},clarity)`;
const source = `// Generated from packages/glass/src/material-tone.ts. Do not edit.
// Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz. SPDX-License-Identifier: MIT.
package expo.modules.lensoglass

internal const val LENSO_TONE = """
${curve("lensoBrightness", darkBrightness, 255)}
${curve("lensoChroma", darkChroma, 1)}
float3 lensoLinear(float3 rgb,float contrast,float brightness,float saturation){
  float3 c=clamp((rgb-0.5)*contrast+0.5,0.0,1.0);
  c=clamp(c*brightness,0.0,1.0);
  float y=dot(c,float3(0.2126,0.7152,0.0722));
  return clamp(float3(y)+(c-float3(y))*saturation,0.0,1.0);
}
float3 lensoTone(float3 rgb,float size,float clarity,float dark){
  if(dark<0.5)return lensoLinear(rgb,${parameter("contrast")},${parameter("brightness")},${parameter("saturation")});
  float y=dot(rgb,float3(0.2126,0.7152,0.0722));
  float b=lensoBrightness(y,size),g=lensoChroma(y,size);
  return mix(clamp(float3(b)+(rgb-float3(y))*g,0.0,1.0),lensoLinear(rgb,${number(clear.contrast)},${number(clear.brightness)},${number(clear.saturation)}),clarity);
}
"""
`;
const destination = new URL(
  "../android/src/main/java/expo/modules/lensoglass/LensoTone.kt",
  import.meta.url,
);
if (process.argv.includes("--check")) {
  if ((await readFile(destination, "utf8")) !== source)
    throw new Error("Native material is stale; run the ui-native generate script.");
} else await writeFile(destination, source);
