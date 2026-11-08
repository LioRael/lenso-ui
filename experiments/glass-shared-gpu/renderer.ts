// Experimental renderer. The production SVG graph and encoded maps are its inputs.
// No production component imports this module.
const quad = `
struct Vertex { @builtin(position) position: vec4f, @location(0) uv: vec2f, @location(1) @interpolate(flat) instance: u32 }
fn corner(i: u32) -> vec2f { return array<vec2f, 6>(vec2f(0,0),vec2f(1,0),vec2f(0,1),vec2f(0,1),vec2f(1,0),vec2f(1,1))[i]; }
@vertex fn full(@builtin(vertex_index) i: u32) -> Vertex {
 let uv = corner(i); return Vertex(vec4f(uv.x*2-1,1-uv.y*2,0,1),uv,0);
}`;

function graphCode(filter: Element, images: Array<string | null>, dpr: number) {
  const functions: string[] = [];
  const caches: Array<{ name: string }> = [];
  const register = (name: string, code: string, resolve: boolean) => {
    if (!resolve) {
      functions.push(`fn ${name}(uv:vec2f,lens:Lens)->vec4f{${code}}`);
      return;
    }
    const i = caches.length;
    caches.push({ name: name + "_render" });
    functions.push(`fn ${name}_render(uv:vec2f,lens:Lens)->vec4f{${code}}`);
    functions.push(`fn ${name}(uv:vec2f,lens:Lens)->vec4f{
      let n=u32(lens.surface.w);let point=(vec2f(f32(n%10)*80,f32(n/10)*80)+vec2f(2)+lens.surface.yz+uv*lens.box.zw)*${dpr};
      return textureSampleLevel(cache${i},linearSampler,point/vec2f(textureDimensions(cache${i})),0);
    }`);
  };
  const results = new Map([["SourceGraphic", "source"]]);
  const numeric = (value: string | number | null) => `${Number(value).toFixed(9)}`;
  let previous = "source";
  for (const [index, node] of [...filter.children].entries()) {
    const name = `stage${index}`;
    const input = results.get(node.getAttribute("in")!) ?? previous;
    const second = results.get(node.getAttribute("in2")!);
    let code;
    switch (node.tagName) {
      case "feImage": {
        const image = images.findIndex((entry) => entry === node.getAttribute("href"));
        code = `let dimensions=vec2f(textureDimensions(map${image}));if(any(uv<=-vec2f(.5)/dimensions)||any(uv>=vec2f(1)+vec2f(.5)/dimensions)){return vec4f(0);}let lo=clamp(uv*dimensions+vec2f(.5),vec2f(0),vec2f(1));let hi=clamp((vec2f(1)-uv)*dimensions+vec2f(.5),vec2f(0),vec2f(1));return textureSampleLevel(map${image},linearSampler,uv,0)*lo.x*lo.y*hi.x*hi.y;`;
        break;
      }
      case "feDisplacementMap":
        if (
          node.getAttribute("xChannelSelector") !== "R" ||
          node.getAttribute("yChannelSelector") !== "G"
        )
          throw new Error("Unsupported displacement channels");
        code = `let field = ${second}(uv, lens);var channels=vec2f(0);if(field.a>0){channels=field.rg/field.a;} return ${input}(uv + (channels-vec2f(.5))*${numeric(node.getAttribute("scale"))}/lens.local.xy, lens);`;
        break;
      case "feColorMatrix": {
        if (node.getAttribute("type") === "saturate") {
          if (Number(node.getAttribute("values")) !== 1)
            throw new Error("Prototype requires the unchanged Small material saturation of 1");
          code = `return ${input}(uv,lens);`;
        } else {
          const values = node.getAttribute("values")!.split(/\s+/).map(Number);
          if (values.length !== 20) throw new Error("Expected a 4×5 SVG color matrix");
          const rows = Array.from(
            { length: 4 },
            (_, row) =>
              `dot(c,vec4f(${values
                .slice(row * 5, row * 5 + 4)
                .map(numeric)
                .join(",")}))+${numeric(values[row * 5 + 4])}`,
          );
          code = `let premul=${input}(uv,lens);let c=vec4f(premul.rgb/max(premul.a,.000001),premul.a);let result=clamp(vec4f(${rows.join(",")}),vec4f(0),vec4f(1));return vec4f(result.rgb*result.a,result.a);`;
        }
        break;
      }
      case "feComposite": {
        if (node.getAttribute("operator") !== "arithmetic")
          throw new Error("Unsupported SVG composite");
        const [k1, k2, k3, k4] = [1, 2, 3, 4].map((n) => numeric(node.getAttribute(`k${n}`) ?? 0));
        code = `let a=${input}(uv,lens);let b=${second}(uv,lens);let c=clamp(a*b*${k1}+a*${k2}+b*${k3}+vec4f(${k4}),vec4f(0),vec4f(1));return vec4f(min(c.rgb,vec3f(c.a)),c.a);`;
        break;
      }
      case "feGaussianBlur": {
        const sigma = Number(node.getAttribute("stdDeviation")) * dpr,
          radius = Math.ceil(sigma * 3);
        const weight = (i: string) => `lens.gaussian[(${i})/4][(${i})%4]`;
        if ((radius * 2 + 1) ** 2 > 28) {
          const count = radius + 1;
          register(
            `${name}_x`,
            `var color=vec4f(0);for(var i=0;i<${count};i++){
            let offset=${weight("i*2")};let w=${weight("i*2+1")};
            color+=${input}(uv+vec2f(offset/(lens.box.z*${dpr}),0),lens)*w;
          }return color;`,
            true,
          );
          code = `var color=vec4f(0);for(var i=0;i<${count};i++){
            let offset=${weight(`i*2+${count * 2}`)};let w=${weight(`i*2+${count * 2 + 1}`)};
            color+=${name}_x(uv+vec2f(0,offset/(lens.box.w*${dpr})),lens)*w;
          }return color;`;
        } else {
          const width = radius * 2 + 1;
          code = `var color=vec4f(0);for(var i=0;i<${width * width};i++){
            let offset=vec2f(f32(i%${width}-${radius}),f32(i/${width}-${radius}));
            let w=${weight("i")};color+=${input}(uv+offset/(lens.box.zw*${dpr}),lens)*w;
          }return color;`;
        }
        break;
      }
      default:
        throw new Error(`Unsupported SVG primitive: ${node.tagName}`);
    }
    register(
      name,
      code,
      ["feDisplacementMap", "feComposite", "feGaussianBlur"].includes(node.tagName),
    );
    if (node.hasAttribute("result")) results.set(node.getAttribute("result")!, name);
    previous = name;
  }
  return { functions: functions.join("\n"), output: previous, caches };
}

