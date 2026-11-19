// Reuses retained optical work; preserve shaders/NOTICE.md and its licenses.
// Experimental adjacent-output reuse. No interpolated samples or reduced Gaussian support.
const vertex = `#version 300 es
precision highp float;
void main(){
  vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));
  gl_Position=vec4(p*2.-1.,0,1);
}`;

const convolve = `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D source;
uniform float sigma;
uniform ivec2 origin;
uniform int groupsWide;
uniform int groupCount;
uniform int packedWidth;
uniform bool horizontal;
layout(location=0) out vec4 a;
layout(location=1) out vec4 b;
layout(location=2) out vec4 c;
layout(location=3) out vec4 d;
void main(){
  int index=int(gl_FragCoord.y)*packedWidth+int(gl_FragCoord.x);
  if(index>=groupCount) discard;
  ivec2 group=ivec2(index%groupsWide,index/groupsWide);
  ivec2 axis=horizontal ? ivec2(1,0) : ivec2(0,1);
  ivec2 base=origin+(horizontal ? group*ivec2(4,1) : group*ivec2(1,4));
  ivec2 limit=textureSize(source,0)-1;
  vec4 s0=vec4(0),s1=vec4(0),s2=vec4(0),s3=vec4(0);
  float total=0.,w1=0.,w2=0.,w3=0.;
  for(int i=-MAX_RADIUS;i<=MAX_TAIL;i++){
    float w0=0.;
    if(i<=MAX_RADIUS && abs(float(i))<=ceil(sigma*3.))
      w0=exp(-float(i*i)/(2.*sigma*sigma));
    if(w0+w1+w2+w3>0.){
      vec4 v=texelFetch(source,clamp(base+axis*i,ivec2(0),limit),0);
      if(w0>0.) s0+=v*w0;
      if(w1>0.) s1+=v*w1;
      if(w2>0.) s2+=v*w2;
      if(w3>0.) s3+=v*w3;
    }
    if(w0>0.) total+=w0;
    w3=w2; w2=w1; w1=w0;
  }
  a=s0/total; b=s1/total; c=s2/total; d=s3/total;
}`;

const unpack = `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D chunk0;
uniform sampler2D chunk1;
uniform sampler2D chunk2;
uniform sampler2D chunk3;
uniform ivec2 origin;
uniform int groupsWide;
uniform int packedWidth;
uniform bool horizontal;
out vec4 color;
void main(){
  ivec2 p=ivec2(gl_FragCoord.xy)-origin;
  ivec2 group=horizontal ? p/ivec2(4,1) : p/ivec2(1,4);
  int index=group.y*groupsWide+group.x;
  ivec2 at=ivec2(index%packedWidth,index/packedWidth);
  int channel=horizontal ? p.x%4 : p.y%4;
  if(channel==0) color=texelFetch(chunk0,at,0);
  else if(channel==1) color=texelFetch(chunk1,at,0);
  else if(channel==2) color=texelFetch(chunk2,at,0);
  else color=texelFetch(chunk3,at,0);
}`;

const directVertical = `#version 300 es
precision highp float;
precision highp int;
precision lowp sampler2DArray;
uniform sampler2DArray chunks;
uniform float sigma;
uniform ivec2 sourceSize;
uniform ivec2 origin;
out vec4 color;
void main(){
  int column=(int(gl_FragCoord.x)-origin.x)/4;
  int channel=(int(gl_FragCoord.x)-origin.x)%4;
  vec4 sum=vec4(0);
  float total=0.;
  for(int i=-MAX_RADIUS;i<=MAX_RADIUS;i++){
    if(abs(float(i))>ceil(sigma*3.)) continue;
    float weight=exp(-float(i*i)/(2.*sigma*sigma));
    int row=clamp(int(gl_FragCoord.y)+i,0,sourceSize.y-1)-origin.y;
    vec4 value=texelFetch(chunks,ivec3(column,row,channel),0);
    sum+=value*weight;
    total+=weight;
  }
  color=sum/total;
}`;

