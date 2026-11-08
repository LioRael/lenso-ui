// Optical equations adapted from the retained renderer (MIT).
// Copyright (c) 2026 Kelvin Zhang. Modified: compute fields and exact CPU repair.
import { encodeCanvas } from "./canvas.js";
import { profile } from "./optical-fields.js";
import { uniformFusionShade } from "./apple-material.js";
import { fusionGeometry } from "./fusion-geometry.js";
import type { FusionFieldInput, FusionFields } from "./fusion-fields.js";

const fragment = `#version 300 es
precision highp float;
uniform vec2 size,pixels;
uniform int count;
uniform float blend,bezel,thickness,maximum,distanceError;
uniform vec4 rects[16];uniform float radii[16];
uniform sampler2D profiles;
out vec4 color;
void main(){
 vec2 p=gl_FragCoord.xy*size/pixels;
 float distance=0.,localThickness=0.,minRadial=1e20;vec2 normal=vec2(0.);
 for(int i=0;i<count;i++){
  vec2 halfSize=rects[i].zw*.5,local=p-rects[i].xy-halfSize;
  vec2 q=abs(local)-(halfSize-vec2(radii[i])),outside=max(q,vec2(0.));
  float radial=length(outside);minRadial=min(minRadial,radial);
  float d=radii[i]-radial-min(max(q.x,q.y),0.);
  float weight=i==0?1.:blend>0.?clamp(.5+.5*(d-distance)/blend,0.,1.):d>distance?1.:0.;
  vec2 n=radial>0.?outside/radial*sign(local):q.x>q.y?vec2(sign(local.x),0.):vec2(0.,sign(local.y));
  distance=i==0?d:distance*(1.-weight)+d*weight+blend*weight*(1.-weight);
  normal=normal*(1.-weight)+n*weight;
  localThickness=localThickness*(1.-weight)+clamp(min(rects[i].z,rects[i].w)*.2,8.,24.)*weight;
 }
 float norm=length(normal);if(norm>0.)normal/=norm;
 float shift=0.,slope=0.;
 if(distance>=0.&&distance<bezel){
  float at=distance/bezel*127.;int lower=int(floor(at)),upper=min(lower+1,127);
  vec3 a=texelFetch(profiles,ivec2(lower,0),0).rgb,b=texelFetch(profiles,ivec2(upper,0),0).rgb;
  float lo=localThickness==thickness?a.r:a.g+a.b*localThickness;
  float hi=localThickness==thickness?b.r:b.g+b.b*localThickness;
  shift=lo+(hi-lo)*(at-float(lower));slope=abs(hi-lo)*127./bezel;
 }
 vec2 raw=vec2(127.5)-normal*shift/maximum*127.5;
 float normalError=(1e-5+4.*distanceError*(1./max(minRadial,1.)+1./max(blend,1.)))/max(norm,.001);
 float uncertainty=.0001+127.5/maximum*(slope*distanceError+abs(shift)*normalError+abs(shift)*1e-5);
 bool boundary=abs(distance)<4.*distanceError||abs(distance-bezel)<4.*distanceError;
 bool quantized=distance>=0.&&distance<bezel&&(norm<.001||any(lessThanEqual(abs(fract(raw)-vec2(.5)),vec2(uncertainty))));
 color=vec4(clamp(floor(raw+vec2(.5)),vec2(0.),vec2(255.)),boundary||quantized?255.:128.,255.)/255.;
}
`;

