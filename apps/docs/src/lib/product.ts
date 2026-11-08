import uiPackage from "../../../../packages/ui/package.json";

/** The UI package owns the product release; documentation has no separate version. */
export const product = {
  name: "Lenso UI",
  version: uiPackage.version,
  repository: "https://github.com/LioRael/lenso-ui",
} as const;
