import stylex, { type Options } from "@lenso/stylex-build";

const options = {
  metadata: [new URL("file:///compiled-package/stylex-rules.json")],
  unstable_moduleResolution: { type: "commonJS", rootDir: "/consumer" },
} satisfies Options;

export const consumers = [stylex.vite(options), stylex.rolldown(options), stylex.webpack(options)];
export const producer = stylex.rolldown({ emitMetadata: "stylex-rules.json", devMode: "off" });

// @ts-expect-error Contract v1 fixes the compiled key mode.
stylex.vite({ metadata: options.metadata, styleResolution: "application-order" });
// @ts-expect-error Independent CSS layering flags are not the consumer interface.
stylex.vite({ metadata: options.metadata, legacyDisableLayers: true });
