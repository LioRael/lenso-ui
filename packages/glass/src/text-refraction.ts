// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Adapted from Glisse's control-lens maps and ink model; continuous GPU sampling.
import { lensMap } from "./control-lens.js";

export const textProfile = {
  strength: 0.3,
  dispersion: 0.1,
  depth: 2.5,
  dome: 0,
  splay: 1,
  ink: true,
  paintsLight: true,
  pill: true,
};

// Keep small navigation glyphs legible instead of copying the legacy warp amplitude.
export const gpuTextStrength = 0.08;

const vertex = `#version 300 es
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0,1);}`;
const fragment = `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D glyphs, field;
uniform vec2 size, origin, lensSize;
uniform float reach;
uniform vec3 page;
uniform bool ink, spectral;
out vec4 color;
vec4 source(vec2 p){
 if(any(lessThan(p,vec2(0)))||any(greaterThanEqual(p,size)))return vec4(0);
 return texture(glyphs,(p+.5)/size);
}
vec3 mapAt(vec2 p){
 vec2 uv=(p+.5-origin)/lensSize;
 if(any(lessThan(uv,vec2(0)))||any(greaterThanEqual(uv,vec2(1))))return vec3(128./255.,128./255.,0);
 return texture(field,uv).rgb;
}
vec4 ray(vec2 p,float scale){
 // Keep the sequential lookup: the horizontal field is read at the displaced Y.
 float dy=(mapAt(p).g-.5)*scale;
 vec2 q=p+vec2(0,dy);
 float dx=(mapAt(q).r-.5)*scale;
 return source(q+vec2(dx,0));
}
void main(){
 vec2 p=vec2(gl_FragCoord.x-.5,size.y-gl_FragCoord.y-.5);
 vec4 plain=source(p);
 if(reach==0.){color=plain;return;}
 if(!spectral){color=mix(plain,ray(p,reach),mapAt(p).b);return;}
 vec4 r=ray(p,reach*1.02),g=ray(p,reach*1.01),b=ray(p,reach);
 float a=max(r.a,max(g.a,b.a));
 vec3 rgb=vec3(r.r,g.g,b.b);
 if(ink)rgb+=page*(a-vec3(r.a,g.a,b.a));
 else a=(r.a+g.a+b.a)/3.;
 vec4 bent=vec4(rgb,a);
 color=mix(plain,bent,mapAt(p).b);
}`;

/** Bounded comparison only: no DOM capture, blur, mipmaps or text downsampling. */
export class TextRefractionGPU {
  readonly canvas = document.createElement("canvas");
  readonly bytes: number;
  private readonly gl: WebGL2RenderingContext;
  private readonly program: WebGLProgram;
  private readonly textures: WebGLTexture[] = [];
  private readonly vao: WebGLVertexArrayObject;
  private readonly uniforms: Record<string, WebGLUniformLocation | null>;
  private disposed = false;