function gaussianKernel(sx: number, sy: number) {
  const f = Math.fround,
    rx = Math.ceil(3 * sx),
    ry = Math.ceil(3 * sy),
    dx = f(1 / f(f(2 * sx) * sx)),
    dy = f(1 / f(f(2 * sy) * sy)),
    width = rx * 2 + 1;
  const kernel = new Float32Array(width * (ry * 2 + 1));
  let total = 0;
  for (let x = -rx; x <= rx; x++)
    for (let y = -ry; y <= ry; y++) {
      const value = f(Math.exp(-f(f(x * x * dx) + f(y * y * dy))));
      kernel[(y + ry) * width + x + rx] = value;
      total = f(total + value);
    }
  const scale = f(1 / total);
  for (let i = 0; i < kernel.length; i++) kernel[i] = f(kernel[i] * scale);
  return kernel;
}

function linearKernel(sigma: number) {
  const f = Math.fround,
    r = Math.ceil(3 * sigma),
    denom = f(1 / f(f(2 * sigma) * sigma));
  let total = 0;
  const weights = Array.from({ length: 2 * r + 1 }, (_, i) => {
    const x = i - r,
      v = f(Math.exp(-f(x * x * denom)));
    total = f(total + v);
    return v;
  });
  const scale = f(1 / total);
  for (let i = 0; i < weights.length; i++) weights[i] = f(weights[i] * scale);
  const size = r + 1,
    center = Math.floor(size / 2),
    taps: number[][] = Array(size);
  let source = r,
    lower = center - 1;
  if (r % 2) {
    const w = f(f(weights[source] * 0.5) + weights[source + 1]),
      off = f(weights[source + 1] / w);
    taps[center] = [off, w];
    taps[lower--] = [-off, w];
    source++;
  } else taps[center] = [0, weights[source]];
  source++;
  for (let i = center + 1; i < size; i++, source += 2, lower--) {
    const w = f(weights[source] + weights[source + 1]),
      off = f(f(weights[source + 1] / w) + (source - r));
    taps[i] = [off, w];
    taps[lower] = [-off, w];
  }
  return taps;
}

