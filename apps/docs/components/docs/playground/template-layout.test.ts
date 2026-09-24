import { describe, expect, it } from "vitest";

import consoleWorkspaceConfig from "../../../contents/templates/console-workspace/playground.json";
import settingsPageConfig from "../../../contents/templates/settings-page/playground.json";
import { parsePlaygroundConfig } from "./config";

describe("template playground layout", () => {
  it.each([
    ["Console Workspace", consoleWorkspaceConfig],
    ["Settings Page", settingsPageConfig],
  ])("keeps %s on the full-width preview contract", (_name, config) => {
    expect(parsePlaygroundConfig(config)).toMatchObject({ layout: "template" });
  });
});
