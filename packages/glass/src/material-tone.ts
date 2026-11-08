// Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz. SPDX-License-Identifier: MIT.
// Fitted samples adapted from onlymoein/liquidglass 89f8b736; continuous clear/size interpolation by Lenso.
export interface MaterialTone {
  mode: "light" | "dark";
  size: number;
  clarity: number;
}
export const darkBrightness = [
  [32, 62, 89, 113, 134, 151, 166, 177, 185],
  [32, 59, 83, 102, 117, 126, 129, 128, 121],
] as const;
export const darkChroma = [
  [1.27, 1.22, 1.18, 1.13, 1.08, 1.03, 0.98, 0.94, 0.89],
  [1.27, 1.19, 1.11, 1.03, 0.95, 0.87, 0.79, 0.71, 0.63],
] as const;
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export function toneTables(size: number) {
  return {
    brightness: darkBrightness[0].map((n, i) => mix(n, darkBrightness[1][i]!, size) / 255),
    chroma: darkChroma[0].map((n, i) => mix(n, darkChroma[1][i]!, size)),
  };
}
export function toneParameters({ mode, size, clarity }: MaterialTone) {
  return {
    contrast: mix(
      mode === "light" ? mix(0.314, 0.307, size) : mix(0.68, 0.66, size),
      0.793,
      clarity,
    ),
    brightness: mix(
      mode === "light" ? mix(1.511, 1.554, size) : mix(0.98, 0.83, size),
      1.205,
      clarity,
    ),
    saturation: mix(mode === "light" ? mix(2, 2.081, size) : mix(1.6, 1.7, size), 1.117, clarity),
  };
}
export function toneCSS(tone: MaterialTone) {
  const p = toneParameters(tone);
  return `contrast(${p.contrast}) brightness(${p.brightness}) saturate(${p.saturation})`;
}
const curve = (values: number[], x: number) => {
  const at = clamp(x) * (values.length - 1),
    lo = Math.floor(at);
  return mix(values[lo]!, values[Math.min(lo + 1, values.length - 1)]!, at - lo);
};
export function materialTone(rgb: readonly number[], tone: MaterialTone): number[] {
  const luma = (v: readonly number[]) => v[0]! * 0.2126 + v[1]! * 0.7152 + v[2]! * 0.0722;
  const linear = (p: ReturnType<typeof toneParameters>) => {
    const c = rgb.map((v) => clamp(clamp((v - 0.5) * p.contrast + 0.5) * p.brightness));
    const y = luma(c);
    return c.map((v) => clamp(y + (v - y) * p.saturation));
  };
  if (tone.mode === "light") return linear(toneParameters(tone));
  const tables = toneTables(tone.size),
    y = luma(rgb);
  const brightness = curve(tables.brightness, y),
    chroma = curve(tables.chroma, y);
  const clear = linear({ contrast: 0.793, brightness: 1.205, saturation: 1.117 });
  return rgb.map((v, i) => mix(clamp(brightness + (v - y) * chroma), clear[i]!, tone.clarity));
}

// Both GPU backends embed these same samples; the native SVG graph uses toneTables.
export function toneShader(language: "glsl" | "wgsl") {
  const glsl = language === "glsl";
  const arrays = [
    darkBrightness[0].map((n) => n / 255),
    darkBrightness[1].map((n) => n / 255),
    [...darkChroma[0]],
    [...darkChroma[1]],
  ];
  const data = arrays
    .map((a, i) =>
      glsl
        ? `const float tone${i}[9]=float[9](${a.map((n) => n.toFixed(10)).join(",")});`
        : `const tone${i}=array<f32,9>(${a.map((n) => n.toFixed(10)).join(",")});`,
    )
    .join("\n");
  if (glsl)
    return `${data}
float toneCurve(float a[9],float x){float t=clamp(x,0.,1.)*8.;int lo=int(floor(t));return mix(a[lo],a[min(lo+1,8)],fract(t));}
vec3 toneLinear(vec3 c,float contrast,float brightness,float saturation){c=clamp((c-.5)*contrast+.5,0.,1.);c=clamp(c*brightness,0.,1.);float y=dot(c,vec3(.2126,.7152,.0722));return clamp(vec3(y)+(c-vec3(y))*saturation,0.,1.);}
vec3 calibratedTone(vec3 c,float amount,float clarity,float dark){
 if(dark<.5)return toneLinear(c,mix(mix(.314,.307,amount),.793,clarity),mix(mix(1.511,1.554,amount),1.205,clarity),mix(mix(2.,2.081,amount),1.117,clarity));
 float y=dot(c,vec3(.2126,.7152,.0722));float b=mix(toneCurve(tone0,y),toneCurve(tone1,y),amount);float g=mix(toneCurve(tone2,y),toneCurve(tone3,y),amount);
 return mix(clamp(vec3(b)+(c-vec3(y))*g,0.,1.),toneLinear(c,.793,1.205,1.117),clarity);
}`;
  return `${data}
fn toneCurve(a:array<f32,9>,x:f32)->f32{let t=clamp(x,0.,1.)*8.;let lo=u32(floor(t));return mix(a[lo],a[min(lo+1,8u)],fract(t));}
fn toneLinear(input:vec3f,contrast:f32,brightness:f32,saturation:f32)->vec3f{var c=clamp((input-vec3f(.5))*contrast+vec3f(.5),vec3f(0),vec3f(1));c=clamp(c*brightness,vec3f(0),vec3f(1));let y=dot(c,vec3f(.2126,.7152,.0722));return clamp(vec3f(y)+(c-vec3f(y))*saturation,vec3f(0),vec3f(1));}
fn calibratedTone(c:vec3f,amount:f32,clarity:f32,dark:f32)->vec3f{
 if(dark<.5){return toneLinear(c,mix(mix(.314,.307,amount),.793,clarity),mix(mix(1.511,1.554,amount),1.205,clarity),mix(mix(2.,2.081,amount),1.117,clarity));}
 let y=dot(c,vec3f(.2126,.7152,.0722));let b=mix(toneCurve(tone0,y),toneCurve(tone1,y),amount);let g=mix(toneCurve(tone2,y),toneCurve(tone3,y),amount);
 return mix(clamp(vec3f(b)+(c-vec3f(y))*g,vec3f(0),vec3f(1)),toneLinear(c,.793,1.205,1.117),clarity);
}`;
}
