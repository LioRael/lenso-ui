"use client";

import "dialkit/styles.css";

import avatarConfig from "@/playgrounds/configs/components/avatar/playground.json";
import breadcrumbConfig from "@/playgrounds/configs/components/breadcrumb/playground.json";
import buttonConfig from "@/playgrounds/configs/components/button/playground.json";
import checkboxConfig from "@/playgrounds/configs/components/checkbox/playground.json";
import comboboxConfig from "@/playgrounds/configs/components/combobox/playground.json";
import commandMenuConfig from "@/playgrounds/configs/components/command-menu/playground.json";
import contentStateConfig from "@/playgrounds/configs/components/content-state/playground.json";
import descriptionListConfig from "@/playgrounds/configs/components/description-list/playground.json";
import dialogConfig from "@/playgrounds/configs/components/dialog/playground.json";
import disclosureConfig from "@/playgrounds/configs/components/disclosure/playground.json";
import iconButtonConfig from "@/playgrounds/configs/components/icon-button/playground.json";
import inlineAlertConfig from "@/playgrounds/configs/components/inline-alert/playground.json";
import labelConfig from "@/playgrounds/configs/components/label/playground.json";
import menuConfig from "@/playgrounds/configs/components/menu/playground.json";
import popoverConfig from "@/playgrounds/configs/components/popover/playground.json";
import radioConfig from "@/playgrounds/configs/components/radio/playground.json";
import resizeHandleConfig from "@/playgrounds/configs/components/resize-handle/playground.json";
import segmentedControlConfig from "@/playgrounds/configs/components/segmented-control/playground.json";
import selectConfig from "@/playgrounds/configs/components/select/playground.json";
import sliderConfig from "@/playgrounds/configs/components/slider/playground.json";
import shimmerTextConfig from "@/playgrounds/configs/components/shimmer-text/playground.json";
import statusMarkerConfig from "@/playgrounds/configs/components/status-marker/playground.json";
import switchConfig from "@/playgrounds/configs/components/switch/playground.json";
import tabsConfig from "@/playgrounds/configs/components/tabs/playground.json";
import textAreaConfig from "@/playgrounds/configs/components/text-area/playground.json";
import textFieldConfig from "@/playgrounds/configs/components/text-field/playground.json";
import toastConfig from "@/playgrounds/configs/components/toast/playground.json";
import tooltipConfig from "@/playgrounds/configs/components/tooltip/playground.json";
import quickLinkConfig from "@/playgrounds/configs/patterns/quick-link/playground.json";
import settingsRowConfig from "@/playgrounds/configs/patterns/settings-row/playground.json";
import surfaceConfig from "@/playgrounds/configs/primitives/surface/playground.json";
import sidebarConfig from "@/playgrounds/configs/primitives/sidebar/playground.json";
import consoleWorkspaceConfig from "@/playgrounds/configs/templates/console-workspace/playground.json";
import settingsPageConfig from "@/playgrounds/configs/templates/settings-page/playground.json";

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
