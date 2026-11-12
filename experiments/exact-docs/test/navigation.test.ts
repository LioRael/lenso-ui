import { expect, test } from "bun:test";
import { preparePageHtml } from "../src/delivery.ts";
// A serialized bootstrap must compile without module context and must not let route text end its script.
test("first-navigation capture is standalone and escapes route data in early HTML", () => {
  const html = preparePageHtml('<base href="/"><main></main>', {
    modules: ["./app.js"],
    styles: [],
    routes: ["/guide-001", "/</script><img src=x onerror=bad()>", "/中文"],
  });
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  expect(scripts).toHaveLength(1);
  expect(html).not.toContain("</script><img");
  expect(html).toContain("\\u003c/script>");
  expect(() => new Function(scripts[0]![1]!)).not.toThrow();
  expect(scripts[0]![1]).toContain("document.baseURI");
  expect(preparePageHtml('<base href="/">')).not.toContain("captureNavigation");
});
