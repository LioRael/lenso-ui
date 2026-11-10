import { createWebHatch } from "./lenso-ui/browser.js";
import { styleRules } from "./style-config/index.js";

export const { element, elementEnded } = createWebHatch(styleRules);
