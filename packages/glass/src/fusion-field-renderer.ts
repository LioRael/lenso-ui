import {
  fusionFields,
  type FusionFieldInput,
  type FusionFieldReply,
  type FusionFields,
} from "./fusion-fields.js";

type Fields = FusionFields;
type Pending = { resolve: (fields: Fields | undefined) => void; reject: (error: Error) => void };
const requests = new Map<number, Pending>();
let worker: Worker | undefined;
let users = 0;
let nextRequest = 0;
let nextPlane = 0;
let failed = false;

function fail(error: Error) {
  worker?.terminate();
  worker = undefined;
  failed = true;
  for (const pending of requests.values()) pending.reject(error);
  requests.clear();
}

function acquire() {
  users++;
  if (worker || failed || typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined")
    return;
  try {
    worker = new Worker(new URL("./fusion-worker.js", import.meta.url), { type: "module" });
    worker.onmessage = ({ data }: MessageEvent<FusionFieldReply & { id: number }>) => {
      if (data.error !== undefined) fail(new Error(data.error));
      else {
        requests.get(data.id)?.resolve(data.fields);
        requests.delete(data.id);
      }
    };
    worker.onerror = (event) => {
      event.preventDefault();
      fail(new Error(event.message));
    };
    worker.onmessageerror = () => fail(new Error("Unable to receive the fusion field"));
  } catch {
    failed = true;
  }
}

/** Share one optical thread, with one in-flight field per plane. The caller
 * coalesces newer geometry instead of building a queue of obsolete frames. */
export function createFusionFieldRenderer() {
  acquire();
  const plane = nextPlane++;
  let stopped = false;
  let request: number | undefined;
  return {
    get backend() {
      return worker ? "worker" : "main";
    },
    async render(input: FusionFieldInput): Promise<Fields | undefined> {
      if (stopped) return undefined;
      if (worker) {
        try {
          const id = nextRequest++;
          request = id;
          return await new Promise<Fields | undefined>((resolve, reject) => {
            requests.set(id, { resolve, reject });
            worker!.postMessage({ id, input, plane });
          });
        } catch {
          fail(new Error("Unable to prepare the fusion field in a worker"));
        } finally {
          if (request !== undefined) requests.delete(request);
          request = undefined;
        }
      }
      return stopped ? undefined : fusionFields(input);
    },
    destroy() {
      if (stopped) return;
      stopped = true;
      worker?.postMessage({ release: plane });
      if (request !== undefined) {
        requests.get(request)?.resolve(undefined);
        requests.delete(request);
      }
      if (--users === 0) {
        worker?.terminate();
        worker = undefined;
        failed = false;
      }
    },
  };
}
