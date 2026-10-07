import type { DocumentationRootContext } from "@lenso/docs/react";
import { DocsRootProviders } from "./src/components/docs-root-providers";

export function getRootOptions({ locale }: DocumentationRootContext) {
  if (locale.code !== "en" && locale.code !== "cn")
    throw new Error(`Unsupported Lenso locale: ${locale.code}`);
  return {
    Providers: DocsRootProviders,
    bodyClassName: "",
    metadata: {
      title: { default: "Lenso UI", template: "%s · Lenso UI" },
      description:
        "Lenso UI components with StyleX, native Base UI interactions, and React Aria date, time, and color models.",
    },
  };
}
