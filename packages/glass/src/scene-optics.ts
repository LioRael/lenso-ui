// Retains the optical model in refraction.ts and material-tone.ts; see shaders/NOTICE.md.
import { ReusedBlur } from "./scene-blur.js";
import { toneParameters, toneShader } from "./material-tone.js";
import type { SceneLens } from "./scene-lens.js";
import { profile } from "./optical-fields.js";

type Bounds = readonly [left: number, top: number, right: number, bottom: number];

const vertex = `#version 300 es
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0,1);}`;
const header = `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D source;
out vec4 color;
vec4 pixel(sampler2D t,ivec2 p){return texelFetch(t,clamp(p,ivec2(0),textureSize(t,0)-1),0);}
vec3 quantize(vec3 c){return floor(clamp(c,0.,1.)*255.+.5)/255.;}
`;
const rays = `${header}
uniform sampler2D field;
uniform ivec2 sourceOrigin;
uniform vec3 scales;
uniform bool morph;
uniform vec2 surfaceSize, resolution;
uniform float radius, margin, density, bezel, maximum;
uniform float samples[128];
void main(){
 ivec2 p=ivec2(gl_FragCoord.xy);vec4 f=pixel(field,p);
 if(morph){
  vec2 local=vec2(gl_FragCoord.x,resolution.y-gl_FragCoord.y)/density-margin-surfaceSize*.5;
  vec2 q=abs(local)-(surfaceSize*.5-radius),outside=max(q,vec2(0));
  float radial=length(outside),distance=radius-radial-min(max(q.x,q.y),0.);
  vec2 n=radial>0.?outside/radial*sign(local):q.x>q.y?vec2(sign(local.x),0):vec2(0,sign(local.y));
  float shift=0.;
  if(distance>=0.&&distance<bezel){
   float at=distance/bezel*127.;int lo=int(floor(at)),hi=min(lo+1,127);
   shift=mix(samples[lo],samples[hi],at-float(lo));
  }
  f=vec4(clamp(floor(vec2(127.5)-n*shift/maximum*127.5+.5),0.,255.)/255.,0,1);
 }
 vec2 shift=(f.rg/max(f.a,.00001)-.5)*vec2(1,-1);
 ivec2 sampleAt=p+sourceOrigin;
 vec4 r=pixel(source,sampleAt+ivec2(floor(shift*scales.r+vec2(.5))));
 vec4 g=pixel(source,sampleAt+ivec2(floor(shift*scales.g+vec2(.5))));
 vec4 b=pixel(source,sampleAt+ivec2(floor(shift*scales.b+vec2(.5))));
 color=vec4(r.r,g.g,b.b,1);
}`;
const soften = `${header}
void main(){ivec2 p=ivec2(gl_FragCoord.xy);vec4 sum=vec4(0);
 for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++)sum+=round(pixel(source,p+ivec2(x,y))*255.);
 color=floor(sum/9.+.5)/255.;}`;
const material = `${header}
uniform sampler2D bent;
uniform sampler2D shade;
uniform sampler2D contour;
uniform float softness;
uniform vec3 tone;
uniform vec3 linearTone;
uniform bool linearSurface;
uniform bool hasShade;
uniform bool hasContour;
uniform bool morph;
uniform vec4 surface;
uniform vec2 resolution;
uniform float density;
${toneShader("glsl")}
void main(){
 ivec2 p=ivec2(gl_FragCoord.xy);
 vec3 c=quantize(mix(pixel(bent,p).rgb,pixel(source,p).rgb,softness));
 if(hasContour)c=max(c+pixel(contour,p).rgb-1.,0.);
 if(linearSurface){
   c=quantize((c-.5)*linearTone.x+.5);c=quantize(c*linearTone.y);
   float y=dot(c,vec3(.2126,.7152,.0722));c=quantize(vec3(y)+(c-vec3(y))*linearTone.z);
 }else c=quantize(calibratedTone(c,tone.x,tone.y,tone.z));
 if(hasShade)c=floor(clamp(c*255.+round(pixel(shade,p).rgb*255.)-127.5,0.,255.))/255.;
 float coverage=1.;
 if(morph){
  vec2 local=vec2(gl_FragCoord.x,resolution.y-gl_FragCoord.y)/density-surface.w-surface.xy*.5;
  vec2 q=abs(local)-(surface.xy*.5-surface.z);
  float distance=surface.z-length(max(q,vec2(0)))-min(max(q.x,q.y),0.);
  coverage=clamp(.5+distance*density,0.,1.);
 }
 color=vec4(c*coverage,coverage);
}`;

