import { describe, expect, it } from "vitest";

import agentPageConfig from "../../../contents/templates/agent-page/playground.json";
import consoleWorkspaceConfig from "../../../contents/templates/console-workspace/playground.json";
import pageLayoutConfig from "../../../contents/templates/page-layout/playground.json";
import settingsPageConfig from "../../../contents/templates/settings-page/playground.json";
import { parsePlaygroundConfig } from "./config";

describe("template playground layout", () => {
  it.each([
    ["Agent Page", agentPageConfig],
    ["Console Workspace", consoleWorkspaceConfig],
    ["Page Layout", pageLayoutConfig],
    ["Settings Page", settingsPageConfig],
  ])("keeps %s on the full-width preview contract", (_name, config) => {
    expect(parsePlaygroundConfig(config)).toMatchObject({ layout: "template" });
  });
});
