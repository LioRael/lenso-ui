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
const publicRoot = path.join(repositoryRoot, "apps/docs-site/public/r");
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
    source: "packages/ui/src/shared/stylex-props.ts",
    target: "components/lenso/shared/stylex-props.ts",
    type: "registry:lib" as const,
  },
  {
    source: "packages/ui/src/tokens.stylex.ts",
    target: "components/lenso/tokens.stylex.ts",
    type: "registry:style" as const,
  },
];

const motionFile = {
  source: "packages/ui/src/shared/motion.stylex.ts",
  target: "components/lenso/shared/motion.stylex.ts",
  type: "registry:style" as const,
};

const boxedControlFile = {
  source: "packages/ui/src/shared/boxed-control.stylex.ts",
  target: "components/lenso/shared/boxed-control.stylex.ts",
  type: "registry:style" as const,
};

const styledPartFile = {
  source: "packages/ui/src/shared/styled-part.ts",
  target: "components/lenso/shared/styled-part.ts",
  type: "registry:lib" as const,
};

const specs: RegistryItemSpec[] = [
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/content-state/index.tsx",
        target: "components/lenso/content-state/index.tsx",
      },
      {
        source: "packages/ui/src/content-state/content-state.stylex.ts",
        target: "components/lenso/content-state/content-state.stylex.ts",
        type: "registry:style",
      },
      styledPartFile,
      ...sharedFiles,
    ],
    name: "content-state",
    registryDependencies: [stable("setup")],
    title: "Content State",
    type: "registry:ui",
  },
  {
    dependencies: ["@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/description-list/index.tsx",
        target: "components/lenso/description-list/index.tsx",
      },
      {
        source: "packages/ui/src/description-list/description-list.stylex.ts",
        target: "components/lenso/description-list/description-list.stylex.ts",
        type: "registry:style",
      },
      styledPartFile,
      ...sharedFiles,
    ],
    name: "description-list",
    registryDependencies: [stable("setup")],
    title: "Description List",
    type: "registry:ui",
  },
  {
    dependencies: [`@lenso/primitives@${releaseVersion}`, "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/data-table/index.tsx",
        target: "components/lenso/data-table/index.tsx",
      },
      {
        source: "packages/ui/src/data-table/data-table.stylex.ts",
        target: "components/lenso/data-table/data-table.stylex.ts",
        type: "registry:style",
      },
      {
        source: "packages/ui/src/shared/use-resize-guide-height.ts",
        target: "components/lenso/shared/use-resize-guide-height.ts",
        type: "registry:lib",
      },
      ...sharedFiles,
    ],
    name: "data-table",
    registryDependencies: [stable("setup"), stable("resize-handle")],
    title: "Data Table",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0", "lucide-react@1.31.0"],
    files: [
      {
        source: "packages/ui/src/selection-toolbar/index.tsx",
        target: "components/lenso/selection-toolbar/index.tsx",
      },
      {
        source: "packages/ui/src/selection-toolbar/selection-toolbar.stylex.ts",
        target: "components/lenso/selection-toolbar/selection-toolbar.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "selection-toolbar",
    registryDependencies: [stable("setup"), stable("button"), stable("icon-button")],
    title: "Selection Toolbar",
    type: "registry:ui",
  },
  {
    dependencies: ["@stylexjs/stylex@0.19.0", "lucide-react@1.31.0"],
    files: [
      {
        source: "packages/ui/src/inline-alert/index.tsx",
        target: "components/lenso/inline-alert/index.tsx",
      },
      {
        source: "packages/ui/src/inline-alert/inline-alert.stylex.ts",
        target: "components/lenso/inline-alert/inline-alert.stylex.ts",
        type: "registry:style",
      },
      styledPartFile,
      ...sharedFiles,
    ],
    name: "inline-alert",
    registryDependencies: [stable("setup")],
    title: "Inline Alert",
    type: "registry:ui",
  },
  {
    dependencies: ["@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/shimmer-text/index.tsx",
        target: "components/lenso/shimmer-text/index.tsx",
      },
      {
        source: "packages/ui/src/shimmer-text/shimmer-text.stylex.ts",
        target: "components/lenso/shimmer-text/shimmer-text.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "shimmer-text",
    registryDependencies: [stable("setup")],
    title: "Shimmer Text",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/text-area/index.tsx",
        target: "components/lenso/text-area/index.tsx",
      },
      {
        source: "packages/ui/src/text-area/text-area.stylex.ts",
        target: "components/lenso/text-area/text-area.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "text-area",
    registryDependencies: [stable("setup")],
    title: "Text Area",
    type: "registry:ui",
  },
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
      motionFile,
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
      motionFile,
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
      motionFile,
      boxedControlFile,
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
      motionFile,
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
      motionFile,
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
      { source: "packages/ui/src/surface/index.tsx", target: "components/lenso/surface/index.tsx" },
      {
        source: "packages/ui/src/surface/surface.stylex.ts",
        target: "components/lenso/surface/surface.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "surface",
    registryDependencies: [stable("setup")],
    title: "Surface",
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
      motionFile,
      ...sharedFiles,
    ],
    name: "label",
    registryDependencies: [stable("setup")],
    title: "Label",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0", "lucide-react@1.31.0"],
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
      motionFile,
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
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/segmented-control/index.tsx",
        target: "components/lenso/segmented-control/index.tsx",
      },
      {
        source: "packages/ui/src/segmented-control/segmented-control.stylex.ts",
        target: "components/lenso/segmented-control/segmented-control.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "segmented-control",
    registryDependencies: [stable("setup")],
    title: "Segmented Control",
    type: "registry:ui",
  },
  {
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/slider/index.tsx",
        target: "components/lenso/slider/index.tsx",
      },
      {
        source: "packages/ui/src/slider/slider.stylex.ts",
        target: "components/lenso/slider/slider.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "slider",
    registryDependencies: [stable("setup")],
    title: "Slider",
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
      motionFile,
      boxedControlFile,
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
      motionFile,
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
      motionFile,
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
        source: "packages/ui/src/disclosure/index.tsx",
        target: "components/lenso/disclosure/index.tsx",
      },
      {
        source: "packages/ui/src/disclosure/disclosure.stylex.ts",
        target: "components/lenso/disclosure/disclosure.stylex.ts",
        type: "registry:style",
      },
      motionFile,
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
    dependencies: ["@base-ui/react@1.7.0", "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/primitives/src/resize-handle/index.tsx",
        target: "components/lenso/primitives/resize-handle.tsx",
      },
    ],
    name: "resize-handle-primitive",
    title: "Resize Handle Primitive",
    type: "registry:lib",
  },
  {
    dependencies: [`@lenso/primitives@${releaseVersion}`, "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "packages/ui/src/resize-handle/index.tsx",
        target: "components/lenso/resize-handle/index.tsx",
      },
      {
        source: "packages/ui/src/resize-handle/resize-handle.stylex.ts",
        target: "components/lenso/resize-handle/resize-handle.stylex.ts",
        type: "registry:style",
      },
      ...sharedFiles,
    ],
    name: "resize-handle",
    registryDependencies: [stable("setup")],
    title: "Resize Handle",
    type: "registry:ui",
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
      motionFile,
      ...sharedFiles,
      styledPartFile,
    ],
    name: "sidebar",
    registryDependencies: [stable("setup"), stable("disclosure")],
    title: "Sidebar",
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
      styledPartFile,
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
      motionFile,
      ...sharedFiles,
    ],
    name: "tooltip",
    registryDependencies: [stable("setup")],
    title: "Tooltip",
    type: "registry:ui",
  },
  {
    dependencies: [`@lenso/ui@${releaseVersion}`, "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "registry/source/recipes/settings-section/index.tsx",
        target: "components/lenso/recipes/settings-section/index.tsx",
      },
      {
        source: "registry/source/recipes/settings-section/settings-section.stylex.ts",
        target: "components/lenso/recipes/settings-section/settings-section.stylex.ts",
        type: "registry:style",
      },
    ],
    name: "settings-section",
    title: "Settings Section",
    type: "registry:component",
  },
  {
    dependencies: [`@lenso/ui@${releaseVersion}`, "@stylexjs/stylex@0.19.0"],
    files: [
      {
        source: "registry/source/recipes/prompt-composer/index.tsx",
        target: "components/lenso/recipes/prompt-composer/index.tsx",
      },
      {
        source: "registry/source/recipes/prompt-composer/autosize.ts",
        target: "components/lenso/recipes/prompt-composer/autosize.ts",
        type: "registry:lib",
      },
      {
        source: "registry/source/recipes/prompt-composer/keyboard.ts",
        target: "components/lenso/recipes/prompt-composer/keyboard.ts",
        type: "registry:lib",
      },
      {
        source: "registry/source/recipes/prompt-composer/prompt-composer.stylex.ts",
        target: "components/lenso/recipes/prompt-composer/prompt-composer.stylex.ts",
        type: "registry:style",
      },
    ],
    name: "prompt-composer",
    title: "Prompt Composer",
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
  mkdir(path.join(registryRoot, "recipes"), { recursive: true }),
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