/** A retained optical plane over explicit pixels, not a DOM capture mechanism. */
export class SceneOptics {
  readonly canvas = document.createElement("canvas");
  private gl: WebGL2RenderingContext;
  private programs: WebGLProgram[] = [];
  private textures: WebGLTexture[] = [];
  private frames: WebGLFramebuffer[] = [];
  private blur?: ReusedBlur;
  private paintKey = "";
  private mapsKey = "";
  private readonly softSources = new Map<number, { slot: number; bounds: Bounds }>();
  private stopped = false;

  constructor(
    readonly width: number,
    readonly height: number,
    transparent = false,
    readonly photo?: { width: number; height: number },
  ) {
    this.canvas.width = width;
    this.canvas.height = height;
    const gl = this.canvas.getContext("webgl2", { antialias: false, alpha: transparent });
    if (!gl) throw new Error("Owned glass requires WebGL2");
    this.gl = gl;
    try {
      if (
        this.textureBytes > 64 * 1024 * 1024 ||
        Math.max(width, height, photo?.width ?? 0, photo?.height ?? 0) >
          gl.getParameter(gl.MAX_TEXTURE_SIZE)
      )
        throw new Error("Owned glass exceeds its resource budget");
      for (const fragment of [rays, soften, material]) {
        const program = gl.createProgram();
        if (!program) throw new Error("Owned glass program allocation failed");
        this.programs.push(program);
        for (const [kind, code] of [
          [gl.VERTEX_SHADER, vertex],
          [gl.FRAGMENT_SHADER, fragment],
        ] as const) {
          const shader = gl.createShader(kind);
          if (!shader) throw new Error("Owned glass shader allocation failed");
          gl.shaderSource(shader, code);
          gl.compileShader(shader);
          gl.attachShader(program, shader);
          gl.deleteShader(shader);
        }
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
          throw new Error(gl.getProgramInfoLog(program) ?? "Owned glass shader failed");
      }
      // Raw paint, blurred paint, bent paint, two softness targets and three optical maps.
      for (let index = 0; index < (photo ? 9 : 8); index++) {
        const size = photo && (index < 2 || index === 8) ? photo : this;
        const texture = gl.createTexture(),
          frame = gl.createFramebuffer();
        if (!texture || !frame) throw new Error("Owned glass allocation failed");
        this.textures.push(texture);
        this.frames.push(frame);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA8,
          size.width,
          size.height,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          null,
        );
        gl.bindFramebuffer(gl.FRAMEBUFFER, frame);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
          throw new Error("Owned glass framebuffer incomplete");
      }
      this.blur = new ReusedBlur(gl, photo?.width ?? width, photo?.height ?? height, true, 96);
    } catch (error) {
      this.dispose();
      throw error;
    }
  }

  get textureBytes() {
    const { width, height, photo } = this;
    // Scene inputs: raw photo, two blur radii, and the packed blur scratch target.
    const blurWidth = photo?.width ?? width;
    const blurHeight = photo?.height ?? height;
    const packedPixels = Math.ceil(blurWidth / 4) * 4 * blurHeight;
    return (
      4 *
      ((photo ? 6 * width * height + 3 * photo.width * photo.height : 8 * width * height) +
        packedPixels)
    );
  }

  async prepare(lens: SceneLens, margin: number, dpr: number) {
    const nodes = ["field", "material-shade", "contour-paint"].map((name) =>
      lens.filter.querySelector(`[result="${name}"]`),
    );
    const key = nodes.map((node) => node?.outerHTML ?? "").join("|");
    if (key === this.mapsKey) return;
    const images = await Promise.all(
      nodes.map(async (node) => {
        if (!node) return;
        const image = new Image();
        image.src = node.getAttribute("href")!;
        await image.decode();
        return image;
      }),
    );
    if (this.stopped) return;
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    const context = canvas.getContext("2d")!;
    try {
      for (const [index, image] of images.entries()) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        const node = nodes[index];
        if (image && node)
          context.drawImage(
            image,
            (margin + Number(node.getAttribute("x"))) * dpr,
            (margin + Number(node.getAttribute("y"))) * dpr,
            Number(node.getAttribute("width")) * dpr,
            Number(node.getAttribute("height")) * dpr,
          );
        this.upload(index + 5, canvas);
      }
      this.mapsKey = key;
    } finally {
      canvas.width = canvas.height = 1;
    }
  }

  private upload(index: number, source: HTMLCanvasElement) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[index]!);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  }

  uploadPhoto(paint: HTMLCanvasElement) {
    this.upload(0, paint);
    this.softSources.clear();
  }

  private softenPhoto(sigma: number, bounds: Bounds) {
    const cache = this.softSources;
    const paint = (slot: number, rect: Bounds) =>
      this.blur!.renderPair(this.textures[0]!, this.frames[slot]!, sigma, rect);
    const cached = cache.get(sigma);
    if (cached) {
      const [left, top, right, bottom] = cached.bounds;
      const union: Bounds = [
        Math.min(left, bounds[0]),
        Math.min(top, bounds[1]),
        Math.max(right, bounds[2]),
        Math.max(bottom, bounds[3]),
      ];
      // Extend the covered rectangle without rewriting pixels already blurred at this radius.
      if (union[0] < left) paint(cached.slot, [union[0], union[1], left, union[3]]);
      if (union[2] > right) paint(cached.slot, [right, union[1], union[2], union[3]]);
      if (union[1] < top) paint(cached.slot, [left, union[1], right, top]);
      if (union[3] > bottom) paint(cached.slot, [left, bottom, right, union[3]]);
      cached.bounds = union;
      return cached.slot;
    }
    let slot = cache.size === 1 ? 8 : 1;
    if (cache.size === 2) {
      const [oldest, previous] = cache.entries().next().value!;
      cache.delete(oldest);
      slot = previous.slot;
    }
    paint(slot, bounds);
    cache.set(sigma, { slot, bounds });
    return slot;
  }

  render(
    paint: HTMLCanvasElement | undefined,
    key: string,
    lens: SceneLens,
    dpr: number,
    morph?: { width: number; height: number; radius: number; margin: number },
    sourceOrigin?: { x: number; y: number; bounds: Bounds },
  ) {
    const gl = this.gl;
    if (this.stopped || gl.isContextLost()) throw new Error("Owned glass context lost");
    gl.disable(gl.BLEND);
    gl.disable(gl.SCISSOR_TEST);
    const sigma = (lens.shape.sourceBlur ?? 3) * dpr;
    if (sigma <= 0 || Math.ceil(sigma * 3) > 96)
      throw new Error("Owned glass convolution unsupported");
    let blurred = 1;
    if (sourceOrigin) {
      blurred = this.softenPhoto(sigma, sourceOrigin.bounds);
    } else if (paint && this.paintKey !== key) {
      this.upload(0, paint);
      this.blur!.renderPair(this.textures[0]!, this.frames[1]!, sigma);
      this.paintKey = key;
    }
    gl.viewport(0, 0, this.width, this.height);
    const bind = (program: WebGLProgram, name: string, index: number, unit: number) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, this.textures[index]!);
      gl.uniform1i(gl.getUniformLocation(program, name), unit);
    };
    const ray = this.programs[0]!;
    gl.useProgram(ray);
    bind(ray, "source", blurred, 0);
    bind(ray, "field", 5, 1);
    gl.uniform2i(
      gl.getUniformLocation(ray, "sourceOrigin"),
      sourceOrigin?.x ?? 0,
      sourceOrigin?.y ?? 0,
    );
    gl.uniform1i(gl.getUniformLocation(ray, "morph"), Number(!!morph));
    if (morph) {
      const bezel =
        lens.shape.bezel ?? Math.min(10, Math.max(4, Math.min(morph.width, morph.height) * 0.12));
      const thickness =
        lens.shape.thickness ??
        Math.min(24, Math.max(8, Math.min(morph.width, morph.height) * 0.2));
      const fitted = profile(bezel, thickness);
      gl.uniform2f(gl.getUniformLocation(ray, "surfaceSize"), morph.width, morph.height);
      gl.uniform2f(gl.getUniformLocation(ray, "resolution"), this.width, this.height);
      gl.uniform1f(gl.getUniformLocation(ray, "radius"), morph.radius);
      gl.uniform1f(gl.getUniformLocation(ray, "margin"), morph.margin);
      gl.uniform1f(gl.getUniformLocation(ray, "density"), dpr);
      gl.uniform1f(gl.getUniformLocation(ray, "bezel"), bezel);
      gl.uniform1f(gl.getUniformLocation(ray, "maximum"), fitted.maximum);
      gl.uniform1fv(gl.getUniformLocation(ray, "samples[0]"), fitted.samples);
    }
    const scale = lens.scale * dpr,
      spread = lens.shape.dispersion * 0.1;
    gl.uniform3f(
      gl.getUniformLocation(ray, "scales"),
      scale * (1 + spread),
      scale,
      scale * (1 - spread),
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frames[2]!);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    const softness =
      lens.shape.materialProfile === "clear" ? 0 : 1 - (lens.shape.materialClarity ?? 0);
    if (softness > 0) {
      const blur = this.programs[1]!;
      gl.useProgram(blur);
      for (const [from, to] of [
        [2, 3],
        [3, 4],
        [4, 3],
      ]) {
        bind(blur, "source", from!, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frames[to!]!);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    }
    const face = this.programs[2]!,
      shape = lens.shape;
    gl.useProgram(face);
    gl.uniform1i(gl.getUniformLocation(face, "morph"), Number(!!morph));
    if (morph) {
      gl.uniform4f(
        gl.getUniformLocation(face, "surface"),
        morph.width,
        morph.height,
        morph.radius,
        morph.margin,
      );
      gl.uniform2f(gl.getUniformLocation(face, "resolution"), this.width, this.height);
      gl.uniform1f(gl.getUniformLocation(face, "density"), dpr);
    }
    bind(face, "source", softness > 0 ? 3 : 2, 0);
    bind(face, "bent", 2, 1);
    bind(face, "shade", 6, 2);
    bind(face, "contour", 7, 3);
    const tone = {
      mode: shape.appleMode!,
      size:
        shape.materialSize ??
        (shape.materialProfile === "medium" || shape.materialProfile === "large" ? 1 : 0),
      clarity: shape.materialProfile === "clear" ? 1 : (shape.materialClarity ?? 0),
    };
    const p = toneParameters(tone);
    gl.uniform3f(
      gl.getUniformLocation(face, "tone"),
      tone.size,
      tone.clarity,
      Number(tone.mode === "dark"),
    );
    gl.uniform3f(gl.getUniformLocation(face, "linearTone"), p.contrast, p.brightness, p.saturation);
    gl.uniform1f(gl.getUniformLocation(face, "softness"), softness);
    gl.uniform1i(
      gl.getUniformLocation(face, "linearSurface"),
      Number(shape.materialSurface === "group" || tone.mode === "light"),
    );
    gl.uniform1i(
      gl.getUniformLocation(face, "hasShade"),
      Number(
        !shape.materialForeground &&
          shape.materialSurface !== "group" &&
          !!lens.filter.querySelector('[result="material-shade"]'),
      ),
    );
    gl.uniform1i(
      gl.getUniformLocation(face, "hasContour"),
      Number(!!lens.filter.querySelector('[result="contour-paint"]')),
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.activeTexture(gl.TEXTURE0);
    gl.flush();
  }

  dispose() {
    if (this.stopped) return;
    this.stopped = true;
    this.blur?.dispose();
    for (const texture of this.textures) this.gl.deleteTexture(texture);
    for (const frame of this.frames) this.gl.deleteFramebuffer(frame);
    for (const program of this.programs) this.gl.deleteProgram(program);
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
    this.canvas.remove();
    this.canvas.width = this.canvas.height = 1;
  }
}
