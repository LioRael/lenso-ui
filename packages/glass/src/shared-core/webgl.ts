// Adapted from the Lenso route lab (MIT); see ../../shaders/NOTICE.md.
import { toneShader } from "../material-tone.js";
import { shaders as codes } from "./generated/shaders.js";

export class GlassRenderer {
  private readonly gl: WebGL2RenderingContext;
  private readonly width: number;
  private readonly height: number;
  private revision: number;
  private count = 0;
  private programs: Array<{
    program: WebGLProgram;
    full: WebGLUniformLocation | null;
    step: WebGLUniformLocation | null;
  }> = [];
  private vao: WebGLVertexArrayObject | null = null;
  private buffer: WebGLBuffer | null = null;
  private frames: WebGLFramebuffer[] = [];
  private textures: WebGLTexture[] = [];
  constructor(canvas: HTMLCanvasElement, material: Float32Array) {
    if (material.length !== 4 || !material.every(Number.isFinite) || material[3]! <= 0)
      throw new Error("Material requires version, appearance, profile and positive DPR");
    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL2 unavailable");
    this.gl = gl;
    this.width = canvas.width;
    this.height = canvas.height;
    this.revision = -1;
    const maximum = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
    if (!this.width || !this.height || this.width > maximum || this.height > maximum)
      throw new Error("Canvas exceeds device dimensions");
    try {
      for (const fragment of codes.slice(1)) {
        const compiled: WebGLShader[] = [];
        const program = gl.createProgram();
        if (!program) throw new Error("Program allocation failed");
        this.programs.push({ program, full: null, step: null });
        try {
          for (const [kind, code] of [
            [gl.VERTEX_SHADER, codes[0]!],
            [gl.FRAGMENT_SHADER, fragment],
          ] as const) {
            const shader = gl.createShader(kind);
            if (!shader) throw new Error("Shader allocation failed");
            compiled.push(shader);
            gl.shaderSource(shader, code.replace("/* material-tone */", toneShader("glsl")));
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
              throw new Error(gl.getShaderInfoLog(shader) ?? "Shader compilation failed");
            gl.attachShader(program, shader);
          }
          gl.linkProgram(program);
          if (!gl.getProgramParameter(program, gl.LINK_STATUS))
            throw new Error(gl.getProgramInfoLog(program) ?? "Program link failed");
        } finally {
          for (const shader of compiled) gl.deleteShader(shader);
        }
        const uniform = (name: string) => gl.getUniformLocation(program, name);
        gl.useProgram(program);
        gl.uniform2f(uniform("size"), this.width, this.height);
        gl.uniform1i(uniform("source"), 0);
        gl.uniform1i(uniform("paintRim"), 1);
        const blur = material[0] === 26 ? (material[2] ? 6 : 3.5) : 15.3;
        gl.uniform1f(uniform("sigma"), blur * material[3]!);
        gl.uniform4fv(uniform("material"), material);
        Object.assign(this.programs.at(-1)!, { full: uniform("full"), step: uniform("stepSize") });
      }
      this.vao = gl.createVertexArray();
      gl.bindVertexArray(this.vao);
      this.buffer = gl.createBuffer();
      if (!this.vao || !this.buffer) throw new Error("Vertex allocation failed");
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, 1000 * 32, gl.DYNAMIC_DRAW);
      for (let i = 0; i < 2; i++) {
        gl.enableVertexAttribArray(i);
        gl.vertexAttribPointer(i, 4, gl.FLOAT, false, 32, i * 16);
        gl.vertexAttribDivisor(i, 1);
      }
      for (let i = 0; i < 3; i++) {
        const texture = gl.createTexture();
        if (!texture) throw new Error("Texture allocation failed");
        this.textures.push(texture);
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
          this.width,
          this.height,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          null,
        );
        if (i) {
          const frame = gl.createFramebuffer();
          if (!frame) throw new Error("Framebuffer allocation failed");
          this.frames.push(frame);
          gl.bindFramebuffer(gl.FRAMEBUFFER, frame);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
          if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
            throw new Error("Incomplete framebuffer");
        }
      }
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.viewport(0, 0, this.width, this.height);
    } catch (error) {
      this.free();
      throw error;
    }
  }

  set_lenses(values: Float32Array) {
    if (
      !values.length ||
      values.length % 8 ||
      values.length > 8000 ||
      !values.every(Number.isFinite)
    )
      throw new Error("Invalid lens records");
    for (let i = 0; i < values.length; i += 8)
      if ([2, 3, 4, 5].some((offset) => values[i + offset]! <= 0))
        throw new Error("Lens dimensions, radius and bezel must be positive");
    this.count = values.length / 8;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, values);
  }

  render_canvas(source: HTMLCanvasElement, revision: number) {
    this.render(source, revision);
  }

  private render(source: HTMLCanvasElement, revision: number) {
    const gl = this.gl;
    if (this.revision !== revision) {
      gl.bindTexture(gl.TEXTURE_2D, this.textures[0]!);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, source);
      gl.disable(gl.BLEND);
      const blur = this.programs[0]!;
      gl.useProgram(blur.program);
      gl.uniform1i(blur.full, 1);
      for (let i = 0; i < 2; i++) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frames[i]!);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[i]!);
        gl.uniform2f(blur.step, i === 0 ? 1 / this.width : 0, i === 1 ? 1 / this.height : 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      this.revision = revision;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const glass = this.programs[1]!;
    gl.useProgram(glass.program);
    gl.uniform1i(glass.full, 0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[2]!);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, this.count);
    gl.flush();
  }

  set_rim(enabled: boolean) {
    const gl = this.gl,
      glass = this.programs[1]!;
    gl.useProgram(glass.program);
    gl.uniform1i(gl.getUniformLocation(glass.program, "paintRim"), Number(enabled));
  }

  is_context_lost() {
    return this.gl.isContextLost();
  }

  free() {
    const gl = this.gl;
    for (const texture of this.textures) gl.deleteTexture(texture);
    for (const frame of this.frames) gl.deleteFramebuffer(frame);
    for (const { program } of this.programs) gl.deleteProgram(program);
    gl.deleteBuffer(this.buffer);
    gl.deleteVertexArray(this.vao);
  }
}
