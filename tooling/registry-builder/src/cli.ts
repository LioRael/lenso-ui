import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { registryItemSchema, registrySchema } from "shadcn/schema";

import {
  buildRegistryItem,
  createParityManifest,
  publicRegistryItem,
  type RegistryItemSpec,
} from "./builder.js";

const repositoryRoot = path.resolve(import.meta.dirname, "../../..");
const registryRoot = path.join(repositoryRoot, "registry");
const publicRoot = path.join(repositoryRoot, "apps/docs/public/r");
const publicPackagePaths = [
  "packages/ui/package.json",
  "packages/primitives/package.json",
  "packages/tokens/package.json",
];
const publicVersions = new Set(
  await Promise.all(
    publicPackagePaths.map(async (packagePath) => {
      const packageJson = JSON.parse(
        await readFile(path.join(repositoryRoot, packagePath), "utf8"),
      ) as { version: string };
      return packageJson.version;
    }),
  ),
);
if (publicVersions.size !== 1) {
  throw new Error(`Public package versions must match: ${[...publicVersions].sort().join(", ")}`);
}
const releaseVersion = [...publicVersions][0];
if (!releaseVersion) throw new Error("A public release version is required");
const versionedPublicRoot = path.join(publicRoot, "v", releaseVersion);
const snapshotMode = process.env.LENSO_REGISTRY_SNAPSHOT === "1";
const stable = (name: string) => `https://ui.lenso.dev/r/${name}.json`;
const immutable = (name: string) => `https://ui.lenso.dev/r/v/${releaseVersion}/${name}.json`;

const sharedFiles = [
  {
    source: "packages/ui/src/shared/merge-class-name.ts",
    target: "components/lenso/shared/merge-class-name.ts",
    type: "registry:lib" as const,
  },
  {
    source: "packages/ui/src/tokens.stylex.ts",
    target: "components/lenso/tokens.stylex.ts",
    type: "registry:style" as const,
  },
];

