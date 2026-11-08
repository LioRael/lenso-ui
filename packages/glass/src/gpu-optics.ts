// WebKit filter adaptation. SPDX-License-Identifier: LGPL-2.0-or-later.
// See THIRD_PARTY_NOTICES.md for source provenance.
import { toneShader, type MaterialTone } from "./material-tone.js";
import { createPrimaryBlur } from "./gpu-blur.js";
import { renderPipeline } from "./gpu-pipeline.js";
import type { CaptureShape } from "./gpu-capture.js";

export interface Optics {
  key: string;
  filter: SVGFilterElement;
  field: Element;
  shade: Element | null;
  contour: Element | null;
  scales: number[];
  softness: number;
  matrix: number[];
  material: "matrix" | "small-light" | "medium-light" | "medium-dark" | "calibrated";
  tone?: MaterialTone;
}

const fittedFilters = new WeakMap<SVGFilterElement, { signature: string; optics: Optics }>();
let nextFilter = 0;

export function readOptics(filterValue: string): Optics | undefined {
  const id = filterValue.match(/#([^")]+)/)?.[1];
  const filter = id ? document.getElementById(id) : null;
  if (!(filter instanceof SVGFilterElement)) return;
  if (filter.getAttribute("data-lenso-tone-transfer") === "linear") return;
  const signature = filter.innerHTML;
  const fitted = fittedFilters.get(filter);
  if (fitted?.signature === signature) return fitted.optics;
  const nodes = [...filter.children];
  const mode = filter.getAttribute("data-lenso-tone");
  if (mode === "light" || mode === "dark") {
    const size = Number(filter.getAttribute("data-lenso-tone-size"));
    const clarity = Number(filter.getAttribute("data-lenso-tone-clarity"));
    const shade = filter.querySelector('[result="material-shade"]');
    const field = nodes[0];
    const smoothing = filter.querySelector('[result="displaced"]');
    const mixed = smoothing?.tagName === "feComposite";
    const softness = mixed
      ? 0.4 * Number(smoothing.getAttribute("k3"))
      : Number(smoothing?.getAttribute("stdDeviation"));
    const scales = [nodes[1], nodes[3], nodes[5]].map((n) => Number(n?.getAttribute("scale")));
    if (
      (!shade && !filter.hasAttribute("data-lenso-material-foreground")) ||
      field?.tagName !== "feImage" ||
      !smoothing ||
      ![size, clarity, softness, ...scales].every(Number.isFinite) ||
      (mixed &&
        (smoothing.getAttribute("in") !== "bent" ||
          smoothing.getAttribute("in2") !== "post-softened" ||
          smoothing.getAttribute("operator") !== "arithmetic" ||
          !Number.isFinite(Number(smoothing.getAttribute("k2"))) ||
          Number(smoothing.getAttribute("k1")) !== 0 ||
          Number(smoothing.getAttribute("k4")) !== 0 ||
          Math.abs(
            Number(smoothing.getAttribute("k2")) + Number(smoothing.getAttribute("k3")) - 1,
          ) > 1e-8)) ||
      softness < 0 ||
      softness > 0.4 ||
      size < 0 ||
      size > 1 ||
      clarity < 0 ||
      clarity > 1 ||
      !filter.querySelector('[result="material-face"]')
    )
      return;
    const optics: Optics = {
      key: `${id!}:${nextFilter++}`,
      filter,
      field,
      shade,
      contour: filter.querySelector('[result="contour-paint"]'),
      scales,
      softness,
      matrix: [],
      material: "calibrated",
      tone: { mode, size, clarity },
    };
    fittedFilters.set(filter, { signature, optics });
    return optics;
  }

  const prefix =
    "feImage,feDisplacementMap,feColorMatrix,feDisplacementMap,feColorMatrix,feDisplacementMap,feColorMatrix,feComposite,feComposite,feGaussianBlur,feColorMatrix";
  const tail = nodes
    .slice(11)
    .map((node) => node.tagName)
    .join(",");
  const smallLight = tail === "feColorMatrix,feFlood,feBlend,feImage,feComposite";
  const mediumLight = tail === "feColorMatrix,feFlood,feBlend,feComposite,feImage,feComposite";
  const mediumDark =
    tail ===
    "feImage,feComposite,feFlood,feBlend,feFlood,feBlend,feFlood,feBlend,feImage,feComposite";
  if (
    nodes
      .slice(0, 11)
      .map((node) => node.tagName)
      .join(",") !== prefix ||
    (!smallLight &&
      !mediumLight &&
      !mediumDark &&
      ![
        "feColorMatrix,feImage,feComposite",
        "feImage,feComposite,feColorMatrix,feImage,feComposite",
      ].includes(tail)) ||
    nodes[9]?.getAttribute("edgeMode") !== "duplicate" ||
    Number(nodes[9]?.getAttribute("stdDeviation")) !== 0.4 ||
    Number(nodes[10]?.getAttribute("values")) !== 1
  )
    return;
  const field = nodes[0]!,
    shade = filter.querySelector('[result="material-shade"]');
  const face = filter.querySelector('[result="material-face"]');
  if (!shade || !face) return;
  const matrixNode = smallLight || mediumLight ? nodes[11]! : face;
  if (!mediumDark && matrixNode.tagName !== "feColorMatrix") return;
  const scales = [nodes[1]!, nodes[3]!, nodes[5]!].map((node) =>
    Number(node.getAttribute("scale")),
  );
  const matrix = mediumDark
    ? []
    : (matrixNode.getAttribute("values") ?? "").trim().split(/\s+/).map(Number);
  const composite = nodes.at(-1)!;
  const contour = filter.querySelector('[result="contour-paint"]');
  const contourComposite = filter.querySelector('[result="contour-backdrop"]');
  if (
    (!mediumDark && matrix.length !== 20) ||
    ![...scales, ...matrix].every(Number.isFinite) ||
    composite.getAttribute("operator") !== "arithmetic" ||
    Number(composite.getAttribute("k2")) !== 1 ||
    Number(composite.getAttribute("k3")) !== 1 ||
    Number(composite.getAttribute("k4")) !== -0.5 ||
    (contour &&
      (!contourComposite ||
        contourComposite.getAttribute("operator") !== "arithmetic" ||
        Number(contourComposite.getAttribute("k2")) !== 1 ||
        Number(contourComposite.getAttribute("k3")) !== 1 ||
        Number(contourComposite.getAttribute("k4")) !== -1))
  )
    return;
  if (
    mediumLight &&
    (nodes[12]!.getAttribute("flood-color") !== "#bfbfbf" ||
      nodes[13]!.getAttribute("mode") !== "darken" ||
      Number(face.getAttribute("k2")) !== 0.1 ||
      Number(face.getAttribute("k3")) !== 0.9)
  )
    return;
  if (
    smallLight &&
    (nodes[12]!.getAttribute("flood-color") !== "rgb(248 248 248)" ||
      Number(nodes[12]!.getAttribute("flood-opacity")) !== 0.2 ||
      face.getAttribute("mode") !== "luminosity")
  )
    return;
  if (
    mediumDark &&
    (nodes[13]!.getAttribute("flood-color") !== "rgb(26 26 26)" ||
      Number(nodes[13]!.getAttribute("flood-opacity")) !== 0.7 ||
      nodes[14]!.getAttribute("mode") !== "luminosity" ||
      nodes[15]!.getAttribute("flood-color") !== "rgb(26 26 26)" ||
      Number(nodes[15]!.getAttribute("flood-opacity")) !== 0.9 ||
      nodes[16]!.getAttribute("mode") !== "luminosity" ||
      nodes[17]!.getAttribute("flood-color") !== "#1a1a1a" ||
      face.getAttribute("mode") !== "lighten")
  )
    return;
  const optics = {
    key: `${id!}:${nextFilter++}`,
    filter,
    field,
    shade,
    contour,
    scales,
    softness: 0.4,
    matrix,
    material: smallLight
      ? ("small-light" as const)
      : mediumLight
        ? ("medium-light" as const)
        : mediumDark
          ? ("medium-dark" as const)
          : ("matrix" as const),
  };
  fittedFilters.set(filter, { signature, optics });
  return optics;
}

export async function createOpticsBatch(device: GPUDevice, optics: Optics, shape: CaptureShape) {
  const { dpr, width, height, margin, count } = shape;
  const columns = Math.min(10, count),
    rows = Math.ceil(count / columns);
  const strideX = width + margin * 2 + 2,
    strideY = height + margin * 2 + 2;
  const padding = 7 * dpr,
    tileWidth = width * dpr + 2 * padding,
    tileHeight = height * dpr + 2 * padding;
  const sourceWidth = strideX * columns * dpr,
    sourceHeight = strideY * rows * dpr;
  const maximum = device.limits.maxTextureDimension2D;
  if (Math.max(sourceWidth, sourceHeight, tileWidth * columns, tileHeight * rows) > maximum)
    throw new Error("Shared glass exceeds this device's texture dimensions");
  const sourceLayers = (shape.blur ?? 3) * dpr > 8 ? 6 : 4;
  const bytes =
    (sourceWidth * sourceHeight * sourceLayers + tileWidth * columns * tileHeight * rows * 5) * 4;
  if (bytes > 128 * 1024 * 1024) throw new Error("Shared glass batch exceeds its resource budget");
  const textures: GPUTexture[] = [];
  const buffers: GPUBuffer[] = [];
  let primary: Awaited<ReturnType<typeof createPrimaryBlur>> | undefined;
  const dispose = () => {
    primary?.dispose();
    for (const texture of textures) texture.destroy();
    for (const buffer of buffers) buffer.destroy();
  };
  const texture = (w: number, h: number, extra = 0, format: GPUTextureFormat = "rgba8unorm") => {
    const value = device.createTexture({
      size: [w, h],
      format,
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT |
        extra,
    });
    textures.push(value);
    return value;
  };
  try {
    const source = texture(sourceWidth, sourceHeight, GPUTextureUsage.STORAGE_BINDING);
    const raw = texture(sourceWidth, sourceHeight);
    primary = await createPrimaryBlur(device, {
      source: raw,
      destination: source,
      width: sourceWidth,
      height: sourceHeight,
      dpr,
      sigma: shape.blur ?? 3,
    });
    const maps: GPUTexture[] = [];
    for (const node of [
      optics.field,
      ...(optics.shade ? [optics.shade] : []),
      ...(optics.contour ? [optics.contour] : []),
    ]) {
      const image = new Image();
      if (dpr === 1) {
        const fitted = optics.filter.cloneNode(false) as SVGFilterElement;
        fitted.id = "map-capture";
        fitted.setAttribute("filterUnits", "userSpaceOnUse");
        for (const [key, value] of Object.entries({ x: 0, y: 0, width, height }))
          fitted.setAttribute(key, String(value));
        fitted.append(node.cloneNode());
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${fitted.outerHTML}<rect width="${width}" height="${height}" filter="url(#map-capture)"/></svg>`)}`;
      } else image.src = node.getAttribute("href")!;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
      const map = texture(canvas.width, canvas.height);
      device.queue.copyExternalImageToTexture(
        { source: canvas },
        { texture: map, premultipliedAlpha: true },
        [canvas.width, canvas.height],
      );
      maps.push(map);
      // WebKit can still read the canvas backing store while this upload is pending.
      await device.queue.onSubmittedWorkDone();
      canvas.width = canvas.height = 1;
    }
    const indices = device.createBuffer({
      size: Math.max(4, count * 4),
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    const settings = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    buffers.push(indices, settings);
    const stages = Array.from({ length: 5 }, () =>
      texture(tileWidth * columns, tileHeight * rows, GPUTextureUsage.COPY_SRC),
    );
    const mixesSoftness = optics.softness > 0 && optics.softness < 0.4;
    const header = `
struct Vertex{@builtin(position)position:vec4f,@location(0)@interpolate(flat)instance:u32,@location(1)@interpolate(flat)cell:u32}
@group(0)@binding(0)var source:texture_2d<f32>;
@group(0)@binding(1)var field:texture_2d<f32>;
${optics.shade ? "@group(0)@binding(2)var shade:texture_2d<f32>;" : ""}
${optics.contour ? "@group(0)@binding(3)var contourMap:texture_2d<f32>;" : ""}
@group(0)@binding(4)var<storage,read> indices:array<u32>;
@group(0)@binding(5)var<uniform> settings:vec4u;
${mixesSoftness ? "@group(0)@binding(6)var unsoftened:texture_2d<f32>;" : ""}
@vertex fn vertex(@builtin(vertex_index)i:u32,@builtin(instance_index)n:u32)->Vertex{
let uv=array<vec2f,6>(vec2f(0,0),vec2f(1,0),vec2f(0,1),vec2f(0,1),vec2f(1,0),vec2f(1,1))[i];let cell=indices[n];
let p=(vec2f(f32(cell%settings.y),f32(cell/settings.y))+uv)*vec2f(${tileWidth},${tileHeight});
return Vertex(vec4f(p/vec2f(${tileWidth * columns},${tileHeight * rows})*vec2f(2,-2)+vec2f(-1,1),0,1),n,cell);}
fn mapPixel(t:texture_2d<f32>,p:vec2i)->vec4f{if(any(p<vec2i(0))||any(p>=vec2i(textureDimensions(t)))){return vec4f(0);}return textureLoad(t,p,0);}
fn origin(n:u32)->vec2i{return vec2i(i32(n%${columns}),i32(n/${columns}))*vec2i(${tileWidth},${tileHeight});}
`;
    const rays = `@fragment fn fragment(v:Vertex)->@location(0)vec4f{
let p=vec2i(v.position.xy)-origin(v.cell)-vec2i(${padding});let f=mapPixel(field,p);let channels=f.rg/max(f.a,.00001);
let base=vec2i(${margin}+${strideX}*i32(v.instance%settings.x),${margin}+${strideY}*i32(v.instance/settings.x))*${dpr}+p;
let r=mapPixel(source,base+vec2i(channels*${optics.scales[0]! * dpr}+vec2f(${0.5 - optics.scales[0]! * dpr * 0.5})));
let g=mapPixel(source,base+vec2i(channels*${optics.scales[1]! * dpr}+vec2f(${0.5 - optics.scales[1]! * dpr * 0.5})));
let b=mapPixel(source,base+vec2i(channels*${optics.scales[2]! * dpr}+vec2f(${0.5 - optics.scales[2]! * dpr * 0.5})));
return vec4f(r.r,g.g,b.b,min(1.,r.a+g.a+b.a));}`;
    const blur = `@fragment fn fragment(v:Vertex)->@location(0)vec4f{
let p=vec2i(v.position.xy);let lo=origin(v.cell);let hi=lo+vec2i(${tileWidth - 1},${tileHeight - 1});var sum=vec4f(0);
for(var y=-1;y<=1;y++){for(var x=-1;x<=1;x++){sum+=round(textureLoad(source,clamp(p+vec2i(x,y),lo,hi),0)*255);}}
return floor(sum/9.+.5)/255;}`;
    const number = (value: number) => value.toFixed(12);
    const matrix =
      optics.material === "medium-dark" || optics.material === "calibrated"
        ? ""
        : Array.from(
            { length: 4 },
            (_, row) =>
              `dot(c,vec4f(${optics.matrix
                .slice(row * 5, row * 5 + 4)
                .map(number)
                .join(",")}))+${number(optics.matrix[row * 5 + 4]!)}*255`,
          ).join(",");
    const material = `${optics.tone ? toneShader("wgsl") : ""}
fn luminosity(backdrop:vec4f, alpha:f32, gray:f32)->vec4f {
 let pixel=round(backdrop*255);
 let overlap=floor(pixel.rgb*alpha/255+vec3f(.5));
 let delta=floor(floor(gray*pixel.a/255+.5)-dot(overlap,vec3f(77,151,28))/256+.5);
 var shifted=overlap+vec3f(delta);
 let lum=floor(dot(shifted,vec3f(77,151,28))/256+.5);let lo=min(shifted.r,min(shifted.g,shifted.b));let hi=max(shifted.r,max(shifted.g,shifted.b));
 if(lo<0.){let ratio=floor(lum*65536./(lum-lo))/65536.;shifted=floor(vec3f(lum)+(shifted-vec3f(lum))*ratio+vec3f(.5));}
 let ceiling=round(alpha*pixel.a/255);
 if(hi>ceiling){let ratio=floor((ceiling-lum)*65536./(hi-lum))/65536.;shifted=floor(vec3f(lum)+(shifted-vec3f(lum))*ratio+vec3f(.5));}
 let color=round(pixel.rgb*(255-alpha)/255)+round(vec3f(gray)*(255-pixel.a)/255)+shifted;
 return clamp(vec4f(color,alpha+pixel.a-ceiling),vec4f(0),vec4f(255))/255;
}
@fragment fn fragment(v:Vertex)->@location(0)vec4f{
let p=vec2i(v.position.xy);let local=p-origin(v.cell)-vec2i(${padding});let sampled=${mixesSoftness ? `mix(textureLoad(unsoftened,p,0),textureLoad(source,p,0),${optics.softness / 0.4})` : "textureLoad(source,p,0)"};
${optics.contour ? "let premul=floor(clamp(round(sampled*255)+round(mapPixel(contourMap,local)*255)-vec4f(255),vec4f(0),vec4f(255)))/255;" : "let premul=sampled;"}
${
  optics.material === "calibrated"
    ? `let face=vec4f(round(calibratedTone(premul.rgb/max(premul.a,.00001),${number(optics.tone!.size)},${number(optics.tone!.clarity)},${optics.tone!.mode === "dark" ? "1." : "0."})*premul.a*255),round(premul.a*255));`
    : optics.material === "medium-dark"
      ? `let first=luminosity(premul,179,18);let second=round(luminosity(first,230,23)*255);let face=vec4f(max(second.rgb+vec3f(round(26*(255-second.a)/255)),vec3f(26)),255);`
      : `
let c=vec4f(round(premul.rgb/max(premul.a,.00001)*255),round(premul.a*255));let result=round(clamp(vec4f(${matrix}),vec4f(0),vec4f(255)));let transformed=vec4f(round(result.rgb*result.a/255),result.a);
${
  optics.material === "medium-light"
    ? "let darkened=vec4f(min(transformed.rgb+vec3f(round(191*(1-transformed.a/255))),vec3f(191)),255);let face=floor(clamp((darkened+transformed*9.)/10.,vec4f(0),vec4f(255)));"
    : optics.material === "small-light"
      ? "let face=round(luminosity(transformed/255,51,50)*255);"
      : "let face=transformed;"
}`
}
${optics.shade ? "let s=round(mapPixel(shade,local)*255);let outputColor=floor(clamp(face+s-vec4f(127.5),vec4f(0),vec4f(255)));" : "let outputColor=face;"}return vec4f(min(outputColor.rgb,vec3f(outputColor.a)),outputColor.a)/255;}`;
    const pipelines = await Promise.all(
      [rays, blur, material].map((code) => renderPipeline(device, header + code)),
    );
    const group = (index: number, input: GPUTexture) => {
      const entries: GPUBindGroupEntry[] = [
        { binding: 0, resource: input.createView() },
        { binding: 4, resource: { buffer: indices } },
        { binding: 5, resource: { buffer: settings } },
      ];
      if (index === 0) entries.push({ binding: 1, resource: maps[0]!.createView() });
      if (index === 2) {
        if (mixesSoftness) entries.push({ binding: 6, resource: stages[0]!.createView() });
        if (optics.shade) entries.push({ binding: 2, resource: maps[1]!.createView() });
        if (optics.contour)
          entries.push({ binding: 3, resource: maps[optics.shade ? 2 : 1]!.createView() });
      }
      return device.createBindGroup({ layout: pipelines[index]!.getBindGroupLayout(0), entries });
    };
    const passes = [
      { pipeline: pipelines[0]!, group: group(0, source), output: stages[0]! },
      ...Array.from({ length: optics.softness > 0 ? 3 : 0 }, (_, index) => ({
        pipeline: pipelines[1]!,
        group: group(1, stages[index]!),
        output: stages[index + 1]!,
      })),
      {
        pipeline: pipelines[2]!,
        group: group(2, stages[optics.softness > 0 ? 3 : 0]!),
        output: stages[4]!,
      },
    ];
    let initialized = false;
    const outputPadding =
      optics.material === "matrix" ||
      optics.material === "small-light" ||
      optics.material === "calibrated"
        ? 0
        : padding;
    return {
      bytes: bytes + maps.length * width * height * dpr * dpr * 4 + count * 4 + 32,
      padding: outputPadding / dpr,
      update(
        encoder: GPUCommandEncoder,
        pixels: ImageData | { canvas: HTMLCanvasElement; width: number; height: number },
        cells: number[],
        sourceColumns: number,
      ) {
        // Opaque crops avoid CPU readback. Transparent paint retains the native alpha conversion.
        if ("canvas" in pixels)
          device.queue.copyExternalImageToTexture(
            { source: pixels.canvas },
            { texture: raw, premultipliedAlpha: true },
            [pixels.width, pixels.height],
          );
        else
          device.queue.writeTexture(
            { texture: raw },
            pixels.data as Uint8ClampedArray<ArrayBuffer>,
            { bytesPerRow: pixels.width * 4 },
            [pixels.width, pixels.height],
          );
        device.queue.writeBuffer(indices, 0, new Uint32Array(cells));
        device.queue.writeBuffer(settings, 0, new Uint32Array([sourceColumns, columns, 0, 0]));
        primary!.render(encoder, {
          width: pixels.width,
          height: pixels.height,
          premultiplied: "canvas" in pixels,
        });
        for (const pass of passes) {
          const render = encoder.beginRenderPass({
            colorAttachments: [
              {
                view: pass.output.createView(),
                loadOp: initialized ? "load" : "clear",
                storeOp: "store",
                clearValue: [0, 0, 0, 0],
              },
            ],
          });
          render.setPipeline(pass.pipeline);
          render.setBindGroup(0, pass.group);
          render.draw(6, cells.length);
          render.end();
        }
        initialized = true;
      },
      copy(encoder: GPUCommandEncoder, cell: number, destination: GPUTexture) {
        encoder.copyTextureToTexture(
          {
            texture: stages[4]!,
            origin: [
              (cell % columns) * tileWidth + padding - outputPadding,
              Math.floor(cell / columns) * tileHeight + padding - outputPadding,
            ],
          },
          { texture: destination },
          [width * dpr + outputPadding * 2, height * dpr + outputPadding * 2],
        );
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
