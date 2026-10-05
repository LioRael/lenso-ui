import stylex, { prepareNext, type Options, type PrepareNextOptions } from "@lenso/stylex-build";

const options = {
  metadata: [new URL("file:///compiled-package/stylex-rules.json")],
  unstable_moduleResolution: { type: "commonJS", rootDir: "/consumer" },
} satisfies Options;

export const consumers = [stylex.vite(options), stylex.rolldown(options), stylex.webpack(options)];
export const producer = stylex.rolldown({ emitMetadata: "stylex-rules.json", devMode: "off" });
const explicit = {
  ...options,
  sources: [new URL("file:///consumer/source.ts")],
  cssFile: new URL("file:///consumer/generated/stylex.css"),
} satisfies PrepareNextOptions;
export const prepared = prepareNext(explicit);

// @ts-expect-error Explicit CSS preparation is production-only, not a runtime dev adapter.
prepareNext({ ...explicit, devMode: "full" });
// @ts-expect-error Ordinary CSS dependency delivery does not select emitted CSS assets.
prepareNext({ ...explicit, cssInjectionTarget: () => true });

// @ts-expect-error Contract v1 fixes the compiled key mode.
stylex.vite({ metadata: options.metadata, styleResolution: "application-order" });
// @ts-expect-error Independent CSS layering flags are not the consumer interface.
stylex.vite({ metadata: options.metadata, legacyDisableLayers: true });