const specs: RegistryItemSpec[] = [
  {
    dependencies: [`@lenso/tokens@${releaseVersion}`, "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/tokens.stylex.ts",
        target: "components/lenso/tokens.stylex.ts",
        type: "registry:style",
      },
    ],
    name: "setup",
    title: "Lenso StyleX setup",
    type: "registry:style",
  },
  {
    dependencies: [`@lenso/tokens@${releaseVersion}`],
    files: [
      {
        source: "packages/ui/src/theme-scope/index.tsx",
        target: "components/lenso/theme-scope/index.tsx",
      },
    ],
    name: "theme-scope",
    registryDependencies: [stable("setup")],
    title: "Theme Scope",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0"],
    files: [
      {
        source: "packages/ui/src/csp-provider/index.tsx",
        target: "components/lenso/csp-provider/index.tsx",
      },
    ],
    name: "csp-provider",
    title: "CSP Provider",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/button/index.tsx",
        target: "components/lenso/button/index.tsx",
      },
      {
        source: "packages/ui/src/button/button.stylex.ts",
        target: "components/lenso/button/button.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "button",
    registryDependencies: [stable("setup")],
    title: "Button",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/text-field/index.tsx",
        target: "components/lenso/text-field/index.tsx",
      },
      {
        source: "packages/ui/src/text-field/text-field.stylex.ts",
        target: "components/lenso/text-field/text-field.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "text-field",
    registryDependencies: [stable("setup")],
    title: "Text Field",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0", "lucide-react@1.31.0"],
    files: [
      {
        source: "packages/ui/src/dialog/index.tsx",
        target: "components/lenso/dialog/index.tsx",
      },
      {
        source: "packages/ui/src/dialog/dialog.stylex.ts",
        target: "components/lenso/dialog/dialog.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "dialog",
    registryDependencies: [stable("setup"), stable("theme-scope")],
    title: "Dialog",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0", "lucide-react@1.31.0"],
    files: [
      {
        source: "packages/ui/src/select/index.tsx",
        target: "components/lenso/select/index.tsx",
      },
      {
        source: "packages/ui/src/select/select.stylex.ts",
        target: "components/lenso/select/select.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "select",
    registryDependencies: [stable("setup"), stable("theme-scope")],
    title: "Select",
    type: "registry:ui",
  },
  {
    files: [
      {
        source: "packages/primitives/src/sidebar/index.tsx",
        target: "components/lenso/primitives/sidebar.tsx",
      },
    ],
    name: "sidebar-primitive",
    title: "Sidebar Primitive",
    type: "registry:lib",
  },
  {
    dependencies: ["@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "registry/recipes/sidebar.tsx",
        target: "components/lenso/sidebar/sidebar.tsx",
      },
      {
        source: "registry/recipes/sidebar.stylex.ts",
        target: "components/lenso/sidebar/sidebar.stylex.ts",
        type: "registry:style",
      },
      {
        source: "packages/ui/src/tokens.stylex.ts",
        target: "components/lenso/tokens.stylex.ts",
        type: "registry:style",
      },
    ],
    name: "sidebar",
    registryDependencies: [stable("setup"), stable("sidebar-primitive")],
    title: "Sidebar Recipe",
    type: "registry:component",
  },
];

const sourceCache = new Map<string, string>();
await Promise.all(
  specs.flatMap((spec) =>
    spec.files.map(async (file) => {
      const absolutePath = path.join(repositoryRoot, file.source);
      sourceCache.set(absolutePath, await readFile(absolutePath, "utf8"));
    }),
  ),
);
const items = specs.map((spec) =>
  buildRegistryItem(spec, repositoryRoot, (file) => {
    const content = sourceCache.get(file);
    if (content === undefined) throw new Error(`Source was not loaded: ${file}`);
    return content;
  }),
);
const versionedItems = items.map((item) => ({
  ...item,
  ...(item.registryDependencies
    ? {
        registryDependencies: item.registryDependencies.map((dependency) =>
          dependency.startsWith("https://ui.lenso.dev/r/")
            ? immutable(dependency.slice("https://ui.lenso.dev/r/".length, -".json".length))
            : dependency,
        ),
      }
    : {}),
}));
for (const item of [...items, ...versionedItems])
  registryItemSchema.parse(publicRegistryItem(item));

await Promise.all([
  mkdir(path.join(registryRoot, "components"), { recursive: true }),
  mkdir(publicRoot, { recursive: true }),
  ...(snapshotMode ? [mkdir(versionedPublicRoot, { recursive: true })] : []),
]);
await Promise.all(
  items.flatMap((item, index) => {
    const content = `${JSON.stringify(publicRegistryItem(item), null, 2)}\n`;
    const versionedItem = versionedItems[index];
    if (!versionedItem) throw new Error(`Missing versioned registry item: ${item.name}`);
    const versionedContent = `${JSON.stringify(publicRegistryItem(versionedItem), null, 2)}\n`;
    const registryDirectory =
      item.type === "registry:component"
        ? "recipes"
        : item.type === "registry:style"
          ? "setup"
          : "components";
    return [
      writeFile(path.join(registryRoot, registryDirectory, `${item.name}.json`), content),
      writeFile(path.join(publicRoot, `${item.name}.json`), content),
      ...(snapshotMode
        ? [writeImmutable(path.join(versionedPublicRoot, `${item.name}.json`), versionedContent)]
        : []),
    ];
  }),
);

const index = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  homepage: "https://ui.lenso.dev",
  items: items.map(({ name, title, type }) => ({ name, title, type })),
  name: "lenso",
};
registrySchema.parse(index);
const parity = createParityManifest(items, (source) => {
  const content = sourceCache.get(path.join(repositoryRoot, source));
  if (content === undefined) throw new Error(`Source was not loaded: ${source}`);
  return content;
});
await Promise.all([
  writeFile(path.join(registryRoot, "registry.json"), `${JSON.stringify(index, null, 2)}\n`),
  writeFile(
    path.join(registryRoot, "parity-manifest.json"),
    `${JSON.stringify(parity, null, 2)}\n`,
  ),
  writeFile(path.join(publicRoot, "registry.json"), `${JSON.stringify(index, null, 2)}\n`),
  writeFile(path.join(publicRoot, "parity-manifest.json"), `${JSON.stringify(parity, null, 2)}\n`),
  ...(snapshotMode
    ? [
        writeImmutable(
          path.join(versionedPublicRoot, "registry.json"),
          `${JSON.stringify(index, null, 2)}\n`,
        ),
        writeImmutable(
          path.join(versionedPublicRoot, "parity-manifest.json"),
          `${JSON.stringify(parity, null, 2)}\n`,
        ),
        writeImmutable(
          path.join(versionedPublicRoot, "release.json"),
          `${JSON.stringify(
            {
              algorithm: "sha256",
              paritySha256: createHash("sha256").update(JSON.stringify(parity)).digest("hex"),
              version: releaseVersion,
            },
            null,
            2,
          )}\n`,
        ),
      ]
    : []),
]);

async function writeImmutable(target: string, content: string): Promise<void> {
  try {
    const existing = await readFile(target, "utf8");
    if (existing !== content) {
      throw new Error(`Immutable registry snapshot already exists with different bytes: ${target}`);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    await writeFile(target, content, { flag: "wx" });
  }
}
