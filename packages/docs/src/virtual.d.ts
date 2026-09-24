import type { DocsConfig } from "./config";
import type { DocsMetaEntry } from "./navigation";

declare module "virtual:lenso-docs-config" {
  const config: DocsConfig;
  export default config;
}

declare module "virtual:lenso-docs-meta" {
  const metadata: DocsMetaEntry[];
  export default metadata;
}
