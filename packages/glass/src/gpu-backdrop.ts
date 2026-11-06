import {
  BackdropPaint,
  createBackdropAtlas,
  type CaptureShape,
  type CaptureTile,
} from "./gpu-capture.js";
import { createOpticsBatch, readOptics, type Optics } from "./gpu-optics.js";
import type { BackdropChange, BackdropReads } from "./backdrop-scheduler.js";
import * as stylex from "@stylexjs/stylex";
import { glassStyles } from "@lenso/tokens/glass";

interface State extends CaptureShape, CaptureTile {
  key: string;
  radius: string;
  optics: Optics;
  native: boolean;
}
interface Entry {
  id: number;
  element: HTMLElement;
  source: Source;
  layer: HTMLElement;
  optics: HTMLElement;
  state?: State;
  visible: boolean;
  stopped: boolean;
  invalidateNative(): void;
  group?: Group;
  view?: { canvas: HTMLCanvasElement; context: GPUCanvasContext; padding: number; ready: boolean };
}
interface Source {
  id: number;
  paint: BackdropPaint;
  entries: Set<Entry>;
}
let nextId = 0;
let manager: Manager | undefined;
const opticsReads = new WeakMap<BackdropReads, Map<string, Optics | undefined>>();

function fittedOptics(filter: string, reads: BackdropReads) {
  let fitted = opticsReads.get(reads);
  if (!fitted) opticsReads.set(reads, (fitted = new Map()));
  if (!fitted.has(filter)) fitted.set(filter, readOptics(filter));
  return fitted.get(filter);
}

function axisAligned(element: HTMLElement, reads: BackdropReads) {
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    const style = reads.style(node);
    if (style.rotate !== "none" && parseFloat(style.rotate) !== 0) return false;
    if (style.scale !== "none" && style.scale.split(" ").some((value) => Number(value) <= 0))
      return false;
    if (style.transform === "none") continue;
    const matrix = new DOMMatrixReadOnly(style.transform);
    if (!matrix.is2D || matrix.b !== 0 || matrix.c !== 0 || matrix.a <= 0 || matrix.d <= 0)
      return false;
  }
  return true;
}

function native(entry: Entry, value: boolean) {
  if (!entry.view) return;
  const { canvas, padding } = entry.view;
  const clip = `inset(${padding}px round ${entry.state?.radius ?? entry.optics.style.borderRadius})`;
  if (canvas.style.clipPath !== clip) canvas.style.clipPath = clip;
  const show = !value && entry.view.ready && entry.visible;
  if (entry.view.canvas.hidden === show) entry.view.canvas.hidden = !show;
  const display = show ? "none" : "";
  if (entry.optics.style.display !== display) entry.optics.style.display = display;
  const previous = entry.layer.hasAttribute("data-glass-renderer");
  if (show && !previous) entry.layer.setAttribute("data-glass-renderer", "gpu");
  else if (!show && previous) {
    entry.layer.removeAttribute("data-glass-renderer");
    entry.invalidateNative();
  }
}

type Backend = Awaited<ReturnType<typeof createOpticsBatch>>;

class Group {
  disposed = false;
  pending = false;
  again = false;
  private reusable = true;
  private frame = 0;
  private device?: GPUDevice;
  private backend?: Awaited<ReturnType<typeof createOpticsBatch>>;
  private atlas?: ReturnType<typeof createBackdropAtlas>;
  constructor(
    readonly owner: Manager,
    readonly key: string,
    readonly entries: Entry[],
    readonly signature: string,
  ) {}

