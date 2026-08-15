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
    dependencies: ["@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/status-marker/index.tsx",
        target: "components/lenso/status-marker/index.tsx",
      },
      {
        source: "packages/ui/src/status-marker/status-marker.stylex.ts",
        target: "components/lenso/status-marker/status-marker.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "status-marker",
    registryDependencies: [stable("setup")],
    title: "Status Marker",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0", "lucide-react@1.31.0"],
    files: [
      { source: "packages/ui/src/toast/index.tsx", target: "components/lenso/toast/index.tsx" },
      {
        source: "packages/ui/src/toast/toast.stylex.ts",
        target: "components/lenso/toast/toast.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "toast",
    registryDependencies: [stable("setup"), stable("theme-scope")],
    title: "Toast",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0", "lucide-react@1.31.0"],
    files: [
      { source: "packages/ui/src/menu/index.tsx", target: "components/lenso/menu/index.tsx" },
      {
        source: "packages/ui/src/menu/menu.stylex.ts",
        target: "components/lenso/menu/menu.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "menu",
    registryDependencies: [stable("setup")],
    title: "Menu",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/popover/index.tsx",
        target: "components/lenso/popover/index.tsx",
      },
      {
        source: "packages/ui/src/popover/popover.stylex.ts",
        target: "components/lenso/popover/popover.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "popover",
    registryDependencies: [stable("setup")],
    title: "Popover",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0"],
    files: [
      { source: "packages/ui/src/avatar/index.tsx", target: "components/lenso/avatar/index.tsx" },
      {
        source: "packages/ui/src/avatar/avatar.stylex.ts",
        target: "components/lenso/avatar/avatar.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "avatar",
    registryDependencies: [stable("setup")],
    title: "Avatar",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/breadcrumb/index.tsx",
        target: "components/lenso/breadcrumb/index.tsx",
      },
      {
        source: "packages/ui/src/breadcrumb/breadcrumb.stylex.ts",
        target: "components/lenso/breadcrumb/breadcrumb.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "breadcrumb",
    registryDependencies: [stable("setup")],
    title: "Breadcrumb",
    type: "registry:ui",
  },
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
        source: "packages/ui/src/icon-button/index.tsx",
        target: "components/lenso/icon-button/index.tsx",
      },
      {
        source: "packages/ui/src/icon-button/icon-button.stylex.ts",
        target: "components/lenso/icon-button/icon-button.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "icon-button",
    registryDependencies: [stable("setup")],
    title: "Icon Button",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/label/index.tsx",
        target: "components/lenso/label/index.tsx",
      },
      {
        source: "packages/ui/src/label/label.stylex.ts",
        target: "components/lenso/label/label.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "label",
    registryDependencies: [stable("setup")],
    title: "Label",
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
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/checkbox/index.tsx",
        target: "components/lenso/checkbox/index.tsx",
      },
      {
        source: "packages/ui/src/checkbox/checkbox.stylex.ts",
        target: "components/lenso/checkbox/checkbox.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "checkbox",
    registryDependencies: [stable("setup")],
    title: "Checkbox",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/radio/index.tsx",
        target: "components/lenso/radio/index.tsx",
      },
      {
        source: "packages/ui/src/radio/radio.stylex.ts",
        target: "components/lenso/radio/radio.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "radio",
    registryDependencies: [stable("setup")],
    title: "Radio",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/switch/index.tsx",
        target: "components/lenso/switch/index.tsx",
      },
      {
        source: "packages/ui/src/switch/switch.stylex.ts",
        target: "components/lenso/switch/switch.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "switch",
    registryDependencies: [stable("setup")],
    title: "Switch",
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
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0", "lucide-react@1.31.0"],
    files: [
      {
        source: "packages/ui/src/combobox/index.tsx",
        target: "components/lenso/combobox/index.tsx",
      },
      {
        source: "packages/ui/src/combobox/combobox.stylex.ts",
        target: "components/lenso/combobox/combobox.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "combobox",
    registryDependencies: [stable("setup"), stable("theme-scope")],
    title: "Combobox",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/command-menu/index.tsx",
        target: "components/lenso/command-menu/index.tsx",
      },
      {
        source: "packages/ui/src/command-menu/command-menu.stylex.ts",
        target: "components/lenso/command-menu/command-menu.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "command-menu",
    registryDependencies: [stable("setup")],
    title: "Command Menu",
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
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/disclosure/index.tsx",
        target: "components/lenso/disclosure/index.tsx",
      },
      {
        source: "packages/ui/src/disclosure/disclosure.stylex.ts",
        target: "components/lenso/disclosure/disclosure.stylex.ts",
        type: "registry:style",
      },
      {
        source: "packages/ui/src/disclosure/disclosure-chevron.svg",
        target: "components/lenso/disclosure/disclosure-chevron.svg",
      },
      ...sharedFiles,
    ],
    name: "disclosure",
    registryDependencies: [stable("setup")],
    title: "Disclosure",
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
    dependencies: [
      `@lenso/primitives@${releaseVersion}`,
      "@base-ui/react@1.7.0",
      "@stylexjs/stylex@0.19.0",
    ],
    files: [
      {
        source: "packages/ui/src/sidebar/index.tsx",
        target: "components/lenso/sidebar/index.tsx",
      },
      {
        source: "packages/ui/src/sidebar/sidebar.stylex.ts",
        target: "components/lenso/sidebar/sidebar.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "sidebar",
    registryDependencies: [stable("setup")],
    title: "Sidebar",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/page-header/index.tsx",
        target: "components/lenso/page-header/index.tsx",
      },
      {
        source: "packages/ui/src/page-header/page-header.stylex.ts",
        target: "components/lenso/page-header/page-header.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "page-header",
    registryDependencies: [stable("setup")],
    title: "Page Header",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/quick-link/index.tsx",
        target: "components/lenso/quick-link/index.tsx",
      },
      {
        source: "packages/ui/src/quick-link/quick-link.stylex.ts",
        target: "components/lenso/quick-link/quick-link.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "quick-link",
    registryDependencies: [stable("setup")],
    title: "Quick Link",
    type: "registry:ui",
  },
  {
    dependencies: ["@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/settings-row/index.tsx",
        target: "components/lenso/settings-row/index.tsx",
      },
      {
        source: "packages/ui/src/settings-row/settings-row.stylex.ts",
        target: "components/lenso/settings-row/settings-row.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "settings-row",
    registryDependencies: [stable("setup")],
    title: "Settings Row",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/tabs/index.tsx",
        target: "components/lenso/tabs/index.tsx",
      },
      {
        source: "packages/ui/src/tabs/tabs.stylex.ts",
        target: "components/lenso/tabs/tabs.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "tabs",
    registryDependencies: [stable("setup")],
    title: "Tabs",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/tooltip/index.tsx",
        target: "components/lenso/tooltip/index.tsx",
      },
      {
        source: "packages/ui/src/tooltip/tooltip.stylex.ts",
        target: "components/lenso/tooltip/tooltip.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "tooltip",
    registryDependencies: [stable("setup")],
    title: "Tooltip",
    type: "registry:ui",
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
