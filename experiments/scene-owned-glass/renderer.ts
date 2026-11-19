// Reuses retained MIT/LGPL optical work; see packages/glass/shaders/NOTICE.md.
import { shaders } from "../../packages/glass/src/shared-core/generated/shaders.js";
import { toneShader } from "../../packages/glass/src/material-tone.js";
import { GlassRenderer } from "../../packages/glass/src/shared-core/webgl.js";
import { ReusedBlur } from "./reused-blur.js";

const background = `#version 300 es
precision highp float;
uniform vec2 size;
uniform float time;
uniform float scroll;
uniform float density;
uniform sampler2D photo;
uniform vec2 photoSize;
uniform bool photographic;
in vec2 point;
out vec4 color;
void main() {
  vec2 p=point/density;
  p.y+=scroll;
  if(photographic) {
    vec2 content=vec2(size.x/density,size.y/density+700.);
    float scale=max(content.x/photoSize.x,content.y/photoSize.y)*1.12;
    vec2 crop=(photoSize*scale-content)*.5;
    vec2 offset=vec2(sin(time*.6)*70.,cos(time*.45)*30.);
    vec2 uv=(p+crop+offset)/(photoSize*scale);
    color=texture(photo,vec2(uv.x,1.-uv.y));
    return;
  }
  float bands=.5+.5*sin((p.x*.65+p.y+sin(time*.8)*45.)*.043);
  vec3 c=mix(vec3(.08,.28,.37),vec3(.96,.62,.29),smoothstep(.18,.82,bands));
  vec2 centre=vec2(size.x/density*.55+sin(time)*90.,240.+cos(time*.7)*80.);
  float disc=1.-smoothstep(84.,86.,length(p-centre));
  c=mix(c,vec3(.86,.29,.25),disc*.9);
  vec2 tile=mod(p+vec2(time*12.,0),vec2(48.,64.));
  float marks=(1.-smoothstep(2.,3.,tile.x))*(1.-smoothstep(24.,26.,tile.y));
  color=vec4(mix(c,vec3(.97,.94,.84),marks*.8),1);
}`;
const copy = `#version 300 es
precision highp float;
uniform sampler2D source;
in vec2 uv;
out vec4 color;
void main(){color=texture(source,uv);}`;

// Experimental full-support Gaussian pairing; the retained reference remains the default.
const pairedBlur = `#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D source;
uniform vec2 stepSize;
uniform float sigma;
in vec2 uv;
out vec4 color;
void main() {
  vec4 sum=texture(source,uv); float total=1.;
  float radius=min(72.,ceil(sigma*3.));
  for(int i=1;i<=71;i+=2) {
    float a=float(i), b=float(i+1);
    if(a>radius) continue;
    float wa=exp(-a*a/(2.*sigma*sigma));
    float wb=b<=radius ? exp(-b*b/(2.*sigma*sigma)) : 0.;
    float weight=wa+wb;
    vec2 offset=(a+wb/weight)*stepSize;
    sum+=(texture(source,uv-offset)+texture(source,uv+offset))*weight;
    total+=2.*weight;
  }
  color=sum/total;
}`;

export type Mode = "resident" | "upload";

export type CompositionLayer =
  // Omit revision for mutable sources whose caller cannot promise invalidation.
  | { kind: "paint"; source: HTMLCanvasElement; revision?: number }
  | { kind: "glass"; record: Float32Array };
export type CompositionFrame = {
  layers: readonly CompositionLayer[];
  blur: number;
  sampling: "ordered" | "shared";
  work?: "full" | "local-blur" | "local" | "dirty" | "cached" | "bounded";
};