  async start() {
    const state = this.entries[0]!.state!;
    const shape = { ...state, count: this.entries.length };
    try {
      const device = await this.owner.device();
      if (this.disposed) return;
      const backend =
        this.owner.takeBackend(`${this.key}:${this.entries.length}`) ??
        (await createOpticsBatch(device, state.optics, shape));
      if (this.disposed) {
        backend.dispose();
        return;
      }
      this.device = device;
      this.backend = backend;
      this.atlas = createBackdropAtlas(shape);
      for (const entry of this.entries) {
        const canvas = document.createElement("canvas");
        const padding = backend.padding;
        canvas.width = (shape.width + 2 * padding) * shape.dpr;
        canvas.height = (shape.height + 2 * padding) * shape.dpr;
        canvas.className = stylex.props(glassStyles.copyFrame).className ?? "";
        canvas.style.width = `${shape.width + 2 * padding}px`;
        canvas.style.height = `${shape.height + 2 * padding}px`;
        canvas.style.top = canvas.style.left = `${-padding}px`;
        canvas.style.clipPath = padding
          ? `inset(${padding}px round ${entry.optics.style.borderRadius})`
          : entry.optics.style.clipPath;
        canvas.hidden = true;
        canvas.setAttribute("aria-hidden", "true");
        const context = canvas.getContext("webgpu");
        if (!context) throw new Error("WebGPU canvas unavailable");
        context.configure({
          device,
          format: "rgba8unorm",
          alphaMode: "premultiplied",
          usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST,
        });
        entry.layer.append(canvas);
        entry.view = { canvas, context, padding, ready: false };
        entry.group = this;
      }
      this.request();
    } catch (error) {
      this.reusable = false;
      this.owner.failed.set(this.key, this.signature);
      this.owner.errors.push(String(error));
      if (this.owner.errors.length > 8) this.owner.errors.shift();
      this.dispose();
    }
  }

  request() {
    if (this.disposed || !this.backend || this.frame) return;
    if (this.pending) {
      this.again = true;
      return;
    }
    this.pending = true;
    void this.draw()
      .catch((error: unknown) => {
        this.reusable = false;
        this.owner.failed.set(this.key, this.signature);
        this.owner.errors.push(String(error));
        if (this.owner.errors.length > 8) this.owner.errors.shift();
        this.dispose();
      })
      .finally(() => {
        this.pending = false;
        if (this.again) {
          this.again = false;
          if (!this.disposed)
            this.frame = requestAnimationFrame(() => {
              this.frame = 0;
              this.request();
            });
        }
      });
  }

  private async draw() {
    if (
      this.disposed ||
      document.hidden ||
      !this.entries.some(
        (entry) =>
          entry.visible && !entry.stopped && entry.state?.key === this.key && !entry.state.native,
      )
    )
      return;
    const state = this.entries[0]!.source.paint.snapshot();
    const change = await this.atlas!.update(
      state,
      this.entries.map((entry) => entry.state!),
    );
    if (this.disposed) return;
    const encoder = this.device!.createCommandEncoder();
    if (change) {
      this.backend!.update(encoder, change.pixels, change.indices, change.columns);
      this.owner.captures++;
    }
    const dirty = new Set(change?.indices);
    let submitted = !!change;
    for (const [index, entry] of this.entries.entries()) {
      if (!entry.view || entry.stopped || entry.state?.key !== this.key) continue;
      if (entry.state.native) continue;
      if (!change && !entry.view.ready) continue;
      if (dirty.has(index) || !entry.view.ready || entry.view.canvas.hidden) {
        this.backend!.copy(encoder, index, entry.view.context.getCurrentTexture());
        submitted = true;
        entry.view.ready = true;
      }
    }
    if (submitted) {
      this.device!.queue.submit([encoder.finish()]);
      this.owner.submissions++;
    }
    for (const entry of this.entries) native(entry, !entry.state || entry.state.native);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    for (const entry of this.entries) {
      if (entry.group !== this) continue;
      native(entry, true);
      entry.view?.context.unconfigure();
      entry.view?.canvas.remove();
      entry.group = undefined;
      entry.view = undefined;
    }
    this.atlas?.dispose();
    if (this.backend) {
      if (this.reusable && this.device && this.entries.every((entry) => entry.stopped))
        this.owner.retainBackend(`${this.key}:${this.entries.length}`, this.backend, this.device);
      else this.backend.dispose();
      this.backend = undefined;
    }
  }
}

class Manager {
  sources = new Map<HTMLElement, Source>();
  groups = new Map<string, Group>();
  failed = new Map<string, string>();
  errors: string[] = [];
  captures = 0;
  submissions = 0;
  private idleBackends = new Map<
    string,
    { backend: Backend; timer: ReturnType<typeof setTimeout> }
  >();
  private idleBytes = 0;
  private currentDevice?: GPUDevice;
  private pendingDevice?: Promise<GPUDevice>;
  private queued = false;
  private disposed = false;
  private recovery?: ReturnType<typeof setTimeout>;
  private recoveries = 0;
  private recovering = false;

  takeBackend(key: string) {
    const cached = this.idleBackends.get(key);
    if (!cached) return;
    clearTimeout(cached.timer);
    this.idleBackends.delete(key);
    this.idleBytes -= cached.backend.bytes;
    return cached.backend;
  }

