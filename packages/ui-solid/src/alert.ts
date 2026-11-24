import { alertStyles } from "@lenso/tokens/alert";
import { materialStyles } from "@lenso/tokens/materials";
import { htmlPart } from "./parts.js";

export const AlertRoot = htmlPart("div", "alert", () => [
  materialStyles.root,
  alertStyles.root,
  materialStyles.accessible,
]);
export const AlertIndicator = htmlPart("div", "alert-indicator", () => alertStyles.indicator);
export const AlertTitle = htmlPart("div", "alert-title", () => alertStyles.title);
export const AlertDescription = htmlPart("div", "alert-description", () => alertStyles.description);
export const AlertContent = htmlPart("div", "alert-content", () => alertStyles.content);

export const Alert = Object.assign(AlertRoot, {
  Root: AlertRoot,
  Indicator: AlertIndicator,
  Title: AlertTitle,
  Description: AlertDescription,
  Content: AlertContent,
});
