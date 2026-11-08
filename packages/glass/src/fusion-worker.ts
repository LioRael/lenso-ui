import { fusionFields, type FusionFieldInput, type FusionFieldReply } from "./fusion-fields.js";
import { createGPUFusionFields } from "./fusion-gpu.js";
const gpuFields = createGPUFusionFields();
const scope = globalThis as unknown as {
  onmessage: (
    event: MessageEvent<
      { id: number; input: FusionFieldInput; plane: number } | { release: number }
    >,
  ) => void;
  postMessage: (reply: FusionFieldReply & { id: number }) => void;
};
scope.onmessage = async ({ data }) => {
  if ("release" in data) {
    gpuFields.release(data.release);
    return;
  }
  const { id, input, plane } = data;
  try {
    const prepared = await gpuFields.prepare(input, plane);
    if (!gpuFields.active(plane)) return;
    const fields = prepared ?? (await fusionFields(input));
    scope.postMessage({ id, fields });
  } catch (error) {
    scope.postMessage({ id, error: error instanceof Error ? error.message : String(error) });
  }
};
