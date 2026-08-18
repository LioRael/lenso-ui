"use client";

import avatarConfig from "@/contents/components/avatar/playground.json";
import breadcrumbConfig from "@/contents/components/breadcrumb/playground.json";
import buttonConfig from "@/contents/components/button/playground.json";
import checkboxConfig from "@/contents/components/checkbox/playground.json";
import comboboxConfig from "@/contents/components/combobox/playground.json";
import commandMenuConfig from "@/contents/components/command-menu/playground.json";
import dialogConfig from "@/contents/components/dialog/playground.json";
import disclosureConfig from "@/contents/components/disclosure/playground.json";
import iconButtonConfig from "@/contents/components/icon-button/playground.json";
import labelConfig from "@/contents/components/label/playground.json";
import menuConfig from "@/contents/components/menu/playground.json";
import popoverConfig from "@/contents/components/popover/playground.json";
import radioConfig from "@/contents/components/radio/playground.json";
import resizeHandleConfig from "@/contents/components/resize-handle/playground.json";
import selectConfig from "@/contents/components/select/playground.json";
import statusMarkerConfig from "@/contents/components/status-marker/playground.json";
import switchConfig from "@/contents/components/switch/playground.json";
import tabsConfig from "@/contents/components/tabs/playground.json";
import textFieldConfig from "@/contents/components/text-field/playground.json";
import toastConfig from "@/contents/components/toast/playground.json";
import tooltipConfig from "@/contents/components/tooltip/playground.json";
import applicationSidebarConfig from "@/contents/patterns/application-sidebar/playground.json";
import pageHeaderConfig from "@/contents/patterns/page-header/playground.json";
import quickLinkConfig from "@/contents/patterns/quick-link/playground.json";
import settingsRowConfig from "@/contents/patterns/settings-row/playground.json";
import surfaceConfig from "@/contents/primitives/surface/playground.json";
import pageLayoutConfig from "@/contents/templates/page-layout/playground.json";

import { ComponentPlayground } from "./playground/component-playground";
import { parsePlaygroundConfig } from "./playground/config";
import {
  buttonAdapter,
  iconButtonAdapter,
  settingsRowAdapter,
} from "./playground/adapters/actions";
import {
  avatarAdapter,
  checkboxAdapter,
  labelAdapter,
  radioAdapter,
  resizeHandleAdapter,
  selectAdapter,
  statusMarkerAdapter,
  surfaceAdapter,
  switchAdapter,
  textFieldAdapter,
} from "./playground/adapters/content";
import { dialogAdapter } from "./playground/adapters/dialog";
import {
  breadcrumbAdapter,
  disclosureAdapter,
  pageHeaderAdapter,
  quickLinkAdapter,
  sidebarAdapter,
  tabsAdapter,
} from "./playground/adapters/navigation";
import {
  comboboxAdapter,
  commandMenuAdapter,
  menuAdapter,
  popoverAdapter,
  toastAdapter,
  tooltipAdapter,
} from "./playground/adapters/overlays";
import { pageLayoutAdapter } from "./playground/adapters/templates";
import type { PlaygroundDefinition } from "./playground/types";

const definitions: readonly PlaygroundDefinition[] = [
  { adapter: avatarAdapter, config: parsePlaygroundConfig(avatarConfig) },
  { adapter: breadcrumbAdapter, config: parsePlaygroundConfig(breadcrumbConfig) },
  { adapter: buttonAdapter, config: parsePlaygroundConfig(buttonConfig) },
  { adapter: checkboxAdapter, config: parsePlaygroundConfig(checkboxConfig) },
  { adapter: comboboxAdapter, config: parsePlaygroundConfig(comboboxConfig) },
  { adapter: commandMenuAdapter, config: parsePlaygroundConfig(commandMenuConfig) },
  {
    adapter: dialogAdapter,
    config: parsePlaygroundConfig(dialogConfig),
  },
  { adapter: disclosureAdapter, config: parsePlaygroundConfig(disclosureConfig) },
  { adapter: iconButtonAdapter, config: parsePlaygroundConfig(iconButtonConfig) },
  { adapter: labelAdapter, config: parsePlaygroundConfig(labelConfig) },
  { adapter: menuAdapter, config: parsePlaygroundConfig(menuConfig) },
  { adapter: popoverAdapter, config: parsePlaygroundConfig(popoverConfig) },
  { adapter: radioAdapter, config: parsePlaygroundConfig(radioConfig) },
  { adapter: resizeHandleAdapter, config: parsePlaygroundConfig(resizeHandleConfig) },
  { adapter: selectAdapter, config: parsePlaygroundConfig(selectConfig) },
  { adapter: settingsRowAdapter, config: parsePlaygroundConfig(settingsRowConfig) },
  { adapter: statusMarkerAdapter, config: parsePlaygroundConfig(statusMarkerConfig) },
  { adapter: surfaceAdapter, config: parsePlaygroundConfig(surfaceConfig) },
  { adapter: switchAdapter, config: parsePlaygroundConfig(switchConfig) },
  { adapter: tabsAdapter, config: parsePlaygroundConfig(tabsConfig) },
  { adapter: textFieldAdapter, config: parsePlaygroundConfig(textFieldConfig) },
  { adapter: toastAdapter, config: parsePlaygroundConfig(toastConfig) },
  { adapter: tooltipAdapter, config: parsePlaygroundConfig(tooltipConfig) },
  { adapter: sidebarAdapter, config: parsePlaygroundConfig(applicationSidebarConfig) },
  { adapter: pageHeaderAdapter, config: parsePlaygroundConfig(pageHeaderConfig) },
  { adapter: quickLinkAdapter, config: parsePlaygroundConfig(quickLinkConfig) },
  { adapter: pageLayoutAdapter, config: parsePlaygroundConfig(pageLayoutConfig) },
];

const registry = new Map(definitions.map((definition) => [definition.config.id, definition]));

export function Playground({ id, example }: { id: string; example?: string | undefined }) {
  const definition = registry.get(id);
  if (!definition) throw new Error(`Unknown playground ${id}`);

  return <ComponentPlayground {...definition} initialExample={example} />;
}
