import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";

const require = createRequire(new URL("../../apps/docs/package.json", import.meta.url));
const { chromium, webkit } = require("playwright");
const base = process.env.GLASS_LAB_URL ?? "http://127.0.0.1:4325";
const output = new URL("../../.amp/in/artifacts/scene-owned-glass/ceiling/", import.meta.url);
const convolution = process.env.CONVOLUTION ?? "paired";
assert.ok(["paired", "reused", "direct"].includes(convolution));
await mkdir(output, { recursive: true });
const results = [];
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue;
  const browser = await engine.launch({
    headless: false,
    ...(name === "chromium" ? { args: ["--use-angle=metal"] } : {}),
  });
  try {
    const page = await browser.newPage();
    await page.goto(`${base}/ceiling.html`);
    await page.waitForFunction(() => document.querySelector("#stage")?.dataset.state === "ready");
    const { checks, passes, sampler } = await page.evaluate(async (convolution) => {
      const { SceneRenderer } = await import("/renderer.ts");
      const { ReusedBlur } = await import("/reused-blur.ts");
      window.dispatchEvent(new Event("pagehide"));
      if (convolution === "direct") {
        const proto = WebGL2RenderingContext.prototype;
        const live = { Texture: new Set(), Framebuffer: new Set() };
        const restore = [];
        for (const kind of Object.keys(live)) {
          const create = proto[`create${kind}`],
            remove = proto[`delete${kind}`];
          proto[`create${kind}`] = function (...args) {
            const value = create.apply(this, args);
            if (value) live[kind].add(value);
            return value;
          };
          proto[`delete${kind}`] = function (value) {
            live[kind].delete(value);
            return remove.call(this, value);
          };
          restore.push(() => {
            proto[`create${kind}`] = create;
            proto[`delete${kind}`] = remove;
          });
        }
        const renderer = new SceneRenderer(
          "resident",
          129,
          93,
          1,
          false,
          undefined,
          true,
          "direct",
        );
        const check = (textures, frames, phase) => {
          if (live.Texture.size !== textures || live.Framebuffer.size !== frames)
            throw new Error(
              `${phase}: expected ${textures}/${frames} texture/FBO, got ${live.Texture.size}/${live.Framebuffer.size}`,
            );
        };
        const frame = {
          layers: [{ kind: "glass", record: new Float32Array([8, 9, 90, 60, 12, 12.8, 12.8, 1]) }],
          blur: 1.2,
          sampling: "ordered",
          work: "bounded",
        };
        try {
          check(7, 7, "direct initialization");
          for (let i = 0; i < 3; i++) {
            renderer.render(0, 0, new Float32Array(), i * 2, frame);
            check(7, 7, "composition");
            renderer.render(0, 0, new Float32Array(), i * 2 + 1);
            check(8, 8, "ordinary rendering");
          }
          renderer.render(0, 0, new Float32Array(), 7, frame);
          check(7, 7, "composition reentry");
        } finally {
          renderer.dispose();
          restore.forEach((fn) => fn());
        }
        check(0, 0, "dispose");
      }
      const captured = [];
      const originalShaderSource = WebGL2RenderingContext.prototype.shaderSource;
      WebGL2RenderingContext.prototype.shaderSource = function (shader, source) {
        if (
          source.includes("uniform float sigma;") &&
          !source.includes("uniform ivec2 sourceSize;")
        )
          captured.push(source);
        return originalShaderSource.call(this, shader, source);
      };
      const results = [];
      for (const dpr of [1, 2]) {
        const width = 129,
          height = 93;
        const source = document.createElement("canvas");
        source.width = width * dpr;
        source.height = height * dpr;
        const ctx = source.getContext("2d");
        const image = ctx.createImageData(source.width, source.height);
        let random = 0x1a2b3c4d;
        for (let y = 0; y < source.height; y++)
          for (let x = 0; x < source.width; x++) {
            const i = (y * source.width + x) * 4;
            random ^= random << 13;
            random ^= random >>> 17;
            random ^= random << 5;
            image.data.set(
              [
                (x + y) % 2 ? 255 : 0,
                random & 255,
                x === 0 || y === source.height - 1 ? 255 : 0,
                255,
              ],
              i,
            );
          }
        ctx.putImageData(image, 0, 0);
        for (const dark of [false, true]) {
          const instances = ["reference", convolution].map(
            (kernel) =>
              new SceneRenderer("resident", width, height, dpr, dark, undefined, true, kernel),
          );
          for (const blur of [0.35, 1 / 3, 0.334, 1.2, 5.1, 15.3, 24, 28]) {
            for (const layers of [1, 8]) {
              const frame = {
                layers: [
                  { kind: "paint", source, revision: 0 },
                  ...Array.from({ length: layers }, (_, i) => ({
                    kind: "glass",
                    record: new Float32Array(
                      [-9.25 + i * 9.5, 4.5 + i * 2, 101, 76, 16, 12.8, 12.8, 1].map((v, j) =>
                        j < 7 ? v * dpr : v,
                      ),
                    ),
                  })),
                ],
                blur,
                sampling: "ordered",
                work: "bounded",
              };
              const pixels = instances.map((renderer) => {
                renderer.render(0, 0, new Float32Array(), 0, frame);
                const gl = renderer.canvas.getContext("webgl2");
                const value = new Uint8Array(source.width * source.height * 4);
                gl.readPixels(0, 0, source.width, source.height, gl.RGBA, gl.UNSIGNED_BYTE, value);
                if (gl.getError()) throw new Error("Convolution probe GL error");
                return value;
              });
              let maximum = 0,
                sum = 0,
                changed = 0;
              for (let i = 0; i < pixels[0].length; i++) {
                const delta = Math.abs(pixels[0][i] - pixels[1][i]);
                maximum = Math.max(maximum, delta);
                sum += delta;
                changed += Number(delta !== 0);
              }
              results.push({
                dpr,
                dark,
                blur,
                layers,
                maximum,
                mean: sum / pixels[0].length,
                changed,
              });
            }
          }
          if (convolution === "direct")
            for (const sameRevision of [false, true]) {
              // Switching out of composition must not silently reset the reference's retained sigma.
              const pixels = instances.map((renderer, index) => {
                const lens = new Float32Array(
                  [10, 12, 95, 68, 12, 12.8, 12.8, 1].map((v, i) => (i < 7 ? v * dpr : v)),
                );
                renderer.render(0, 0, new Float32Array(), 0, {
                  layers: [
                    { kind: "paint", source, revision: 0 },
                    { kind: "glass", record: lens },
                  ],
                  blur: 1.2,
                  sampling: "ordered",
                  work: "bounded",
                });
                renderer.render(0.37, 37, lens, sameRevision && index === 1 ? 0 : 1);
                const gl = renderer.canvas.getContext("webgl2");
                const value = new Uint8Array(source.width * source.height * 4);
                gl.readPixels(0, 0, source.width, source.height, gl.RGBA, gl.UNSIGNED_BYTE, value);
                if (gl.getError()) throw new Error("Composition exit GL error");
                return value;
              });
              let maximum = 0;
              for (let i = 0; i < pixels[0].length; i++)
                maximum = Math.max(maximum, Math.abs(pixels[0][i] - pixels[1][i]));
              results.push({
                dpr,
                dark,
                scenario: "composition-to-ordinary",
                sameRevision,
                maximum,
              });
            }
          instances.forEach((renderer) => renderer.dispose());
        }
      }
      WebGL2RenderingContext.prototype.shaderSource = originalShaderSource;
      const fragments = [...new Set(captured)];
      if (fragments.length !== 2)
        throw new Error("Expected distinct reference and candidate shaders");
      fragments.push(`#version 300 es
      precision highp float;
      precision highp sampler2D;
      uniform sampler2D source;
      out vec4 color;
      void main(){color=texture(source,vec2(.25+.5*gl_FragCoord.x/4096.,.5));}`);
      const passes = [];
      let sampler = null;
      for (const [width, height] of convolution !== "paired"
        ? [
            [129, 93],
            [128, 96],
            [1, 7],
            [9, 1],
          ]
        : [[129, 93]]) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const gl = canvas.getContext("webgl2", { antialias: false });
        const vertex = `#version 300 es
      precision highp float;
      out vec2 uv;
      void main(){
        vec2 c[3]=vec2[3](vec2(0,0),vec2(2,0),vec2(0,2));
        uv=c[gl_VertexID]; gl_Position=vec4(uv*2.-1.,0,1);
      }`;
        const programs = fragments.map((fragment) => {
          const program = gl.createProgram();
          for (const [kind, source] of [
            [gl.VERTEX_SHADER, vertex],
            [gl.FRAGMENT_SHADER, fragment],
          ]) {
            const shader = gl.createShader(kind);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
              throw new Error(gl.getShaderInfoLog(shader));
            gl.attachShader(program, shader);
            gl.deleteShader(shader);
          }
          gl.linkProgram(program);
          if (!gl.getProgramParameter(program, gl.LINK_STATUS))
            throw new Error(gl.getProgramInfoLog(program));
          return program;
        });
        const textures = Array.from({ length: 3 }, () => {
          const texture = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA8,
            width,
            height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
          );
          return texture;
        });
        const targets = textures.slice(1).map((texture) => {
          const frame = gl.createFramebuffer();
          gl.bindFramebuffer(gl.FRAMEBUFFER, frame);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
          if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
            throw new Error("Incomplete blur target");
          return frame;
        });
        const reused =
          convolution !== "paired"
            ? new ReusedBlur(gl, width, height, convolution === "direct")
            : null;
        for (const pattern of ["impulse", "noise", "edge", "checker"]) {
          const input = new Uint8Array(width * height * 4);
          let seed = 0x24ace;
          for (let y = 0; y < height; y++)
            for (let x = 0; x < width; x++) {
              seed ^= seed << 13;
              seed ^= seed >>> 17;
              seed ^= seed << 5;
              const value =
                pattern === "impulse"
                  ? Number(x === 0 && y === height - 1) * 255
                  : pattern === "noise"
                    ? seed & 255
                    : pattern === "edge"
                      ? Number(x < 47) * 255
                      : ((x + y) % 2) * 255;
              input.set(
                pattern === "noise"
                  ? [value, (seed >>> 8) & 255, (seed >>> 16) & 255, seed >>> 24]
                  : [value, value, value, 255],
                (y * width + x) * 4,
              );
            }
          gl.bindTexture(gl.TEXTURE_2D, textures[0]);
          gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, input);
          for (const sigma of [0.35, 1.2, 15.3, 30.6, 56])
            for (const axes of convolution === "direct" ? [2] : [1, 2])
              for (const bounds of convolution !== "paired"
                ? [undefined, [width * 0.15, height * 0.11, width * 0.79, height * 0.83]]
                : [undefined]) {
                const pixels = programs.slice(0, 2).map((program, candidate) => {
                  gl.disable(gl.SCISSOR_TEST);
                  gl.clearColor(0.13, 0.27, 0.39, 0.71);
                  for (const target of targets) {
                    gl.bindFramebuffer(gl.FRAMEBUFFER, target);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                  }
                  gl.useProgram(program);
                  gl.uniform1i(gl.getUniformLocation(program, "source"), 0);
                  gl.uniform1f(gl.getUniformLocation(program, "sigma"), sigma);
                  const draw = gl.drawArrays;
                  let draws = 0;
                  gl.drawArrays = function (...args) {
                    draws++;
                    return draw.apply(this, args);
                  };
                  for (let axis = 0; axis < axes; axis++) {
                    const halo =
                      convolution === "direct" && axis === 0
                        ? Math.min(72, Math.ceil(sigma * 3))
                        : 0;
                    const region = bounds
                      ? [
                          Math.floor(bounds[0]),
                          Math.max(0, Math.floor(bounds[1]) - halo),
                          Math.ceil(bounds[2]),
                          Math.min(height, Math.ceil(bounds[3]) + halo),
                        ]
                      : undefined;
                    if (candidate && reused) {
                      reused.render(textures[axis], targets[axis], sigma, axis, region);
                      continue;
                    }
                    if (region) {
                      gl.enable(gl.SCISSOR_TEST);
                      gl.scissor(
                        region[0],
                        height - region[3],
                        region[2] - region[0],
                        region[3] - region[1],
                      );
                    }
                    gl.bindTexture(gl.TEXTURE_2D, textures[axis]);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, targets[axis]);
                    gl.uniform2f(
                      gl.getUniformLocation(program, "stepSize"),
                      axis ? 0 : 1 / width,
                      axis ? 1 / height : 0,
                    );
                    gl.drawArrays(gl.TRIANGLES, 0, 3);
                  }
                  gl.drawArrays = draw;
                  if (candidate && convolution === "direct" && draws !== 2)
                    throw new Error(`Direct packed pair used ${draws} draws instead of 2`);
                  const output = new Uint8Array(input.length);
                  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, output);
                  if (gl.getError()) throw new Error("Isolated blur GL error");
                  return output;
                });
                let maximum = 0,
                  sum = 0;
                for (let i = 0; i < pixels[0].length; i++) {
                  const delta = Math.abs(pixels[0][i] - pixels[1][i]);
                  maximum = Math.max(maximum, delta);
                  sum += delta;
                }
                passes.push({
                  width,
                  height,
                  pattern,
                  sigma,
                  axes,
                  bounds: bounds ?? null,
                  maximum,
                  mean: sum / input.length,
                });
              }
        }
        if (width === 129 && gl.getExtension("EXT_color_buffer_float")) {
          canvas.width = 4096;
          canvas.height = 1;
          gl.viewport(0, 0, 4096, 1);
          gl.bindTexture(gl.TEXTURE_2D, textures[1]);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 4096, 1, 0, gl.RGBA, gl.FLOAT, null);
          gl.bindFramebuffer(gl.FRAMEBUFFER, targets[0]);
          if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
            throw new Error("Incomplete sampler scan float target");
          gl.bindTexture(gl.TEXTURE_2D, textures[0]);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA8,
            2,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 0, 255, 255, 255, 255, 255]),
          );
          gl.useProgram(programs[2]);
          gl.uniform1i(gl.getUniformLocation(programs[2], "source"), 0);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          const samples = new Float32Array(4096 * 4);
          gl.readPixels(0, 0, 4096, 1, gl.RGBA, gl.FLOAT, samples);
          if (gl.getError()) throw new Error("Sampler scan GL error");
          const values = Array.from({ length: 4096 }, (_, i) => samples[i * 4]);
          if (!values.every(Number.isFinite) || values[0] >= values.at(-1))
            throw new Error("Sampler scan did not render the input ramp");
          sampler = {
            count: 4096,
            unique: new Set(values).size,
            maximum: Math.max(...values.map((value, i) => Math.abs(value - (i + 0.5) / 4096))),
            values,
          };
        }
        targets.forEach((frame) => gl.deleteFramebuffer(frame));
        textures.forEach((texture) => gl.deleteTexture(texture));
        programs.forEach((program) => gl.deleteProgram(program));
        reused?.dispose();
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
      return { checks: results, passes, sampler };
    }, convolution);
    results.push({
      engine: name,
      version: browser.version(),
      convolution,
      checks,
      passes,
      sampler,
    });
    await writeFile(
      new URL(
        convolution === "paired"
          ? "convolution-parity.json"
          : `convolution-${convolution}-parity.json`,
        output,
      ),
      JSON.stringify(results, null, 2),
    );
    console.log(name, "maximum", Math.max(...checks.map((c) => c.maximum)));
  } finally {
    await browser.close();
  }
}
assert.ok(
  results.every((r) => [...r.checks, ...r.passes].every((c) => c.maximum === 0)),
  `${convolution} convolution must preserve exact reference pixels`,
);