export class ReusedBlur {
  private programs: WebGLProgram[] = [];
  private uniforms: Map<string, WebGLUniformLocation | null>[] = [];
  private textures: WebGLTexture[] = [];
  private frame: WebGLFramebuffer | null = null;

  constructor(
    private readonly gl: WebGL2RenderingContext,
    private readonly width: number,
    private readonly height: number,
    private readonly direct = false,
    private readonly radius = 72,
  ) {
    try {
      for (const fragment of [convolve, direct ? directVertical : unpack]) {
        const program = gl.createProgram();
        if (!program) throw new Error("Reuse program allocation failed");
        this.programs.push(program);
        for (const [kind, source] of [
          [gl.VERTEX_SHADER, vertex],
          [gl.FRAGMENT_SHADER, fragment],
        ] as const) {
          const shader = gl.createShader(kind);
          if (!shader) throw new Error("Reuse shader allocation failed");
          gl.shaderSource(
            shader,
            source
              .replaceAll("MAX_RADIUS", String(radius))
              .replaceAll("MAX_TAIL", String(radius + 3)),
          );
          gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const message = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(message ?? "Reuse shader compile failed");
          }
          gl.attachShader(program, shader);
          gl.deleteShader(shader);
        }
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
          throw new Error(gl.getProgramInfoLog(program) ?? "Reuse program link failed");
        this.uniforms.push(
          new Map(
            [
              "source",
              "sigma",
              "origin",
              "groupsWide",
              "groupCount",
              "packedWidth",
              "horizontal",
              "sourceSize",
              "chunks",
              "chunk0",
              "chunk1",
              "chunk2",
              "chunk3",
            ].map((name) => [name, gl.getUniformLocation(program, name)]),
          ),
        );
      }
      this.frame = gl.createFramebuffer();
      if (!this.frame) throw new Error("Reuse framebuffer allocation failed");
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.frame);
      // Both axes share storage. Compact per-region dispatch is linearized into this atlas.
      const groups = Math.max(Math.ceil(width / 4) * height, width * Math.ceil(height / 4));
      const textureTarget = direct ? gl.TEXTURE_2D_ARRAY : gl.TEXTURE_2D;
      for (let i = 0; i < (direct ? 1 : 4); i++) {
        const texture = gl.createTexture();
        if (!texture) throw new Error("Reuse texture allocation failed");
        this.textures.push(texture);
        gl.bindTexture(textureTarget, texture);
        gl.texParameteri(textureTarget, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(textureTarget, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        if (direct) {
          // One layer per adjacent horizontal output, with no linear-atlas address division.
          gl.texImage3D(
            textureTarget,
            0,
            gl.RGBA8,
            Math.ceil(width / 4),
            height,
            4,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
          );
          for (let layer = 0; layer < 4; layer++)
            gl.framebufferTextureLayer(
              gl.FRAMEBUFFER,
              gl.COLOR_ATTACHMENT0 + layer,
              texture,
              0,
              layer,
            );
          continue;
        }
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA8,
          width,
          Math.ceil(groups / width),
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          null,
        );
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0 + i,
          gl.TEXTURE_2D,
          texture,
          0,
        );
      }
      gl.drawBuffers([
        gl.COLOR_ATTACHMENT0,
        gl.COLOR_ATTACHMENT1,
        gl.COLOR_ATTACHMENT2,
        gl.COLOR_ATTACHMENT3,
      ]);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
        throw new Error("Reuse framebuffer incomplete");
    } catch (error) {
      this.dispose();
      throw error;
    }
  }

  // Direct packing owns its horizontal target; callers supply only the final destination.
  renderPair(
    source: WebGLTexture,
    target: WebGLFramebuffer,
    sigma: number,
    bounds?: readonly [number, number, number, number],
  ) {
    if (!this.direct) throw new Error("Packed pair requires direct consumption");
    const halo = Math.min(this.radius, Math.ceil(sigma * 3));
    this.render(
      source,
      target,
      sigma,
      0,
      bounds ? [bounds[0], bounds[1] - halo, bounds[2], bounds[3] + halo] : undefined,
    );
    this.render(source, target, sigma, 1, bounds);
  }

  render(
    source: WebGLTexture,
    target: WebGLFramebuffer,
    sigma: number,
    axis: number,
    bounds?: readonly [number, number, number, number],
  ) {
    const { gl, width, height } = this;
    const x0 = Math.max(0, Math.min(width, Math.floor(bounds?.[0] ?? 0)));
    const y0 = Math.max(0, Math.min(height, Math.floor(bounds?.[1] ?? 0)));
    const x1 = Math.max(x0, Math.min(width, Math.ceil(bounds?.[2] ?? width)));
    const y1 = Math.max(y0, Math.min(height, Math.ceil(bounds?.[3] ?? height)));
    if (x0 === x1 || y0 === y1) return;
    const groupsWide = axis === 0 ? Math.ceil((x1 - x0) / 4) : x1 - x0;
    const groupCount = groupsWide * (axis === 0 ? y1 - y0 : Math.ceil((y1 - y0) / 4));
    const packedWidth = this.direct ? groupsWide : Math.min(width, groupCount);
    if (this.direct && axis === 1) {
      // The preceding horizontal pass owns this program's packed-input geometry.
      const at = (name: string) => this.uniforms[1]!.get(name)!;
      gl.useProgram(this.programs[1]!);
      gl.uniform1f(at("sigma"), sigma);
      gl.uniform2i(at("sourceSize"), width, height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target);
      gl.viewport(0, 0, width, height);
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(x0, height - y1, x1 - x0, y1 - y0);
      gl.activeTexture(gl.TEXTURE4);
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.textures[0]!);
      gl.uniform1i(at("chunks"), 4);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.activeTexture(gl.TEXTURE0);
      gl.disable(gl.SCISSOR_TEST);
      return;
    }
    gl.disable(gl.SCISSOR_TEST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frame);
    gl.viewport(0, 0, packedWidth, Math.ceil(groupCount / packedWidth));
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, source);
    for (let pass = 0; pass < (this.direct ? 1 : 2); pass++) {
      const uniforms = this.uniforms[pass]!;
      const at = (name: string) => uniforms.get(name)!;
      gl.useProgram(this.programs[pass]!);
      gl.uniform2i(at("origin"), x0, height - y1);
      gl.uniform1i(at("groupsWide"), groupsWide);
      gl.uniform1i(at("packedWidth"), packedWidth);
      gl.uniform1i(at("horizontal"), Number(axis === 0));
      if (pass === 0) {
        gl.uniform1i(at("source"), 0);
        gl.uniform1f(at("sigma"), sigma);
        gl.uniform1i(at("groupCount"), groupCount);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target);
        gl.viewport(0, 0, width, height);
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(x0, height - y1, x1 - x0, y1 - y0);
        for (let i = 0; i < 4; i++) {
          // Unit 1 belongs to the scene photo, including on subsequent background refreshes.
          gl.activeTexture(gl.TEXTURE0 + 4 + i);
          gl.bindTexture(gl.TEXTURE_2D, this.textures[i]!);
          gl.uniform1i(at(`chunk${i}`), 4 + i);
        }
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    if (this.direct) {
      const at = (name: string) => this.uniforms[1]!.get(name)!;
      gl.useProgram(this.programs[1]!);
      gl.uniform2i(at("origin"), x0, height - y1);
      gl.uniform1i(at("groupsWide"), groupsWide);
      gl.uniform1i(at("packedWidth"), packedWidth);
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.disable(gl.SCISSOR_TEST);
  }

  dispose() {
    for (const texture of this.textures) this.gl.deleteTexture(texture);
    for (const program of this.programs) this.gl.deleteProgram(program);
    this.gl.deleteFramebuffer(this.frame);
  }
}