  retainBackend(key: string, backend: Backend, device: GPUDevice) {
    const limit = 64 * 1024 * 1024;
    if (
      this.disposed ||
      this.recovering ||
      this.currentDevice !== device ||
      backend.bytes > limit
    ) {
      backend.dispose();
      return;
    }
    this.takeBackend(key)?.dispose();
    while (this.idleBackends.size >= 4 || this.idleBytes + backend.bytes > limit) {
      const first = this.idleBackends.keys().next().value!;
      this.takeBackend(first)!.dispose();
    }
    const timer = setTimeout(() => this.takeBackend(key)?.dispose(), 60_000);
    this.idleBackends.set(key, { backend, timer });
    this.idleBytes += backend.bytes;
  }

  private clearBackends() {
    for (const key of this.idleBackends.keys()) this.takeBackend(key)!.dispose();
  }

  device(): Promise<GPUDevice> {
    if (this.currentDevice) return Promise.resolve(this.currentDevice);
    if (!this.pendingDevice)
      this.pendingDevice = (async () => {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) throw new Error("No WebGPU adapter");
        const device = await adapter.requestDevice();
        if (this.disposed) {
          device.destroy();
          throw new Error("Shared glass was unmounted during initialization");
        }
        this.currentDevice = device;
        const lost = () => {
          if (this.currentDevice !== device || this.disposed) return;
          this.currentDevice = undefined;
          this.pendingDevice = undefined;
          this.recovering = true;
          for (const group of this.groups.values()) group.dispose();
          this.groups.clear();
          this.clearBackends();
          // Native copies remain live during recovery. Avoid an adapter failure loop.
          if (this.recoveries++ < 1)
            this.recovery = setTimeout(() => {
              this.recovering = false;
              this.failed.clear();
              this.request();
            }, 1000);
        };
        void device.lost.then(lost);
        device.addEventListener("uncapturederror", (event) => {
          this.errors.push(event.error.message);
          if (this.errors.length > 8) this.errors.shift();
          lost();
          device.destroy();
        });
        return device;
      })();
    return this.pendingDevice;
  }

  request() {
    if (this.queued || this.disposed) return;
    this.queued = true;
    queueMicrotask(() => {
      this.queued = false;
      if (this.disposed || this.recovering) return;
      const desired = new Map<string, Entry[]>();
      for (const source of this.sources.values())
        for (const entry of source.entries) {
          if (!entry.state || !entry.visible || entry.stopped) continue;
          const group = desired.get(entry.state.key) ?? [];
          group.push(entry);
          desired.set(entry.state.key, group);
        }
      for (const key of this.failed.keys()) if (!desired.has(key)) this.failed.delete(key);
      for (const [key, group] of this.groups)
        if (
          desired
            .get(key)
            ?.map((entry) => entry.id)
            .join(",") !== group.signature
        ) {
          group.dispose();
          this.groups.delete(key);
        }
      if (!desired.size) this.clearBackends();
      for (const [key, entries] of desired) {
        let group = this.groups.get(key);
        if (!group) {
          const signature = entries.map((entry) => entry.id).join(",");
          if (this.failed.get(key) === signature) continue;
          group = new Group(this, key, entries, signature);
          this.groups.set(key, group);
          void group.start();
        } else group.request();
      }
    });
  }

  dispose() {
    this.disposed = true;
    if (this.recovery) clearTimeout(this.recovery);
    for (const group of this.groups.values()) group.dispose();
    this.groups.clear();
    this.clearBackends();
    this.currentDevice?.destroy();
    this.currentDevice = undefined;
  }
}

export interface SharedBackdropRegistration {
  updateSource(change: BackdropChange, reads: BackdropReads): (() => void) | undefined;
  read(
    change: BackdropChange,
    reads: BackdropReads,
    margin: number,
  ): {
    native: boolean;
    write(): void;
  };
  visible(value: boolean): void;
  stop(): void;
}

