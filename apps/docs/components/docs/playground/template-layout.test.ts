import { describe, expect, it } from "vitest";

import agentPageConfig from "../../../contents/templates/agent-page/playground.json";
import pageLayoutConfig from "../../../contents/templates/page-layout/playground.json";
import settingsPageConfig from "../../../contents/templates/settings-page/playground.json";
import { parsePlaygroundConfig } from "./config";

const templateLayout = {
  bodyClassName: "template-playground-body",
  sectionClassName: "template-playground",
  stageClassName: "template-rendered-stage",
};

describe("template playground layout", () => {
  it.each([
    ["Agent Page", agentPageConfig],
    ["Page Layout", pageLayoutConfig],
    ["Settings Page", settingsPageConfig],
  ])("keeps %s on the full-width preview contract", (_name, config) => {
    expect(parsePlaygroundConfig(config)).toMatchObject(templateLayout);
  });
});
