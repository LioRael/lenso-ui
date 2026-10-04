import type { UserOptions } from "@stylexjs/unplugin";
import type { UnpluginInstance } from "unplugin";

export declare const buildSupport: Readonly<{
  schemaVersion: 1;
  node: Readonly<{ range: string; testedVersion: string }>;
  stylex: Readonly<{
    compiler: string;
    version: string;
    metadataFormat: string;
    metadataVersion: number;
    compileMode: Readonly<{
      dev: boolean;
      styleResolution: string;
      classNamePrefix: string;
      runtimeInjection: boolean;
    }>;
  }>;
  next: Readonly<{
    version: string;
    router: "App Router";
    bundler: "Webpack";
    customGlobalError: "unsupported";
    unsupportedBundlers: readonly ["Turbopack", "Rspack"];
  }>;
  vite: Readonly<{ testedVersion: string }>;
}>;

export interface Options {
  /** Versioned JSON exports from every precompiled style package. Required for consumers. */
  metadata?: readonly (string | URL)[];
  /** Actual application declarations omitted from a client graph, e.g. server-only StyleX modules. */
  sources?: readonly (string | URL)[];
  /** Producer-only raw metadata basename, emitted beside the compiled package. */
  emitMetadata?: string;
  /** Only for builds compiling every style declaration from source, not package consumers. */
  sourceOnly?: boolean;
  devMode?: "full" | "css-only" | "off";
  lightningcssOptions?: UserOptions["lightningcssOptions"];
  cssInjectionTarget?: UserOptions["cssInjectionTarget"];
  unstable_moduleResolution?: UserOptions["unstable_moduleResolution"];
}

declare const stylex: Pick<UnpluginInstance<Options, false>, "vite" | "rolldown" | "webpack">;
export default stylex;