export function registerSharedBackdrop(
  element: HTMLElement,
  source: HTMLElement,
  layer: HTMLElement,
  optics: HTMLElement,
  invalidateNative: () => void,
): SharedBackdropRegistration | undefined {
  if (
    !navigator.gpu ||
    !/AppleWebKit/.test(navigator.userAgent) ||
    /Chrom(?:e|ium)|CriOS|Edg|OPR/.test(navigator.userAgent)
  )
    return;
  manager ??= new Manager();
  const owner = manager;
  let paint = owner.sources.get(source);
  if (!paint) {
    paint = { id: nextId++, paint: new BackdropPaint(source), entries: new Set() };
    owner.sources.set(source, paint);
  }
  const entry: Entry = {
    id: nextId++,
    element,
    source: paint,
    layer,
    optics,
    visible: true,
    stopped: false,
    invalidateNative,
  };
  paint.entries.add(entry);
  return {
    updateSource(change, reads) {
      if (
        !entry.state ||
        entry.state.native ||
        !entry.view?.ready ||
        !entry.layer.hasAttribute("data-glass-renderer") ||
        !paint.paint.read(change, reads)
      )
        return;
      return () => owner.request();
    },
    read(change, reads, margin) {
      const capture = paint.paint.read(change, reads);
      const style = reads.style(element),
        size = reads.size(element),
        box = reads.box(element);
      const from = reads.box(source),
        sourceSize = reads.size(source);
      const filter =
        style.getPropertyValue("--lenso-fusion-filter").trim() ||
        style.getPropertyValue("--lg-filter").trim();
      const fitted = fittedOptics(filter, reads);
      const dpr = devicePixelRatio;
      const blur = parseFloat(style.getPropertyValue("--lg-blur"));
      const medium = fitted?.material === "medium-light" || fitted?.material === "medium-dark";
      const qualified =
        capture &&
        fitted &&
        (dpr === 1 || dpr === 2) &&
        style.getPropertyValue("--lg-material").trim() === "apple" &&
        blur === (medium ? 8 : 3) &&
        [size.width, size.height, margin].every(Number.isInteger) &&
        size.width > 0 &&
        size.height > 0 &&
        box.width > 0 &&
        box.height > 0 &&
        size.width <= (medium ? 512 : 256) &&
        size.height <= (medium ? 1024 : 256) &&
        Number(fitted.field.getAttribute("width")) === size.width &&
        Number(fitted.field.getAttribute("height")) === size.height &&
        from.width === sourceSize.width &&
        from.height === sourceSize.height &&
        (!medium || (axisAligned(element, reads) && axisAligned(source, reads)));
      const transformed =
        style.opacity === "0" ||
        style.filter !== "none" ||
        (!medium &&
          (box.width !== size.width ||
            box.height !== size.height ||
            !Number.isInteger(box.x) ||
            !Number.isInteger(box.y) ||
            (style.scale !== "none" &&
              style.scale.split(" ").some((value) => Number(value) !== 1))));
      const sx = box.width / size.width,
        sy = box.height / size.height;
      const scaleX = 1 / sx,
        scaleY = 1 / sy;
      const key = qualified
        ? [paint.id, fitted!.key, size.width, size.height, margin, dpr, blur].join(":")
        : "";
      const next: State | undefined = qualified
        ? {
            ...size,
            margin,
            dpr,
            blur,
            count: 0,
            key,
            radius: style.borderRadius,
            optics: fitted!,
            native: transformed,
            x: transformed && entry.state?.key === key ? entry.state.x : (box.x - from.x) / sx,
            y: transformed && entry.state?.key === key ? entry.state.y : (box.y - from.y) / sy,
            scaleX,
            scaleY,
          }
        : undefined;
      return {
        native:
          !next ||
          transformed ||
          !entry.view?.ready ||
          entry.group?.key !== next.key ||
          !entry.layer.hasAttribute("data-glass-renderer"),
        write() {
          entry.state = next;
          if (entry.view && next) {
            const { canvas, padding } = entry.view;
            const clip = `inset(${padding}px round ${next.radius})`;
            if (canvas.style.clipPath !== clip) canvas.style.clipPath = clip;
          }
          if (!next || transformed || entry.group?.key !== next.key) native(entry, true);
          owner.request();
        },
      };
    },
    visible(value) {
      entry.visible = value;
      if (!value) native(entry, true);
      owner.request();
    },
    stop() {
      entry.stopped = true;
      native(entry, true);
      paint.entries.delete(entry);
      if (!paint.entries.size) owner.sources.delete(source);
      if (!owner.sources.size) {
        owner.dispose();
        if (manager === owner) manager = undefined;
      } else owner.request();
    },
  };
}