  constructor(
    input: HTMLImageElement,
    readonly width: number,
    readonly height: number,
    readonly density: number,
    readonly lensWidth: number,
    readonly lensHeight: number,
  ) {
    const gl = this.canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      depth: false,
      stencil: false,
    });
    if (!gl) throw Error("WebGL2 unavailable; retain SVG text refraction");
    this.gl = gl;
    this.canvas.width = input.width;
    this.canvas.height = input.height;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    const program = gl.createProgram();
    const vao = gl.createVertexArray();
    if (!program || !vao) throw Error("Text probe allocation failed");
    this.program = program;
    this.vao = vao;
    this.uniforms = {};
    const map = lensMap(
      { width: lensWidth, height: lensHeight, radius: Math.min(lensWidth, lensHeight) / 2 },
      textProfile,
      {
        angle: 45,
        glow: 0.4,
        spread: 0.5,
        glowPower: 1.5,
        edge: 0.5,
        edgeWidth: 2,
        edgePower: 1.5,
      },
      density,
    );
    this.bytes = input.width * input.height * 4 + map.columns * map.rows * 4;
    try {
      for (const [kind, code] of [
        [gl.VERTEX_SHADER, vertex],
        [gl.FRAGMENT_SHADER, fragment],
      ] as const) {
        const shader = gl.createShader(kind);
        if (!shader) throw Error("Text shader allocation failed");
        try {
          gl.shaderSource(shader, code);
          gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            throw Error(gl.getShaderInfoLog(shader) ?? "Text shader compile failed");
          gl.attachShader(program, shader);
        } finally {
          gl.deleteShader(shader);
        }
      }
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw Error(gl.getProgramInfoLog(program) ?? "Text shader link failed");
      gl.useProgram(program);
      gl.bindVertexArray(vao);
      for (const name of [
        "glyphs",
        "field",
        "size",
        "origin",
        "lensSize",
        "reach",
        "page",
        "ink",
        "spectral",
      ])
        this.uniforms[name] = gl.getUniformLocation(program, name);
      const packed = new Uint8Array(map.columns * map.rows * 4);
      for (let i = 0; i < packed.length; i += 4) {
        packed[i] = map.across[i]!;
        packed[i + 1] = map.down[i]!;
        packed[i + 2] = map.light[i + 3]!;
        packed[i + 3] = 255;
      }
      for (let unit = 0; unit < 2; unit++) {
        const texture = gl.createTexture();
        if (!texture) throw Error("Text texture allocation failed");
        this.textures.push(texture);
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        if (unit === 0) {
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
          gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, input);
        } else
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA8,
            map.columns,
            map.rows,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            packed,
          );
      }
      gl.uniform1i(this.uniforms["glyphs"]!, 0);
      gl.uniform1i(this.uniforms["field"]!, 1);
      gl.uniform2f(this.uniforms["size"]!, input.width, input.height);
      gl.uniform2f(this.uniforms["lensSize"]!, lensWidth * density, lensHeight * density);
      gl.viewport(0, 0, input.width, input.height);
    } catch (error) {
      this.dispose();
      throw error;
    }
  }

  /** Replace the complete glyph row without rebuilding the displacement field. */
  updateGlyphs(input: HTMLImageElement) {
    if (input.width !== this.canvas.width) return false;
    return this.updateGlyphStrip(input, 0);
  }

  /** Replace a full-height strip, including transparent pixels, at a device-pixel offset. */
  updateGlyphStrip(input: HTMLImageElement, x: number) {
    const gl = this.gl;
    if (this.disposed || gl.isContextLost()) return false;
    if (
      !Number.isInteger(x) ||
      x < 0 ||
      input.width <= 0 ||
      x + input.width > this.canvas.width ||
      input.height !== this.canvas.height
    )
      return false;
    gl.activeTexture(gl.TEXTURE0);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, x, 0, gl.RGBA, gl.UNSIGNED_BYTE, input);
    return gl.getError() === gl.NO_ERROR;
  }

  draw(
    amount: number,
    x: number,
    y: number,
    dark: boolean,
    ink = true,
    geometry = { width: this.lensWidth, height: this.lensHeight },
    spectral = true,
  ) {
    if (this.disposed || this.gl.isContextLost()) return false;
    const gl = this.gl;
    gl.uniform2f(this.uniforms["origin"]!, x * this.density, y * this.density);
    gl.uniform2f(
      this.uniforms["lensSize"]!,
      geometry.width * this.density,
      geometry.height * this.density,
    );
    gl.uniform1f(
      this.uniforms["reach"]!,
      Math.min(geometry.width, geometry.height) * gpuTextStrength * amount * this.density,
    );
    const page = dark ? 22 / 255 : 1;
    gl.uniform3f(this.uniforms["page"]!, page, page, page);
    gl.uniform1i(this.uniforms["ink"]!, ink ? 1 : 0);
    gl.uniform1i(this.uniforms["spectral"]!, spectral ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return true;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    for (const texture of this.textures) this.gl.deleteTexture(texture);
    this.gl.deleteProgram(this.program);
    this.gl.deleteVertexArray(this.vao);
    this.canvas.width = this.canvas.height = 1;
  }
}
