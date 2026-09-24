import { describe, expect, it } from "vitest";

import { defineDocsConfig, docsHref, routeSlug } from "./config";
import { createDocsNavigation } from "./navigation";

const config = defineDocsConfig({
  title: "Lenso",
  basePath: "/docs",
  tabs: [
    { label: "Core", path: "core" },
    { label: "Web", path: "web" },
  ],
});

const pages = [
  { id: "core/(start)/quick-start", data: { title: "Quick start" } },
  { id: "core/index", data: { title: "Core" } },
  { id: "core/(start)/mental-model", data: { title: "Mental model" } },
  { id: "web/index", data: { title: "Web" } },
];

describe("content conventions", () => {
  it("maps index and grouping directories without exposing them in URLs", () => {
    expect(routeSlug("core/(start)/quick-start")).toBe("core/quick-start");
    expect(docsHref(config, "core/index")).toBe("/docs/core");
    expect(docsHref(config, "core/(start)/quick-start")).toBe("/docs/core/quick-start");
  });

  it("uses meta.ts order and keeps tabs scoped to their own pages", () => {
    const nav = createDocsNavigation(config, pages, [
      { directory: "core", meta: { pages: ["index", "(start)"] } },
      { directory: "core/(start)", meta: { pages: ["mental-model", "quick-start"] } },
    ]);
    expect(nav[0]?.pages.map((page) => page.title)).toEqual([
      "Core",
      "Mental model",
      "Quick start",
    ]);
    expect(nav[0]?.groups[1]?.title).toBe("start");
    expect(nav[1]?.pages.map((page) => page.title)).toEqual(["Web"]);
  });

  it("rejects duplicate paths after grouping directories are removed", () => {
    expect(() =>
      createDocsNavigation(config, [
        { id: "core/(start)/intro", data: { title: "Intro" } },
        { id: "core/(reference)/intro", data: { title: "Intro again" } },
        { id: "web/index", data: { title: "Web" } },
      ]),
    ).toThrow(/route collision/);
  });

  it("routes a tab without index to its first real page", () => {
    const nav = createDocsNavigation(config, [
      { id: "core/intro", data: { title: "Intro" } },
      { id: "web/index", data: { title: "Web" } },
    ]);
    expect(nav[0]?.href).toBe("/docs/core/intro");
  });
});
