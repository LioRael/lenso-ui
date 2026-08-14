import { describe, expect, it } from "vitest";

import { buildRegistryItem, createParityManifest, type RegistryItemSpec } from "./builder.js";

const files: Record<string, string> = {
  "/repo/packages/ui/src/button/index.tsx": "export const Button = 1;\n",
  "/repo/packages/ui/src/button/button.stylex.ts": "export const styles = {};\n",
};

const spec: RegistryItemSpec = {
  dependencies: ["@base-ui/react", "@stylexjs/stylex"],
  files: [
    {
      source: "packages/ui/src/button/index.tsx",
      target: "components/lenso/button/index.tsx",
    },
    {
      source: "packages/ui/src/button/button.stylex.ts",
      target: "components/lenso/button/button.stylex.ts",
    },
  ],
  name: "button",
  title: "Button",
  type: "registry:ui",
};

describe("registry builder", () => {
  it("copies canonical source byte-for-byte into a shadcn item", () => {
    const item = buildRegistryItem(spec, "/repo", (file) => files[file]!);

    expect(item.name).toBe("button");
    expect(item.files[0]?.content).toBe(files["/repo/packages/ui/src/button/index.tsx"]);
    expect(item.dependencies).toEqual(["@base-ui/react", "@stylexjs/stylex"]);
  });

  it("records package-to-registry parity from the copied bytes", () => {
    const item = buildRegistryItem(spec, "/repo", (file) => files[file]!);
    const manifest = createParityManifest([item], (file) => files[`/repo/${file}`]!);

    expect(manifest.items.button?.files).toHaveLength(2);
    expect(manifest.items.button?.files[0]?.sourceSha256).toBe(
      manifest.items.button?.files[0]?.registrySha256,
    );
  });

  it("rejects registry bytes that diverge from canonical source", () => {
    const item = buildRegistryItem(spec, "/repo", (file) => files[file]!);
    item.files[0]!.content = "export const Button = 2;\n";

    expect(() => createParityManifest([item], (file) => files[`/repo/${file}`]!)).toThrow(
      /parity failed/i,
    );
  });
});
