export class ShaderRenderer {
  declare gl: WebGL2RenderingContext;
  declare width: number;
  declare height: number;
  declare revision: number;
  declare count: number;
  declare programs: Array<{
    program: WebGLProgram;
    full: WebGLUniformLocation | null;
    step: WebGLUniformLocation | null;
  }>;
  declare vao: WebGLVertexArrayObject | null;
  declare buffer: WebGLBuffer | null;
  declare frames: WebGLFramebuffer[];
  declare textures: WebGLTexture[];
  constructor(canvas: HTMLCanvasElement, codes: string[], material: Float32Array) {
    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL2 unavailable");
    this.gl = gl;
    this.width = canvas.width;
    this.height = canvas.height;
    this.revision = -1;
    this.programs = codes.slice(1).map((fragment) => {
      const shaders = [codes[0], fragment].map((code, index) => {
        const shader = gl.createShader(index ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER)!;
        gl.shaderSource(shader, code);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
          throw new Error(gl.getShaderInfoLog(shader) ?? undefined);
        return shader;
      });
      const program = gl.createProgram()!;
      for (const shader of shaders) gl.attachShader(program, shader);
      gl.linkProgram(program);
      for (const shader of shaders) gl.deleteShader(shader);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error(gl.getProgramInfoLog(program) ?? undefined);
      const uniform = (name: string) => gl.getUniformLocation(program, name);
      gl.useProgram(program);
      gl.uniform2f(uniform("size"), this.width, this.height);
      gl.uniform1i(uniform("source"), 0);
      const blur = material[2] ? (material[0] === 26 ? 6 : 8) : material[0] === 26 ? 3.5 : 3;
      gl.uniform1f(uniform("sigma"), blur * material[3]);
      gl.uniform4fv(uniform("material"), material);
      return { program, full: uniform("full"), step: uniform("stepSize") };
    });
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, 1000 * 32, gl.DYNAMIC_DRAW);
    for (let i = 0; i < 2; i++) {
      gl.enableVertexAttribArray(i);
      gl.vertexAttribPointer(i, 4, gl.FLOAT, false, 32, i * 16);
      gl.vertexAttribDivisor(i, 1);
    }
    this.frames = [];
    this.textures = Array.from({ length: 3 }, (_, i) => {
      const texture = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      for (const [key, value] of [
        [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
        [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
        [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
        [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
      ])
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
        const frame = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, frame);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
          throw new Error("Incomplete framebuffer");
        this.frames.push(frame);
      }
      return texture;
    });
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.viewport(0, 0, this.width, this.height);
  }

  set_lenses(values: Float32Array) {
    this.count = values.length / 8;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, values);
  }

  render_canvas(source: HTMLCanvasElement, revision: number) {
    this.render(source, revision);
  }
  render_video(source: HTMLVideoElement, revision: number) {
    this.render(source, revision);
  }

  render(source: HTMLCanvasElement | HTMLVideoElement, revision: number) {
    const gl = this.gl;
    if (this.revision !== revision) {
      gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, source);
      gl.disable(gl.BLEND);
      const blur = this.programs[0];
      gl.useProgram(blur.program);
      gl.uniform1i(blur.full, 1);
      for (let i = 0; i < 2; i++) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frames[i]);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
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
    const glass = this.programs[1];
    gl.useProgram(glass.program);
    gl.uniform1i(glass.full, 0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[2]);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, this.count);
    gl.flush();
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
