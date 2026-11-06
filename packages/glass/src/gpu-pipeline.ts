interface Pipelines {
  compute: Map<string, Promise<GPUComputePipeline>>;
  render: Map<string, Promise<GPURenderPipeline>>;
}

const devices = new WeakMap<GPUDevice, Pipelines>();
const LIMIT = 16;

function pipelines(device: GPUDevice) {
  let cache = devices.get(device);
  if (!cache) {
    cache = { compute: new Map(), render: new Map() };
    devices.set(device, cache);
    void device.lost.then(() => devices.delete(device));
  }
  return cache;
}

// Programs can be reused even after a surface releases its textures.
// Shader source includes every dimension and material coefficient.
function compiled<T>(cache: Map<string, Promise<T>>, code: string, create: () => Promise<T>) {
  let result = cache.get(code);
  if (result) cache.delete(code);
  else {
    result = create();
    const pending = result;
    void result.catch(() => {
      if (cache.get(code) === pending) cache.delete(code);
    });
  }
  cache.set(code, result);
  while (cache.size > LIMIT) cache.delete(cache.keys().next().value!);
  return result;
}

export function computePipeline(device: GPUDevice, code: string) {
  return compiled(pipelines(device).compute, code, async () => {
    const module = device.createShaderModule({ code });
    const info = await module.getCompilationInfo();
    const errors = info.messages.filter((message) => message.type === "error");
    if (errors.length) throw new Error(errors.map((error) => error.message).join("\n"));
    return device.createComputePipelineAsync({
      layout: "auto",
      compute: { module, entryPoint: "main" },
    });
  });
}

export function renderPipeline(device: GPUDevice, code: string) {
  return compiled(pipelines(device).render, code, () => {
    const module = device.createShaderModule({ code });
    return device.createRenderPipelineAsync({
      layout: "auto",
      vertex: { module, entryPoint: "vertex" },
      fragment: { module, entryPoint: "fragment", targets: [{ format: "rgba8unorm" }] },
    });
  });
}
