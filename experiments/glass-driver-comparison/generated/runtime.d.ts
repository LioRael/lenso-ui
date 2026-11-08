/* tslint:disable */
/* eslint-disable */

/**
 * Owns shader programs, reusable framebuffers, textures and an instanced lens batch.
 */
export class GlassRenderer {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Reports context loss before a caller replaces a complete fallback surface.
     */
    is_context_lost(): boolean;
    /**
     * Creates a renderer for a fixed-size scene and material.
     *
     * # Errors
     * Returns an error for invalid parameters, unavailable WebGL2 or failed GPU allocation.
     */
    constructor(canvas: HTMLCanvasElement, material: Float32Array);
    /**
     * Uploads changed canvas content, reuses its blur, and renders the lens batch.
     *
     * # Errors
     * Returns the browser's texture upload error, including origin restrictions.
     */
    render_canvas(source: HTMLCanvasElement, revision: number): void;
    /**
     * Replaces the retained lens batch without reallocating its GPU buffer.
     *
     * # Errors
     * Rejects incomplete records, invalid geometry and batches exceeding 1,000 lenses.
     */
    set_lenses(values: Float32Array): void;
    /**
     * Let the DOM retain ownership of its existing rim highlight.
     */
    set_rim(enabled: boolean): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_glassrenderer_free: (a: number, b: number) => void;
    readonly glassrenderer_is_context_lost: (a: number) => number;
    readonly glassrenderer_new: (a: any, b: number, c: number) => [number, number, number];
    readonly glassrenderer_render_canvas: (a: number, b: any, c: number) => [number, number];
    readonly glassrenderer_set_lenses: (a: number, b: number, c: number) => [number, number];
    readonly glassrenderer_set_rim: (a: number, b: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
