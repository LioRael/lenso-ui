import assert from "node:assert/strict";
import { test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { FrameworkProvider } from "fumadocs-core/framework";
import { Heading } from "fumadocs-ui/components/heading";
import { DocumentationRoot } from "../src/root";
import { DocumentationSearch } from "../src/search";

// Locale-aware search indexes already have coverage; the shell must also use
// the configured language rather than assume that a route code is a language.
test("the documentation root localizes framework controls from the registered language", () => {
  for (const [code, language, label, anchorLabel] of [
    ["cn", "zh-CN", "搜索文档", "复制章节链接"],
    ["zh", "zh-CN", "搜索文档", "复制章节链接"],
    ["primary", "zh-Hans", "搜索文档", "复制章节链接"],
    ["en", "en-US", "Search documentation", "Copy Anchor Link"],
  ] as const) {
    const html = renderToStaticMarkup(
      <FrameworkProvider
        usePathname={() => "/"}
        useParams={() => ({})}
        useRouter={() => ({ push() {}, refresh() {} })}
      >
        <DocumentationRoot config={{ title: "Docs" }} locale={{ code, language, label: code }}>
          <DocumentationSearch from="/search.json" compact />
          <Heading as="h2" id="section">
            Section
          </Heading>
        </DocumentationRoot>
      </FrameworkProvider>,
    );
    assert.ok(html.includes(`lang="${language}"`));
    assert.ok(html.includes(`aria-label="${label}"`), `${code} must use ${language} controls`);
    assert.ok(html.includes(anchorLabel), `${code} must also localize Fumadocs controls`);
  }
});
