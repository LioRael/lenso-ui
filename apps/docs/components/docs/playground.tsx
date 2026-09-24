"use client";

import avatarConfig from "@/contents/components/avatar/playground.json";
import breadcrumbConfig from "@/contents/components/breadcrumb/playground.json";
import buttonConfig from "@/contents/components/button/playground.json";
import checkboxConfig from "@/contents/components/checkbox/playground.json";
import comboboxConfig from "@/contents/components/combobox/playground.json";
import commandMenuConfig from "@/contents/components/command-menu/playground.json";
import contentStateConfig from "@/contents/components/content-state/playground.json";
import descriptionListConfig from "@/contents/components/description-list/playground.json";
import dialogConfig from "@/contents/components/dialog/playground.json";
import disclosureConfig from "@/contents/components/disclosure/playground.json";
import iconButtonConfig from "@/contents/components/icon-button/playground.json";
import inlineAlertConfig from "@/contents/components/inline-alert/playground.json";
import labelConfig from "@/contents/components/label/playground.json";
import menuConfig from "@/contents/components/menu/playground.json";
import popoverConfig from "@/contents/components/popover/playground.json";
import radioConfig from "@/contents/components/radio/playground.json";
import resizeHandleConfig from "@/contents/components/resize-handle/playground.json";
import segmentedControlConfig from "@/contents/components/segmented-control/playground.json";
import selectConfig from "@/contents/components/select/playground.json";
import sliderConfig from "@/contents/components/slider/playground.json";
import shimmerTextConfig from "@/contents/components/shimmer-text/playground.json";
import statusMarkerConfig from "@/contents/components/status-marker/playground.json";
import switchConfig from "@/contents/components/switch/playground.json";
import tabsConfig from "@/contents/components/tabs/playground.json";
import textAreaConfig from "@/contents/components/text-area/playground.json";
import textFieldConfig from "@/contents/components/text-field/playground.json";
import toastConfig from "@/contents/components/toast/playground.json";
import tooltipConfig from "@/contents/components/tooltip/playground.json";
import quickLinkConfig from "@/contents/patterns/quick-link/playground.json";
import settingsRowConfig from "@/contents/patterns/settings-row/playground.json";
import surfaceConfig from "@/contents/primitives/surface/playground.json";
import sidebarConfig from "@/contents/primitives/sidebar/playground.json";
import consoleWorkspaceConfig from "@/contents/templates/console-workspace/playground.json";
import settingsPageConfig from "@/contents/templates/settings-page/playground.json";

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
  contentStateAdapter,
  descriptionListAdapter,
  inlineAlertAdapter,
  labelAdapter,
  radioAdapter,
  resizeHandleAdapter,
  selectAdapter,
  sliderAdapter,
  shimmerTextAdapter,
  statusMarkerAdapter,
  surfaceAdapter,
  switchAdapter,
  textAreaAdapter,
  textFieldAdapter,
} from "./playground/adapters/content";
import { dialogAdapter } from "./playground/adapters/dialog";
import {
  breadcrumbAdapter,
  disclosureAdapter,
  quickLinkAdapter,
  segmentedControlAdapter,
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
import { consoleWorkspaceAdapter } from "./playground/adapters/console-workspace-template";
import { settingsPageAdapter } from "./playground/adapters/settings-page-template";
import { sidebarAdapter } from "./playground/adapters/sidebar";
import type { PlaygroundDefinition } from "./playground/types";

const definitions: readonly PlaygroundDefinition[] = [
  { adapter: avatarAdapter, config: parsePlaygroundConfig(avatarConfig) },
  { adapter: breadcrumbAdapter, config: parsePlaygroundConfig(breadcrumbConfig) },
  { adapter: buttonAdapter, config: parsePlaygroundConfig(buttonConfig) },
  { adapter: checkboxAdapter, config: parsePlaygroundConfig(checkboxConfig) },
  { adapter: comboboxAdapter, config: parsePlaygroundConfig(comboboxConfig) },
  { adapter: commandMenuAdapter, config: parsePlaygroundConfig(commandMenuConfig) },
  { adapter: contentStateAdapter, config: parsePlaygroundConfig(contentStateConfig) },
  { adapter: descriptionListAdapter, config: parsePlaygroundConfig(descriptionListConfig) },
  {
    adapter: dialogAdapter,
    config: parsePlaygroundConfig(dialogConfig),
  },
  { adapter: disclosureAdapter, config: parsePlaygroundConfig(disclosureConfig) },
  { adapter: iconButtonAdapter, config: parsePlaygroundConfig(iconButtonConfig) },
  { adapter: inlineAlertAdapter, config: parsePlaygroundConfig(inlineAlertConfig) },
  { adapter: labelAdapter, config: parsePlaygroundConfig(labelConfig) },
  { adapter: menuAdapter, config: parsePlaygroundConfig(menuConfig) },
  { adapter: popoverAdapter, config: parsePlaygroundConfig(popoverConfig) },
  { adapter: radioAdapter, config: parsePlaygroundConfig(radioConfig) },
  { adapter: resizeHandleAdapter, config: parsePlaygroundConfig(resizeHandleConfig) },
  {
    adapter: segmentedControlAdapter,
    config: parsePlaygroundConfig(segmentedControlConfig),
  },
  { adapter: selectAdapter, config: parsePlaygroundConfig(selectConfig) },
  { adapter: sliderAdapter, config: parsePlaygroundConfig(sliderConfig) },
  { adapter: shimmerTextAdapter, config: parsePlaygroundConfig(shimmerTextConfig) },
  { adapter: settingsRowAdapter, config: parsePlaygroundConfig(settingsRowConfig) },
  { adapter: statusMarkerAdapter, config: parsePlaygroundConfig(statusMarkerConfig) },
  { adapter: surfaceAdapter, config: parsePlaygroundConfig(surfaceConfig) },
  { adapter: sidebarAdapter, config: parsePlaygroundConfig(sidebarConfig) },
  { adapter: switchAdapter, config: parsePlaygroundConfig(switchConfig) },
  { adapter: tabsAdapter, config: parsePlaygroundConfig(tabsConfig) },
  { adapter: textAreaAdapter, config: parsePlaygroundConfig(textAreaConfig) },
  { adapter: textFieldAdapter, config: parsePlaygroundConfig(textFieldConfig) },
  { adapter: toastAdapter, config: parsePlaygroundConfig(toastConfig) },
  { adapter: tooltipAdapter, config: parsePlaygroundConfig(tooltipConfig) },
  { adapter: quickLinkAdapter, config: parsePlaygroundConfig(quickLinkConfig) },
  { adapter: consoleWorkspaceAdapter, config: parsePlaygroundConfig(consoleWorkspaceConfig) },
  { adapter: settingsPageAdapter, config: parsePlaygroundConfig(settingsPageConfig) },
];

const registry = new Map(definitions.map((definition) => [definition.config.id, definition]));

export function Playground({ id, example }: { id: string; example?: string | undefined }) {
  const definition = registry.get(id);
  if (!definition) throw new Error(`Unknown playground ${id}`);

  return <ComponentPlayground {...definition} initialExample={example} />;
}