export class SceneRenderer {
  readonly canvas = document.createElement("canvas");
  readonly source = document.createElement("canvas");
  private gl: WebGL2RenderingContext;
  private programs: WebGLProgram[] = [];
  private textures: (WebGLTexture | null)[] = [];
  private frames: (WebGLFramebuffer | null)[] = [];
  private vao: WebGLVertexArrayObject | null = null;
  private buffer: WebGLBuffer | null = null;
  private photoTexture: WebGLTexture | null = null;
  private revision = -1;
  private paints: {
    texture: WebGLTexture;
    source: HTMLCanvasElement;
    revision: number | undefined;
    width: number;
    height: number;
  }[] = [];
  private retained?: {
    layers: CompositionLayer[];
    blur: number;
    last: Float32Array;
    work: CompositionFrame["work"];
    bounds: [number, number, number, number] | undefined;
  };
  private legacy?: GlassRenderer;
  private reusedBlur?: ReusedBlur;
  private stopped = false;
  private contextControl: WEBGL_lose_context | null;
  readonly rendererInfo: string;

  constructor(
    readonly mode: Mode,
    readonly width: number,
    readonly height: number,
    readonly dpr: number,
    readonly dark: boolean,
    photo?: HTMLImageElement,
    private readonly composition = false,
    private readonly convolution: "reference" | "paired" | "reused" | "direct" = "reference",
  ) {
    this.canvas.width = this.source.width = Math.round(width * dpr);
    this.canvas.height = this.source.height = Math.round(height * dpr);
    const gl = (mode === "resident" ? this.canvas : this.source).getContext("webgl2", {
      antialias: false,
    });
    if (!gl) throw new Error("WebGL2 unavailable: this experiment requires an owned GPU scene");
    this.gl = gl;
    this.contextControl = gl.getExtension("WEBGL_lose_context");
    const debug = gl.getExtension("WEBGL_debug_renderer_info");
    this.rendererInfo = String(
      gl.getParameter(debug ? debug.UNMASKED_RENDERER_WEBGL : gl.RENDERER),
    );
    try {
      if (
        this.canvas.width > gl.getParameter(gl.MAX_TEXTURE_SIZE) ||
        this.canvas.height > gl.getParameter(gl.MAX_TEXTURE_SIZE)
      )
        throw new Error("Scene exceeds the device texture limit");
      for (const fragment of mode === "upload"
        ? [background]
        : [background, convolution === "paired" ? pairedBlur : shaders[1]!, shaders[2]!, copy]) {
        const program = gl.createProgram();
        if (!program) throw new Error("Program allocation failed");
        this.programs.push(program);
        for (const [kind, code] of [
          [gl.VERTEX_SHADER, shaders[0]!],
          [gl.FRAGMENT_SHADER, fragment],
        ] as const) {
          const shader = gl.createShader(kind);
          if (!shader) throw new Error("Shader allocation failed");
          gl.shaderSource(shader, code.replace("/* material-tone */", toneShader("glsl")));
          gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(error ?? "Shader compilation failed");
          }
          gl.attachShader(program, shader);
          gl.deleteShader(shader);
        }
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
          throw new Error(gl.getProgramInfoLog(program) ?? "Program link failed");
        gl.useProgram(program);
        gl.uniform2f(gl.getUniformLocation(program, "size"), this.canvas.width, this.canvas.height);
        gl.uniform1i(gl.getUniformLocation(program, "source"), 0);
        gl.uniform1i(gl.getUniformLocation(program, "full"), 1);
        gl.uniform1f(gl.getUniformLocation(program, "density"), dpr);
        gl.uniform1i(gl.getUniformLocation(program, "photo"), 1);
        gl.uniform1i(gl.getUniformLocation(program, "photographic"), Number(Boolean(photo)));
        if (photo)
          gl.uniform2f(
            gl.getUniformLocation(program, "photoSize"),
            photo.naturalWidth,
            photo.naturalHeight,
          );
        gl.uniform1f(gl.getUniformLocation(program, "sigma"), 15.3 * dpr);
        gl.uniform1i(gl.getUniformLocation(program, "paintRim"), 1);
        gl.uniform4fv(gl.getUniformLocation(program, "material"), [27, Number(dark), 0, dpr]);
      }
      if (photo) {
        this.photoTexture = gl.createTexture();
        if (!this.photoTexture) throw new Error("Photo texture allocation failed");
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.photoTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, photo);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.activeTexture(gl.TEXTURE0);
      }
      if (mode === "upload") {
        this.legacy = new GlassRenderer(this.canvas, new Float32Array([27, Number(dark), 0, dpr]));
      } else {
        this.vao = gl.createVertexArray();
        this.buffer = gl.createBuffer();
        if (!this.vao || !this.buffer) throw new Error("Lens allocation failed");
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, 32 * 32, gl.DYNAMIC_DRAW);
        for (let index = 0; index < 2; index++) {
          gl.enableVertexAttribArray(index);
          gl.vertexAttribPointer(index, 4, gl.FLOAT, false, 32, index * 16);
          gl.vertexAttribDivisor(index, 1);
        }
        for (let index = 0; index < (composition ? 7 : 3); index++) {
          this.textures.push(null);
          this.frames.push(null);
          if (index !== 1 || !composition || convolution !== "direct") this.allocateTarget(index);
        }
        if (convolution === "reused" || convolution === "direct")
          this.reusedBlur = new ReusedBlur(
            gl,
            this.canvas.width,
            this.canvas.height,
            convolution === "direct",
          );
      }
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    } catch (error) {
      this.dispose();
      throw error;
    }
  }

  render(
    time: number,
    scroll: number,
    lenses: Float32Array,
    revision: number,
    composition?: CompositionFrame,
  ) {
    if (this.stopped || this.gl.isContextLost()) return;
    const gl = this.gl;
    gl.disable(gl.SCISSOR_TEST);
    gl.bindVertexArray(this.vao);
    if (!this.legacy) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, lenses);
    }
    // Recreate the ordinary intermediate only when leaving direct composition.
    const missingHorizontal = !this.legacy && !composition && !this.textures[1];
    if (missingHorizontal) this.allocateTarget(1);
    const refresh = this.revision !== revision || missingHorizontal;
    if (refresh) {
      this.retained = undefined;
      gl.disable(gl.BLEND);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.mode === "resident" ? this.frames[0]! : null);
      const scene = this.programs[0]!;
      gl.useProgram(scene);
      gl.uniform1f(gl.getUniformLocation(scene, "time"), time);
      gl.uniform1f(gl.getUniformLocation(scene, "scroll"), scroll);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    if (composition) {
      if (!this.composition || this.legacy)
        throw new Error("Ordered composition requires its resident targets");
      this.compose(composition);
      this.revision = revision;
      return;
    }
    this.retained = undefined;
    this.trimPaints(0);
    if (this.legacy) {
      this.legacy.set_lenses(lenses);
      this.legacy.render_canvas(this.source, revision);
    } else {
      gl.disable(gl.BLEND);
      if (refresh) {
        const blur = this.programs[1]!;
        gl.useProgram(blur);
        for (let index = 0; index < 2; index++) {
          // Direct packing is a composition experiment; preserve the ordinary path's uniforms.
          if (this.reusedBlur && this.convolution !== "direct") {
            this.reusedBlur.render(
              this.textures[index]!,
              this.frames[index + 1]!,
              15.3 * this.dpr,
              index,
            );
            continue;
          }
          gl.bindFramebuffer(gl.FRAMEBUFFER, this.frames[index + 1]!);
          gl.bindTexture(gl.TEXTURE_2D, this.textures[index]!);
          gl.uniform2f(
            gl.getUniformLocation(blur, "stepSize"),
            index === 0 ? 1 / this.canvas.width : 0,
            index === 1 ? 1 / this.canvas.height : 0,
          );
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.useProgram(this.programs[3]!);
      gl.bindTexture(gl.TEXTURE_2D, this.textures[0]!);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      const glass = this.programs[2]!;
      gl.useProgram(glass);
      gl.uniform1i(gl.getUniformLocation(glass, "full"), 0);
      gl.bindTexture(gl.TEXTURE_2D, this.textures[2]!);
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, lenses.length / 8);
      gl.flush();
    }
    this.revision = revision;
  }

  private compose(frame: CompositionFrame) {
    const gl = this.gl;
    if (this.convolution === "direct" && this.textures[1]) {
      gl.deleteFramebuffer(this.frames[1]!);
      gl.deleteTexture(this.textures[1]);
      this.frames[1] = this.textures[1] = null;
    }
    const work = frame.work ?? "bounded";
    const cachePaint = work === "cached" || work === "bounded";
    const inPlace = work === "local" || work === "dirty" || cachePaint;
    this.trimPaints(cachePaint ? frame.layers.filter((layer) => layer.kind === "paint").length : 0);
    const prefix = frame.layers.slice(0, -1);
    const cacheable =
      frame.sampling === "ordered" &&
      frame.layers.at(-1)?.kind === "glass" &&
      prefix.every((layer) => layer.kind === "glass" || layer.revision !== undefined);
    const retained = this.retained;
    const reuse =
      cacheable &&
      retained?.blur === frame.blur &&
      retained.layers.length === prefix.length &&
      prefix.every((layer, index) => {
        const previous = retained.layers[index]!;
        return layer.kind === "paint"
          ? previous.kind === "paint" &&
              layer.source === previous.source &&
              layer.revision === previous.revision
          : previous.kind === "glass" &&
              layer.record.length === previous.record.length &&
              layer.record.every((value, i) => value === previous.record[i]);
      });
    let damage: [number, number, number, number] | undefined;
    if (
      (work === "dirty" || cachePaint) &&
      !reuse &&
      cacheable &&
      retained?.work === work &&
      retained.layers.length === prefix.length &&
      prefix.every((layer, i) => {
        const previous = retained.layers[i]!;
        return layer.kind === "glass"
          ? previous.kind === "glass"
          : previous.kind === "paint" &&
              layer.source === previous.source &&
              layer.revision === previous.revision;
      })
    ) {
      // Reconstruct all old/new glass and every texel its convolution may read.
      // Outside this region there was no glass, and the unchanged paints remain valid.
      const bounds = [...frame.layers, ...retained.layers].flatMap((layer) =>
        layer.kind === "glass" ? [this.sampleBounds(layer.record)] : [],
      );
      bounds.push(this.sampleBounds(retained.last));
      const halo = Math.min(72, Math.ceil(frame.blur * this.dpr * 3));
      damage = [
        Math.min(...bounds.map((r) => r[0])) - halo,
        Math.min(...bounds.map((r) => r[1])) - halo,
        Math.max(...bounds.map((r) => r[2])) + halo,
        Math.max(...bounds.map((r) => r[3])) + halo,
      ];
    }
    this.retained = undefined;
    let current = 0,
      target = 3,
      sharedReady = false;
    let finalBounds: [number, number, number, number] | undefined;
    const copy = (source: number, destination: number | null) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, destination === null ? null : this.frames[destination]!);
      gl.useProgram(this.programs[3]!);
      gl.bindTexture(gl.TEXTURE_2D, this.textures[source]!);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    if (inPlace) {
      gl.disable(gl.BLEND);
      if (damage) this.scissor(damage);
      copy(reuse ? 6 : 0, 3);
      gl.disable(gl.SCISSOR_TEST);
      current = target = 3;
    }
    let paintIndex = 0;
    for (const [index, layer] of frame.layers.entries()) {
      const slot = layer.kind === "paint" ? paintIndex++ : -1;
      if (reuse && index < prefix.length) continue;
      gl.disable(gl.BLEND);
      const last = index === prefix.length;
      if (last && cacheable) {
        // Target 6 is mutually exclusive: ordered-prefix cache or shared negative control.
        if (!reuse) copy(current, 6);
        if (!inPlace) current = 6;
      }
      const localBlur = work !== "full" && (!(last && cacheable) || work === "bounded");
      const needed =
        layer.kind === "glass" && localBlur ? this.sampleBounds(layer.record) : undefined;
      const reuseBlur =
        reuse &&
        last &&
        (!retained.bounds ||
          (needed &&
            needed[0] >= retained.bounds[0] &&
            needed[1] >= retained.bounds[1] &&
            needed[2] <= retained.bounds[2] &&
            needed[3] <= retained.bounds[3]));
      if (last && cacheable) finalBounds = reuseBlur ? retained.bounds : needed;
      if (layer.kind === "glass" && !reuseBlur) {
        // The negative control deliberately freezes the backdrop before the first glass layer.
        if (frame.sampling === "shared" && !sharedReady) {
          copy(current, 6);
          sharedReady = true;
        }
        const blur = this.programs[1]!;
        gl.useProgram(blur);
        gl.uniform1f(gl.getUniformLocation(blur, "sigma"), frame.blur * this.dpr);
        const bounds = needed;
        if (bounds && last && cacheable) {
          // Keep at least 16 CSS px of motion slack, or one convolution radius. Outside it, recompute
          // from the retained prefix instead of sampling stale intermediate texels.
          const margin = Math.max(
            16 * this.dpr,
            Math.min(72, Math.ceil(frame.blur * this.dpr * 3)),
          );
          bounds[0] -= margin;
          bounds[1] -= margin;
          bounds[2] += margin;
          bounds[3] += margin;
          finalBounds = bounds;
        }
        if (this.convolution === "direct") {
          this.reusedBlur!.renderPair(
            this.textures[frame.sampling === "shared" ? 6 : current]!,
            this.frames[2]!,
            frame.blur * this.dpr,
            bounds,
          );
        } else {
          for (let axis = 0; axis < 2; axis++) {
            if (this.reusedBlur) {
              const halo = axis === 0 ? Math.min(72, Math.ceil(frame.blur * this.dpr * 3)) : 0;
              this.reusedBlur.render(
                this.textures[axis === 0 ? (frame.sampling === "shared" ? 6 : current) : 1]!,
                this.frames[axis + 1]!,
                frame.blur * this.dpr,
                axis,
                bounds ? [bounds[0], bounds[1] - halo, bounds[2], bounds[3] + halo] : undefined,
              );
              continue;
            }
            if (bounds) {
              // The vertical pass also reads neighbouring rows of the horizontal intermediate.
              const halo = axis === 0 ? Math.min(72, Math.ceil(frame.blur * this.dpr * 3)) : 0;
              this.scissor([bounds[0], bounds[1] - halo, bounds[2], bounds[3] + halo]);
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.frames[axis + 1]!);
            gl.bindTexture(
              gl.TEXTURE_2D,
              this.textures[axis === 0 ? (frame.sampling === "shared" ? 6 : current) : 1]!,
            );
            gl.uniform2f(
              gl.getUniformLocation(blur, "stepSize"),
              axis === 0 ? 1 / this.canvas.width : 0,
              axis === 1 ? 1 / this.canvas.height : 0,
            );
            gl.drawArrays(gl.TRIANGLES, 0, 6);
          }
        }
        gl.disable(gl.SCISSOR_TEST);
      }
      if (!inPlace) copy(current, target);
      else gl.bindFramebuffer(gl.FRAMEBUFFER, this.frames[target]!);
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      if (damage) this.scissor(damage);
      if (layer.kind === "paint") {
        gl.useProgram(this.programs[3]!);
        let paint = cachePaint ? this.paints[slot] : undefined;
        if (cachePaint && !paint) {
          const texture = slot === 0 ? this.textures[5]! : gl.createTexture();
          if (!texture) throw new Error("Paint texture allocation failed");
          paint = { texture, source: layer.source, revision: undefined, width: 0, height: 0 };
          this.paints.push(paint);
          if (slot !== 0) {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(
              gl.TEXTURE_2D,
              0,
              gl.RGBA8,
              this.canvas.width,
              this.canvas.height,
              0,
              gl.RGBA,
              gl.UNSIGNED_BYTE,
              null,
            );
          }
        }
        gl.bindTexture(gl.TEXTURE_2D, paint?.texture ?? this.textures[5]!);
        if (
          !paint ||
          layer.revision === undefined ||
          paint.source !== layer.source ||
          paint.revision !== layer.revision ||
          paint.width !== layer.source.width ||
          paint.height !== layer.source.height
        ) {
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, layer.source);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
          if (paint) {
            paint.source = layer.source;
            paint.revision = layer.revision;
            paint.width = layer.source.width;
            paint.height = layer.source.height;
          }
        }
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      } else {
        const glass = this.programs[2]!;
        gl.useProgram(glass);
        gl.uniform1i(gl.getUniformLocation(glass, "full"), 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, layer.record);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[2]!);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, layer.record.length / 8);
      }
      gl.disable(gl.SCISSOR_TEST);
      current = target;
      if (!inPlace) target = target === 3 ? 4 : 3;
    }
    gl.disable(gl.BLEND);
    copy(current, null);
    gl.flush();
    const last = frame.layers.at(-1);
    if (cacheable && last?.kind === "glass")
      this.retained = {
        blur: frame.blur,
        last: last.record.slice(),
        work,
        bounds: finalBounds,
        layers: reuse
          ? retained.layers
          : prefix.map((layer) =>
              layer.kind === "paint" ? { ...layer } : { ...layer, record: layer.record.slice() },
            ),
      };
  }

  private allocateTarget(index: number) {
    const gl = this.gl;
    const texture = gl.createTexture();
    if (!texture) throw new Error("Texture allocation failed");
    this.textures[index] = texture;
    const frame = gl.createFramebuffer();
    if (!frame) throw new Error("Framebuffer allocation failed");
    this.frames[index] = frame;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    for (const [key, value] of [
      [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
      [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
      [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
      [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
    ] as const)
      gl.texParameteri(gl.TEXTURE_2D, key, value);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA8,
      this.canvas.width,
      this.canvas.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, frame);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
      throw new Error("Framebuffer incomplete");
  }

  private trimPaints(count: number) {
    for (const paint of this.paints.splice(count))
      if (paint.texture !== this.textures[5]) this.gl.deleteTexture(paint.texture);
  }

  private sampleBounds(record: Float32Array): [number, number, number, number] {
    let left = this.canvas.width,
      top = this.canvas.height,
      right = 0,
      bottom = 0;
    for (let i = 0; i < record.length; i += 8) {
      // tan(incident - asin(sin(incident) / 1.5)) <= sqrt(1.5² - 1).
      // Include chromatic displacement and bilinear sampling, including outward rays.
      const halo =
        Math.sqrt(1.25) *
          (Math.abs(record[i + 5]!) + Math.abs(record[i + 6]!)) *
          Math.abs(record[i + 7]!) *
          1.02 +
        1;
      left = Math.min(left, record[i]! - halo);
      top = Math.min(top, record[i + 1]! - halo);
      right = Math.max(right, record[i]! + record[i + 2]! + halo);
      bottom = Math.max(bottom, record[i + 1]! + record[i + 3]! + halo);
    }
    return [left, top, right, bottom];
  }

  private scissor(bounds: readonly [number, number, number, number]) {
    const gl = this.gl;
    const x0 = Math.max(0, Math.min(this.canvas.width, Math.floor(bounds[0])));
    const y0 = Math.max(0, Math.min(this.canvas.height, Math.floor(bounds[1])));
    const x1 = Math.max(x0, Math.min(this.canvas.width, Math.ceil(bounds[2])));
    const y1 = Math.max(y0, Math.min(this.canvas.height, Math.ceil(bounds[3])));
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(x0, this.canvas.height - y1, x1 - x0, y1 - y0);
  }

  lose() {
    this.contextControl?.loseContext();
  }
  restore() {
    this.contextControl?.restoreContext();
  }

  dispose() {
    if (this.stopped) return;
    this.stopped = true;
    this.retained = undefined;
    this.legacy?.free();
    this.reusedBlur?.dispose();
    this.trimPaints(0);
    const gl = this.gl;
    gl.deleteTexture(this.photoTexture);
    for (const texture of this.textures) gl.deleteTexture(texture);
    for (const frame of this.frames) gl.deleteFramebuffer(frame);
    for (const program of this.programs) gl.deleteProgram(program);
    gl.deleteBuffer(this.buffer);
    gl.deleteVertexArray(this.vao);
    if (this.legacy)
      this.canvas.getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext();
    this.contextControl?.loseContext();
    this.canvas.remove();
    this.source.remove();
    this.canvas.width = this.canvas.height = this.source.width = this.source.height = 1;
  }
}