async function renderer() {
  const canvas = new OffscreenCanvas(1, 1);
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    preserveDrawingBuffer: false,
  });
  if (!gl) throw new Error("Fusion GL unavailable");
  const shader = (type: number, source: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(s) ?? "Fusion shader");
    return s;
  };
  const program = gl.createProgram()!;
  gl.attachShader(
    program,
    shader(
      gl.VERTEX_SHADER,
      `#version 300 es
 void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0.,1.);}`,
    ),
  );
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(program) ?? "Fusion program");
  gl.useProgram(program);
  gl.disable(gl.DITHER);
  const locations = new Map<string, WebGLUniformLocation | null>();
  const loc = (name: string) => {
    if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
    return locations.get(name)!;
  };
  const limit = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) as number;
  const rects = new Float32Array(64),
    radii = new Float32Array(16);
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  const buffer = gl.createBuffer()!;
  const encoding = new OffscreenCanvas(1, 1);
  const encodingContext = encoding.getContext("2d", { willReadFrequently: true })!;
  let bytes = new Uint8ClampedArray(0);
  let recipe = "",
    maximum = 0,
    packCapacity = 0;
  let samples: Float32Array = new Float32Array(0),
    base: Float32Array = new Float32Array(0),
    slope: Float32Array = new Float32Array(0);
  return async (input: FusionFieldInput) => {
    if (gl.isContextLost()) throw new Error("Fusion GL lost");
    const { width, height, shape } = input,
      pixelWidth = Math.ceil(width * 2),
      pixelHeight = Math.ceil(height * 2),
      byteLength = pixelWidth * pixelHeight * 4;
    if (pixelWidth > limit || pixelHeight > limit)
      throw new Error("Fusion field exceeds GL limits");
    if (canvas.width < pixelWidth) canvas.width = 2 ** Math.ceil(Math.log2(pixelWidth));
    if (canvas.height < pixelHeight) canvas.height = 2 ** Math.ceil(Math.log2(pixelHeight));
    gl.viewport(0, 0, pixelWidth, pixelHeight);
    const bezel = shape.bezel ?? Math.min(10, Math.max(4, Math.min(width, height) * 0.12));
    const thickness = shape.thickness ?? Math.min(24, Math.max(8, Math.min(width, height) * 0.2));
    const key = `${bezel}:${thickness}`;
    if (key !== recipe) {
      const fitted = profile(bezel, thickness);
      samples = fitted.samples;
      base = profile(bezel, 0).samples;
      slope = profile(bezel, 1).samples.map((value, i) => value - base[i]!);
      const table = new Float32Array(128 * 4);
      for (let i = 0; i < 128; i++) table.set([samples[i]!, base[i]!, slope[i]!, 0], i * 4);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 128, 1, 0, gl.RGBA, gl.FLOAT, table);
      maximum = fitted.maximum;
      recipe = key;
    }
    input.shapes.forEach((s, i) => {
      rects.set([s.x, s.y, s.width, s.height], i * 4);
      radii[i] = s.radius;
    });
    gl.uniform4fv(loc("rects"), rects);
    gl.uniform1fv(loc("radii"), radii);
    gl.uniform2f(loc("size"), width, height);
    gl.uniform2f(loc("pixels"), pixelWidth, pixelHeight);
    gl.uniform1i(loc("count"), input.shapes.length);
    for (const [name, value] of Object.entries({
      blend: Math.min(
        ...input.shapes.map((s) => Math.min(s.width, s.height)),
        Math.max(0, input.spacing),
      ),
      bezel,
      thickness,
      maximum,
      distanceError: (Math.max(width, height) * input.shapes.length) / 1048576,
    }))
      gl.uniform1f(loc(name), value);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, buffer);
    if (byteLength > packCapacity) {
      packCapacity = 2 ** Math.ceil(Math.log2(byteLength));
      gl.bufferData(gl.PIXEL_PACK_BUFFER, packCapacity, gl.STREAM_READ);
    }
    gl.readPixels(0, 0, pixelWidth, pixelHeight, gl.RGBA, gl.UNSIGNED_BYTE, 0);
    if (gl.getError() !== gl.NO_ERROR) throw new Error("Fusion readback unavailable");
    const fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0)!;
    gl.flush();
    await new Promise<void>((resolve, reject) => {
      const poll = () => {
        const status = gl.clientWaitSync(fence, 0, 0);
        if (gl.isContextLost() || status === gl.WAIT_FAILED)
          reject(new Error("Fusion read failed"));
        else if (status === gl.TIMEOUT_EXPIRED) setTimeout(poll, 0);
        else resolve();
      };
      setTimeout(poll, 0);
    });
    gl.deleteSync(fence);
    if (bytes.length !== byteLength) bytes = new Uint8ClampedArray(byteLength);
    gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, bytes);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
    const sample = fusionGeometry(input.shapes, input.spacing);
    let corrected = 0;
    for (let i = 0; i < bytes.length; i += 4) {
      if (bytes[i + 2] !== 255) continue;
      corrected++;
      const column = (i / 4) % pixelWidth,
        row = Math.floor(i / 4 / pixelWidth);
      const point = sample(
        ((column + 0.5) * width) / pixelWidth - width / 2 + width / 2,
        ((row + 0.5) * height) / pixelHeight - height / 2 + height / 2,
      );
      let shift = 0;
      if (point.distance >= 0 && point.distance < bezel) {
        const at = (point.distance / bezel) * 127,
          lower = Math.floor(at),
          upper = Math.min(lower + 1, 127),
          t = point.thickness;
        const lo =
          t !== undefined && t !== thickness ? base[lower]! + slope[lower]! * t : samples[lower]!;
        const hi =
          t !== undefined && t !== thickness ? base[upper]! + slope[upper]! * t : samples[upper]!;
        shift = lo + (hi - lo) * (at - lower);
      }
      bytes[i] = Math.round(127.5 + ((-point.nx * shift) / maximum) * 127.5);
      bytes[i + 1] = Math.round(127.5 + ((-point.ny * shift) / maximum) * 127.5);
      bytes[i + 2] = 128;
    }
    if (encoding.width !== pixelWidth) encoding.width = pixelWidth;
    if (encoding.height !== pixelHeight) encoding.height = pixelHeight;
    encodingContext.putImageData(new ImageData(bytes, pixelWidth, pixelHeight), 0, 0);
    return {
      source: await encodeCanvas(encoding),
      scale: maximum * 2 * shape.level,
      corrected,
    };
  };
}