export async function createRenderer(
  canvas: HTMLCanvasElement,
  background: HTMLElement,
  buttons: HTMLButtonElement[],
  { gpu, dpr }: { gpu: boolean; dpr: number },
) {
  if (dpr !== 1 && dpr !== 2) throw new Error("The prototype validates DPR 1 and 2 only");
  if (canvas.content !== "drawable") throw new Error("HTML-in-Canvas is unavailable");
  const adapter = await navigator.gpu?.requestAdapter();
  if (!adapter) throw new Error("No WebGPU adapter; no software fallback is substituted");
  const device = await adapter.requestDevice();
  const errors: string[] = [];
  device.addEventListener("uncapturederror", (event) => errors.push(event.error.message));
  const format = navigator.gpu.getPreferredCanvasFormat();
  const presentationFormat = dpr === 1 ? format : "rgba16float";
  const context = canvas.getContext("webgpu")!;
  context.configure({ device, format, alphaMode: "premultiplied" });
  const textures: GPUTexture[] = [];
  const texture = (width = canvas.width, height = canvas.height) => {
    const t = device.createTexture({
      size: [width, height],
      format: "rgba8unorm",
      usage:
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });
    textures.push(t);
    return t;
  };
  const sigma = parseFloat(getComputedStyle(buttons[0]).getPropertyValue("--lg-blur"));
  const blurRatio = dpr / 2 ** Math.max(0, Math.ceil(Math.log2((sigma * dpr) / 4))),
    blurTile = 80 * blurRatio;
  const tile = 80 * dpr,
    columns = 10,
    rows = Math.ceil(buttons.length / columns);
  const source = texture(),
    prefix = texture(tile * columns, tile * rows),
    downsample = texture(blurTile * columns, blurTile * rows),
    blurX = texture(blurTile * columns, blurTile * rows),
    blurY = texture(blurTile * columns, blurTile * rows);
  const sampler = device.createSampler({ minFilter: "linear", magFilter: "linear" });
  const pipeline = async (
    code: string,
    vertex = "full",
    blend = false,
    layout: GPUPipelineLayout | "auto" = "auto",
    targetFormat: GPUTextureFormat = format,
  ) => {
    const module = device.createShaderModule({ code });
    const info = await module.getCompilationInfo();
    const failures = info.messages.filter((message) => message.type === "error");
    if (failures.length) throw new Error(failures.map((message) => message.message).join("\n"));
    return device.createRenderPipelineAsync({
      layout,
      vertex: { module, entryPoint: vertex },
      fragment: {
        module,
        entryPoint: "fragment",
        targets: [
          {
            format: targetFormat,
            ...(blend
              ? {
                  blend: {
                    color: { srcFactor: "one", dstFactor: "one-minus-src-alpha" },
                    alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha" },
                  },
                }
              : {}),
          },
        ],
      },
      primitive: { topology: "triangle-list" },
    });
  };
  const backgroundPipeline = await pipeline(`${quad}
    @group(0) @binding(0) var image:texture_2d<f32>;@group(0) @binding(1) var linearSampler:sampler;
    @fragment fn fragment(v:Vertex)->@location(0) vec4f{return textureSampleLevel(image,linearSampler,v.uv,0);}`);
  const group = (p: GPURenderPipeline, entries: GPUBindingResource[]) =>
    device.createBindGroup({
      layout: p.getBindGroupLayout(0),
      entries: entries.map((resource, binding) => ({ binding, resource })),
    });
  const backgroundGroup = group(backgroundPipeline, [source.createView(), sampler]);
  let materialPipeline: GPURenderPipeline,
    materialGroup: GPUBindGroup,
    instances: GPUBuffer,
    blurPipeline: GPURenderPipeline,
    blurGroups: GPUBindGroup[],
    atlas: GPUTexture;
  const cachedPasses: Array<{
    pipeline: GPURenderPipeline;
    group: GPUBindGroup;
    texture: GPUTexture;
  }> = [];
  const kernels = new Map<string, Float32Array>();
  let materialSigma = 0;

  const displays: Array<{
    wrapper: HTMLSpanElement;
    display: HTMLCanvasElement;
    output: GPUCanvasContext;
    button: HTMLButtonElement;
    image: SVGElement;
    nativeFilter: string;
    original: string;
    native: boolean;
  }> = [];
  let nativePipeline: GPURenderPipeline,
    nativeCanvas: HTMLCanvasElement,
    nativeContext: GPUCanvasContext,
    nativeFilters: SVGSVGElement;
  const nativeIndices: number[] = [];
  let shadowCanvas: HTMLCanvasElement, shadowRoot: HTMLDivElement, shadowTexture: GPUTexture;
  const shadowClones: HTMLButtonElement[] = [];
  const shadowTile = 160 * dpr,
    shadowPadding = 48;

  if (gpu) {
    shadowCanvas = document.createElement("canvas");
    shadowCanvas.content = "drawable";
    shadowCanvas.width = shadowTile * columns;
    shadowCanvas.height = shadowTile * rows;
    shadowCanvas.style.cssText =
      "position:fixed;left:0;top:0;width:1px;height:1px;pointer-events:none;z-index:-1";
    shadowRoot = document.createElement("div");
    shadowRoot.setAttribute("drawable", "");
    shadowRoot.style.cssText = `position:relative;width:${160 * columns}px;height:${160 * rows}px`;
    for (const [i, button] of buttons.entries()) {
      const clone = button.cloneNode(false) as HTMLButtonElement;
      clone.removeAttribute("data-testid");
      clone.removeAttribute("id");
      clone.setAttribute("aria-hidden", "true");
      clone.tabIndex = -1;
      Object.assign(clone.style, {
        left: (i % columns) * 160 + shadowPadding + "px",
        top: Math.floor(i / columns) * 160 + shadowPadding + "px",
        background: "transparent",
        backdropFilter: "none",
        filter: "none",
        translate: "none",
        pointerEvents: "none",
      });
      shadowRoot.append(clone);
      shadowClones.push(clone);
    }
    shadowCanvas.inert = true;
    shadowCanvas.setAttribute("aria-hidden", "true");
    shadowCanvas.append(shadowRoot);
    document.body.append(shadowCanvas);
    shadowTexture = texture(shadowCanvas.width, shadowCanvas.height);
    shadowCanvas.getContext("2d");
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    const id = buttons[0].style.getPropertyValue("--lg-filter").match(/#([^")]+)/)?.[1];
    const filter = document.getElementById(id!);
    if (!filter) throw new Error("Fitted production SVG filter is missing");
    const mapUrls = [...filter.querySelectorAll("feImage")].map((node) =>
      node.getAttribute("href"),
    );
    const maps = [];
    for (const url of mapUrls) {
      const bitmap = await createImageBitmap(await (await fetch(url!)).blob());
      const t = texture(bitmap.width, bitmap.height);
      device.queue.copyExternalImageToTexture({ source: bitmap }, { texture: t }, [
        bitmap.width,
        bitmap.height,
      ]);
      bitmap.close();
      maps.push(t);
    }
    materialSigma = Number(
      filter.querySelector("feGaussianBlur")?.getAttribute("stdDeviation") ?? 0,
    );
    const graph = graphCode(filter, mapUrls, dpr);
    const cachedTextures = graph.caches.map(() => {
      const t = device.createTexture({
        size: [tile * columns, tile * rows],
        format,
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
      });
      textures.push(t);
      return t;
    });
    // A shared separable Gaussian precedes the unchanged spectral/material graph.

    const blurCode = `${quad}
      struct Lens { box:vec4f, local:vec4f, surface:vec4f, gaussian:array<vec4f,7>, primary:array<vec4f,12> }
      @group(0) @binding(0) var image:texture_2d<f32>;
      @group(0) @binding(1) var linearSampler:sampler;
      @group(0) @binding(2) var<uniform> axis:vec4f;
      @group(0) @binding(3) var<storage,read> lenses:array<Lens>;
      @group(0) @binding(4) var shadows:texture_2d<f32>;
      fn sourcePixel(point:vec2f,n:u32)->vec4f{
        var c=textureSampleLevel(image,linearSampler,point/vec2f(textureDimensions(image)),0);
        for(var j=0u;j<n;j++){
          let local=point-lenses[j].box.xy*${dpr}+vec2f(${shadowPadding * dpr});
          if(any(local<vec2f(.5))||any(local>vec2f(${shadowTile}-.5))){continue;}
          let p=local+vec2f(f32(j%10)*${shadowTile},f32(j/10)*${shadowTile});
          let s=textureSampleLevel(shadows,linearSampler,p/vec2f(textureDimensions(shadows)),0);
          c=floor((s+c*(1-s.a))*255+vec4f(.5))/255;
        }return c;
      }
      @vertex fn blur(@builtin(vertex_index)i:u32,@builtin(instance_index)n:u32)->Vertex{
        let uv=corner(i);let p=vec2f(f32(n%10),f32(n/10))+uv;
        return Vertex(vec4f(p.x/${columns}*2-1,1-p.y/${rows}*2,0,1),uv,n);
      }
      @fragment fn fragment(v:Vertex)->@location(0) vec4f {
        let lens=lenses[v.instance];let tileOrigin=vec2f(f32(v.instance%10)*${blurTile},f32(v.instance/10)*${blurTile});
        if(axis.z<-.5){
          let origin=vec2f(f32(v.instance%10)*${tile},f32(v.instance/10)*${tile});
          let point=lens.box.xy*${dpr}+v.position.xy-origin-vec2f(11*${dpr});
          return sourcePixel(point,v.instance);
        }
        let local=v.position.xy-tileOrigin-vec2f(11*${blurRatio});
        if(axis.z<.5){
          let extent=floor(lens.box.zw*${dpr});let size=${blurRatio < dpr ? "ceil(extent*" + blurRatio / dpr / 2 + ")*2" : "extent"};let modulo=local-floor(local/(size*2))*(size*2);let mirrored=min(modulo,size*2-modulo);
          let origin=vec2f(f32(v.instance%10)*${tile},f32(v.instance/10)*${tile});
          let point=origin+vec2f(11*${dpr})+clamp(mirrored,vec2f(.5),size-vec2f(.5))*extent/size;
          return textureSampleLevel(image,linearSampler,point/vec2f(textureDimensions(image)),0);
        }
        var color=vec4f(0);
        for(var tap=0;tap<12;tap++){
          let at=select(24,0,axis.z<1.5)+tap*2;
          let offsetValue=lens.primary[at/4][at%4];let weight=lens.primary[(at+1)/4][(at+1)%4];
          let offset=select(vec2f(0,offsetValue),vec2f(offsetValue,0),axis.z<1.5);
          let point=clamp(v.position.xy+offset,tileOrigin+vec2f(.5),tileOrigin+vec2f(${blurTile}-.5));
          color+=textureSampleLevel(image,linearSampler,point/vec2f(textureDimensions(image)),0)*weight;
        }return color;
      }`;
    // Intermediate textures use rgba8unorm, matching the SVG graph's 8-bit fields.
    const module = device.createShaderModule({ code: blurCode });
    blurPipeline = await device.createRenderPipelineAsync({
      layout: "auto",
      vertex: { module, entryPoint: "blur" },
      fragment: { module, entryPoint: "fragment", targets: [{ format: "rgba8unorm" }] },
    });
    const axes = [
      [0, 0, -1, 0],
      [1 / canvas.width, 0, 0, 0],
      [0, 1 / canvas.height, 1, 0],
      [0, 0, 2, 0],
    ].map((value) => {
      const buffer = device.createBuffer({
        size: 16,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(buffer, 0, new Float32Array(value));
      return buffer;
    });
    instances = device.createBuffer({
      size: buttons.length * 352,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    blurGroups = [
      group(blurPipeline, [
        source.createView(),
        sampler,
        { buffer: axes[0] },
        { buffer: instances },
        shadowTexture.createView(),
      ]),
      group(blurPipeline, [
        prefix.createView(),
        sampler,
        { buffer: axes[1] },
        { buffer: instances },
        shadowTexture.createView(),
      ]),
      group(blurPipeline, [
        downsample.createView(),
        sampler,
        { buffer: axes[2] },
        { buffer: instances },
        shadowTexture.createView(),
      ]),
      group(blurPipeline, [
        blurX.createView(),
        sampler,
        { buffer: axes[3] },
        { buffer: instances },
        shadowTexture.createView(),
      ]),
    ];
    const materialLayout = device.createPipelineLayout({
      bindGroupLayouts: [
        device.createBindGroupLayout({
          entries: [
            { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: {} },
            { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
            {
              binding: 2,
              visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
              buffer: { type: "read-only-storage" },
            },
            ...Array.from({ length: maps.length + cachedTextures.length }, (_, i) => ({
              binding: 3 + i,
              visibility: GPUShaderStage.FRAGMENT,
              texture: {},
            })),
          ],
        }),
      ],
    });
    const materialCode = `${quad}
      struct Lens { box:vec4f, local:vec4f, surface:vec4f, gaussian:array<vec4f,7>, primary:array<vec4f,12> }
      @group(0) @binding(0) var backdrop:texture_2d<f32>;
      @group(0) @binding(1) var linearSampler:sampler;
      @group(0) @binding(2) var<storage,read> lenses:array<Lens>;
      ${maps.map((_, i) => `@group(0) @binding(${3 + i}) var map${i}:texture_2d<f32>;`).join("\n")}
      ${cachedTextures.map((_, i) => `@group(0) @binding(${3 + maps.length + i}) var cache${i}:texture_2d<f32>;`).join("\n")}
      fn source(uv:vec2f,lens:Lens)->vec4f{
        let n=u32(lens.surface.w);let tileOrigin=vec2f(f32(n%10)*${blurTile},f32(n/10)*${blurTile});
        let size=floor(lens.box.zw*${dpr});let before=floor(uv*lens.box.zw*${dpr})+vec2f(.5);let modulo=before-floor(before/(size*2))*(size*2);let mirrored=min(modulo,size*2-modulo);
        let lowSize=${blurRatio < dpr ? "ceil(size*" + blurRatio / dpr / 2 + ")*2" : "size"};let point=tileOrigin+vec2f(11*${blurRatio})+mirrored*lowSize/size;
        let color=textureSampleLevel(backdrop,linearSampler,point/vec2f(textureDimensions(backdrop)),0);return color;
      }
      ${graph.functions}
      @vertex fn glass(@builtin(vertex_index) i:u32,@builtin(instance_index) n:u32)->Vertex {
        let lens=lenses[n];let uv=corner(i)*(vec2f(1)+vec2f(4)/lens.box.zw)-vec2f(2)/lens.box.zw;let p=vec2f(f32(n%10)*80,f32(n/10)*80)+vec2f(2)+lens.surface.yz+uv*lens.box.zw;
        return Vertex(vec4f(p.x/${columns * 80}*2-1,1-p.y/${rows * 80}*2,0,1),uv,n);
      }
      @fragment fn fragment(v:Vertex)->@location(0) vec4f{
        let lens=lenses[v.instance];let p=v.uv*lens.local.xy-lens.local.xy*.5;
        let q=abs(p)-(lens.local.xy*.5-vec2f(lens.local.z));
        let distance=length(max(q,vec2f(0)))+min(max(q.x,q.y),0)-lens.local.z;
        let normal=normalize(p);let screenGradient=normal*lens.local.xy/(lens.box.zw*${dpr});var coverage=clamp(.5-distance/length(screenGradient),0,1);
        let uv=(v.position.xy-vec2f(f32(v.instance%10)*${tile},f32(v.instance/10)*${tile})-(vec2f(2)+lens.surface.yz)*${dpr})/(lens.box.zw*${dpr});let color=${graph.output}(uv,lens);
        return vec4f(color.rgb*coverage,color.a*coverage);
      }`;
    materialPipeline = await pipeline(
      materialCode,
      "glass",
      true,
      materialLayout,
      presentationFormat,
    );
    const nativeCode =
      materialCode.slice(0, materialCode.indexOf("@vertex fn glass")) +
      `
      @vertex fn glass(@builtin(vertex_index)i:u32,@builtin(instance_index)n:u32)->Vertex{
        let lens=lenses[n];let uv=corner(i)*(vec2f(1)+vec2f(4)/lens.box.zw)-vec2f(2)/lens.box.zw;
        let p=vec2f(2)+lens.surface.yz+uv*lens.box.zw;
        return Vertex(vec4f(p.x/80*2-1,1-p.y/80*2,0,1),uv,n);
      }
      @fragment fn fragment(v:Vertex)->@location(0)vec4f{
        let lens=lenses[v.instance];let slot=u32(lens.surface.x);
        let origin=vec2f(f32(slot%10)*${tile},f32(slot/10)*${tile});
        let uv=(v.position.xy-origin-(vec2f(2)+lens.surface.yz)*${dpr})/(lens.box.zw*${dpr});
        return ${graph.output}(uv,lens);
      }`;
    nativePipeline = await pipeline(nativeCode, "glass", false, materialLayout, format);
    for (const [i, stage] of graph.caches.entries()) {
      const body =
        materialCode.slice(0, materialCode.indexOf("@fragment fn fragment")) +
        `
        @fragment fn fragment(v:Vertex)->@location(0)vec4f{
          let lens=lenses[v.instance];let origin=vec2f(f32(v.instance%10)*${tile},f32(v.instance/10)*${tile});
          let uv=(v.position.xy-origin-(vec2f(2)+lens.surface.yz)*${dpr})/(lens.box.zw*${dpr});
          let pixel=uv*lens.box.zw*${dpr};let low=floor(-lens.box.zw*${dpr}/lens.local.xy);let high=ceil((vec2f(1)+vec2f(1)/lens.local.xy)*lens.box.zw*${dpr});if(any(pixel<low)||any(pixel>=high)){return vec4f(0);}
          return ${stage.name}(uv,lens);
        }`;
      const p = await pipeline(body, "glass", false, materialLayout);
      const g = group(p, [
        blurY.createView(),
        sampler,
        { buffer: instances },
        ...maps.map((t) => t.createView()),
        ...cachedTextures.map((t, n) => (i === n ? blurY : t).createView()),
      ]);
      cachedPasses.push({ pipeline: p, group: g, texture: cachedTextures[i] });
    }
    materialGroup = group(materialPipeline, [
      blurY.createView(),
      sampler,
      { buffer: instances },
      ...maps.map((t) => t.createView()),
      ...cachedTextures.map((t) => t.createView()),
    ]);
    atlas = device.createTexture({
      size: [tile * columns, tile * rows],
      format: presentationFormat,
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    });
    textures.push(atlas);
    nativeCanvas = document.createElement("canvas");
    nativeCanvas.width = nativeCanvas.height = tile;
    nativeCanvas.style.cssText =
      "position:fixed;left:0;top:0;width:1px;height:1px;pointer-events:none;z-index:-1";
    document.body.append(nativeCanvas);
    nativeContext = nativeCanvas.getContext("webgpu")!;
    nativeContext.configure({ device, format, alphaMode: "premultiplied" });
    nativeFilters = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    nativeFilters.style.cssText = "position:absolute;width:0;height:0";
    document.body.append(nativeFilters);
    for (const [i, button] of buttons.entries()) {
      const copied = filter.cloneNode(false) as SVGElement;
      copied.id = `shared-gpu-native-${id}-${i}`;
      const image = document.createElementNS(nativeFilters.namespaceURI, "feImage") as SVGElement;
      image.setAttribute("preserveAspectRatio", "none");
      copied.append(image);
      nativeFilters.append(copied);
      const css = getComputedStyle(button),
        wrapper = document.createElement("span"),
        display = document.createElement("canvas");
      wrapper.style.position = "absolute";
      wrapper.style.borderRadius = css.borderRadius;
      display.width = display.height = 1;
      display.style.cssText = "position:absolute;transform-origin:0 0;pointer-events:none";
      wrapper.append(display);
      button.before(wrapper);
      wrapper.append(button);
      wrapper.style.filter = "opacity(1)";
      const output = display.getContext("webgpu")!;
      output.configure({
        device,
        format: presentationFormat,
        alphaMode: "premultiplied",
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST,
      });
      displays.push({
        wrapper,
        display,
        output,
        button,
        image,
        nativeFilter: copied.id,
        original: button.style.backdropFilter,
        native: false,
      });
      button.style.backdropFilter = "none";
    }
  }
  const stats = {
    captures: 0,
    nativeExports: 0,
    nativeExportPixels: 0,
    maxNativeLenses: 0,
    submissions: 0,
    cpu: [] as number[],
    completion: [] as number[],
    adapter: { vendor: adapter.info.vendor, architecture: adapter.info.architecture },
    errors,
  };
  let first = true,
    disposed = false,
    shadowDirty = true;
  function paint(event: Event & { changedElements?: Element[] }) {
    if (disposed) return;
    const start = performance.now();
    if (first || event.changedElements?.includes(background)) {
      device.queue.drawElementImageToTexture(
        { source: background },
        {
          texture: source,
          size: [canvas.width, canvas.height],
          colorSpace: "srgb",
          premultipliedAlpha: true,
        },
      );
      stats.captures++;
      first = false;
    }
    const encoder = device.createCommandEncoder();
    const pass = (view: GPUTextureView, p: GPURenderPipeline, g: GPUBindGroup, count = 1) => {
      const render = encoder.beginRenderPass({
        colorAttachments: [{ view, loadOp: "clear", storeOp: "store", clearValue: [0, 0, 0, 0] }],
      });
      render.setPipeline(p);
      render.setBindGroup(0, g);
      render.draw(6, count);
      return render;
    };
    const render = pass(
      context.getCurrentTexture().createView(),
      backgroundPipeline,
      backgroundGroup,
    );
    render.end();
    if (gpu) {
      const origin = canvas.getBoundingClientRect();
      const data = new Float32Array(buttons.length * 88);
      nativeIndices.length = 0;
      for (const [i, button] of buttons.entries()) {
        const b = button.getBoundingClientRect(),
          style = getComputedStyle(button);
        const scales = style.scale.split(" ").map(Number);
        const sx = scales[0] || 1,
          sy = scales[1] || sx;
        const entry = displays[i],
          { wrapper, display, image } = entry;
        const localX = b.left - origin.left,
          localY = b.top - origin.top;
        const useNative =
          sx !== 1 ||
          sy !== 1 ||
          !Number.isInteger(localX) ||
          !Number.isInteger(localY) ||
          style.filter !== "none";
        const slot = nativeIndices.length;
        if (useNative) nativeIndices.push(i);
        if (useNative !== entry.native) {
          entry.native = useNative;
          if (useNative) {
            wrapper.before(button);
            wrapper.style.display = "none";
            button.style.backdropFilter = `url(#${entry.nativeFilter})`;
          } else {
            wrapper.append(button);
            wrapper.style.display = "";
            button.style.backdropFilter = "none";
            image.removeAttribute("href");
          }
        }
        const styles = { left: "0px", top: "0px", width: "0px", height: "0px" };
        for (const [key, value] of Object.entries(styles) as Array<[keyof typeof styles, string]>)
          if (wrapper.style[key] !== value) wrapper.style[key] = value;
        const width = (Math.ceil(b.width) + 5) * dpr,
          height = (Math.ceil(b.height) + 5) * dpr;
        if (width > tile || height > tile) throw new Error("Lens exceeds atlas tile");
        if (display.width !== width) display.width = width;
        if (display.height !== height) display.height = height;
        Object.assign(display.style, {
          width: width / dpr + "px",
          height: height / dpr + "px",
          left: Math.floor(b.left - origin.left) - 2 + "px",
          top: Math.floor(b.top - origin.top) - 2 + "px",
          filter: style.filter,
        });
        data.set(
          [
            Math.floor((b.left - origin.left) * dpr) / dpr,
            Math.floor((b.top - origin.top) * dpr) / dpr,
            Math.fround(Math.fround(sx) * button.offsetWidth),
            Math.fround(Math.fround(sy) * button.offsetHeight),
            button.offsetWidth,
            button.offsetHeight,
            Math.min(button.offsetWidth, button.offsetHeight) / 2,
            0,
            slot,
            Math.floor((b.left - origin.left) * dpr) / dpr - Math.floor(b.left - origin.left),
            Math.floor((b.top - origin.top) * dpr) / dpr - Math.floor(b.top - origin.top),
            i,
          ],
          i * 88,
        );
        const lowSize = (size: number) =>
          blurRatio < dpr
            ? Math.ceil((Math.floor(size * dpr) * blurRatio) / dpr / 2) * 2
            : Math.floor(size * dpr);
        const primaryX = Math.fround(
            (((sigma * dpr * b.width) / button.offsetWidth) * lowSize(b.width)) /
              Math.floor(b.width * dpr),
          ),
          primaryY = Math.fround(
            (((sigma * dpr * b.height) / button.offsetHeight) * lowSize(b.height)) /
              Math.floor(b.height * dpr),
          );
        const primaryWeightsX = linearKernel(primaryX).flat(),
          primaryWeightsY = linearKernel(primaryY).flat();
        if (primaryWeightsX.length > 24 || primaryWeightsY.length > 24)
          throw new Error("Blur exceeds the supported kernel size");
        data.set(primaryWeightsX, i * 88 + 40);
        data.set(primaryWeightsY, i * 88 + 64);
        if (materialSigma) {
          const sx = Math.fround(
              Math.fround(materialSigma * dpr) * Math.fround(b.width / button.offsetWidth),
            ),
            sy = Math.fround(
              Math.fround(materialSigma * dpr) * Math.fround(b.height / button.offsetHeight),
            ),
            key = sx + "," + sy;
          let weights = kernels.get(key);
          if (!weights) {
            weights =
              dpr === 1
                ? gaussianKernel(sx, sy)
                : new Float32Array([...linearKernel(sx).flat(), ...linearKernel(sy).flat()]);
            if (kernels.size > 128) kernels.clear();
            kernels.set(key, weights);
          }
          if (weights.length > 28)
            throw new Error("Material blur exceeds the supported kernel size");
          data.set(weights, i * 88 + 12);
        }
      }
      if (nativeIndices.length) {
        const width = Math.min(nativeIndices.length, columns) * tile,
          height = Math.ceil(nativeIndices.length / columns) * tile;
        if (nativeCanvas.width !== width) nativeCanvas.width = width;
        if (nativeCanvas.height !== height) nativeCanvas.height = height;
        for (const [slot, i] of nativeIndices.entries()) {
          const { button, image } = displays[i],
            b = button.getBoundingClientRect(),
            x = data[i * 88 + 9],
            y = data[i * 88 + 10],
            scaleX = (b.width * dpr) / button.offsetWidth,
            scaleY = (b.height * dpr) / button.offsetHeight;
          const values = {
            x: -((slot % columns) * tile + (2 + x) * dpr) / scaleX,
            y: -(Math.floor(slot / columns) * tile + (2 + y) * dpr) / scaleY,
            width: nativeCanvas.width / scaleX,
            height: nativeCanvas.height / scaleY,
          };
          for (const [k, v] of Object.entries(values))
            if (image.getAttribute(k) !== String(v)) image.setAttribute(k, String(v));
        }
      }
      device.queue.writeBuffer(instances, 0, data);
      if (shadowDirty)
        device.queue.drawElementImageToTexture(
          { source: shadowRoot },
          {
            texture: shadowTexture,
            size: [shadowCanvas.width, shadowCanvas.height],
            colorSpace: "srgb",
            premultipliedAlpha: true,
          },
        );
      shadowDirty = false;
      pass(prefix.createView(), blurPipeline, blurGroups[0], buttons.length).end();
      pass(downsample.createView(), blurPipeline, blurGroups[1], buttons.length).end();
      pass(blurX.createView(), blurPipeline, blurGroups[2], buttons.length).end();
      pass(blurY.createView(), blurPipeline, blurGroups[3], buttons.length).end();
      for (const stage of cachedPasses)
        pass(stage.texture.createView(), stage.pipeline, stage.group, buttons.length).end();
      pass(atlas.createView(), materialPipeline, materialGroup, buttons.length).end();
      for (const [i, { display, output, native }] of displays.entries())
        if (!native)
          encoder.copyTextureToTexture(
            { texture: atlas, origin: [(i % columns) * tile, Math.floor(i / columns) * tile] },
            { texture: output.getCurrentTexture() },
            [display.width, display.height],
          );
    }
    if (gpu && nativeIndices.length) {
      const render = pass(
        nativeContext.getCurrentTexture().createView(),
        nativePipeline,
        materialGroup,
        0,
      );
      for (const [slot, i] of nativeIndices.entries()) {
        render.setViewport(
          (slot % columns) * tile,
          Math.floor(slot / columns) * tile,
          tile,
          tile,
          0,
          1,
        );
        render.draw(6, 1, 0, i);
      }
      render.end();
    }
    device.queue.submit([encoder.finish()]);
    if (gpu && nativeIndices.length) {
      const url = nativeCanvas.toDataURL("image/png");
      for (const i of nativeIndices) displays[i].image.setAttribute("href", url);
      stats.nativeExports++;
      stats.nativeExportPixels += nativeCanvas.width * nativeCanvas.height;
      stats.maxNativeLenses = Math.max(stats.maxNativeLenses, nativeIndices.length);
    }
    stats.submissions++;
    stats.cpu.push(performance.now() - start);
    void device.queue
      .onSubmittedWorkDone()
      .then(() => stats.completion.push(performance.now() - start));
  }
  canvas.addEventListener("paint", paint as EventListener);
  const syncShadows = () => {
    if (!gpu) return;
    const origin = canvas.getBoundingClientRect();
    for (const [i, button] of buttons.entries()) {
      const b = button.getBoundingClientRect(),
        css = getComputedStyle(button),
        clone = shadowClones[i];
      const x = b.left - origin.left,
        y = b.top - origin.top;
      const values = {
        left:
          (i % columns) * 160 +
          shadowPadding +
          (b.width - button.offsetWidth) / 2 +
          x -
          Math.floor(x * dpr) / dpr +
          "px",
        top:
          Math.floor(i / columns) * 160 +
          shadowPadding +
          (b.height - button.offsetHeight) / 2 +
          y -
          Math.floor(y * dpr) / dpr +
          "px",
        scale: css.scale,
      };
      for (const [key, value] of Object.entries(values) as Array<[keyof typeof values, string]>)
        if (clone.style[key] !== value) {
          clone.style[key] = value;
          shadowDirty = true;
        }
    }
  };
  const observer = new MutationObserver(() => {
    syncShadows();
    canvas.requestPaint();
  });
  if (gpu) for (const button of buttons) observer.observe(button, { attributes: true });
  const request = () => canvas.requestPaint();
  if (gpu) {
    document.addEventListener("scroll", request, true);
    document.addEventListener("pointerdown", request);
    document.addEventListener("pointerup", request);
  }
  canvas.requestPaint();
  return {
    stats,
    settled: async () => {
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
      await device.queue.onSubmittedWorkDone();
    },
    dispose() {
      disposed = true;
      observer.disconnect();
      canvas.removeEventListener("paint", paint as EventListener);
      document.removeEventListener("scroll", request, true);
      document.removeEventListener("pointerdown", request);
      document.removeEventListener("pointerup", request);
      displays.forEach(({ wrapper, button, original }) => {
        wrapper.before(button);
        wrapper.remove();
        button.style.backdropFilter = original;
      });
      nativeCanvas?.remove();
      nativeFilters?.remove();
      shadowCanvas?.remove();
      textures.forEach((t) => t.destroy());
      device.destroy();
    },
  };
}
