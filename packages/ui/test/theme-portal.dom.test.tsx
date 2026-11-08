import { afterEach, expect, test } from "bun:test";
import { synchronizeThemePortal } from "../src/utils/sync-theme-portal.js";

afterEach(() => document.body.replaceChildren());

function fixture() {
  const ancestor = document.createElement("div");
  const scope = document.createElement("div");
  const host = document.createElement("div");
  ancestor.append(scope);
  document.body.append(ancestor, host);
  return { ancestor, scope, host };
}

test("unchanged portal themes produce no mutations during unrelated ancestor changes", () => {
  const { ancestor, scope, host } = fixture();
  scope.style.setProperty("--consumer-accent", "rgb(20 40 60)");
  scope.dataset["theme"] = "light";
  synchronizeThemePortal(scope, host);
  const observer = new MutationObserver(() => {});
  observer.observe(host, { attributes: true });
  ancestor.style.overflow = "hidden";
  synchronizeThemePortal(scope, host);
  synchronizeThemePortal(scope, host);
  expect(observer.takeRecords()).toHaveLength(0);
  expect(host.style.getPropertyValue("--consumer-accent")).toBe("rgb(20 40 60)");
  observer.disconnect();
});

test("portal snapshots retain consumer values and update or remove inherited theme state", () => {
  const { ancestor, scope, host } = fixture();
  ancestor.dataset["theme"] = "dark";
  scope.dataset["theme"] = "light";
  scope.style.direction = "rtl";
  scope.style.fontFamily = '"Example Font", sans-serif';
  scope.style.setProperty("--consumer-content", '"consumer value"');
  scope.style.setProperty("--consumer-accent", "#123456");
  synchronizeThemePortal(scope, host);
  expect(host.dataset["theme"]).toBe("light");
  expect(host.style.direction).toBe("rtl");
  expect(host.style.fontFamily).toBe(scope.style.fontFamily);
  expect(host.style.getPropertyValue("--consumer-content")).toBe('"consumer value"');
  delete scope.dataset["theme"];
  scope.style.removeProperty("--consumer-content");
  scope.style.setProperty("--consumer-accent", "#abcdef");
  synchronizeThemePortal(scope, host);
  expect(host.dataset["theme"]).toBe("dark");
  expect(host.style.getPropertyValue("--consumer-content")).toBe("");
  expect(host.style.getPropertyValue("--consumer-accent")).toBe("#abcdef");
  delete ancestor.dataset["theme"];
  synchronizeThemePortal(scope, host);
  expect(host.hasAttribute("data-theme")).toBe(false);
});