/** Only the field backend changes; DOM backdrop filtering and all visible
 * material layers retain their existing composition and full optical density. */
export function createGPUFusionFields() {
  let render: Awaited<ReturnType<typeof renderer>> | undefined;
  let unavailable = false;
  let queue = Promise.resolve();
  const active = new Set<number>();
  return {
    active: (plane: number) => active.has(plane),
    release(plane: number) {
      active.delete(plane);
    },
    prepare(input: FusionFieldInput, plane: number) {
      active.add(plane);
      const { shape } = input;
      const rows = fusionGeometry(input.shapes, input.spacing, input.grouped).materialRows;
      if (
        unavailable ||
        !input.unified ||
        input.grouped ||
        input.shapes.length > 16 ||
        !input.shapes.length ||
        input.shapes.some((s) => s.corners) ||
        !shape.appleMode ||
        shape.zoom !== 1 ||
        shape.saturation > 1 ||
        shape.anchorEdge
      )
        return Promise.resolve(undefined);
      const shade = uniformFusionShade(
        input.width,
        input.height,
        2,
        {
          mode: shape.appleMode,
          tint: shape.materialTint,
          profile: shape.materialProfile,
          size: shape.materialSize,
          clarity: shape.materialClarity,
          surface: shape.materialSurface,
        },
        rows,
      );
      if (!shade && shape.materialSurface !== "group") return Promise.resolve(undefined);
      const job = queue.then(async () => {
        if (!active.has(plane)) return undefined;
        try {
          render ??= await renderer();
          const { source, scale, corrected } = await render(input);
          const fields: FusionFields = {
            displacement: source,
            highlight: "",
            shade: await shade,
            scale,
            zoom: undefined,
            contour: undefined,
            silhouette: undefined,
            accelerated: true,
            precisionCorrections: corrected,
          };
          return fields;
        } catch {
          unavailable = true;
          return undefined;
        }
      });
      queue = job.then(() => undefined);
      return job;
    },
  };
}
