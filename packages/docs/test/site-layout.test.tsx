import assert from "node:assert/strict";
import { test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { FrameworkProvider } from "fumadocs-core/framework";
import { DocumentationSiteLayout } from "@lenso/docs/client";

test("sections remain sidebar destinations without adding header tabs or a tab panel", () => {
  const html = renderToStaticMarkup(
    <FrameworkProvider
      usePathname={() => "/guides/install"}
      useParams={() => ({})}
      useRouter={() => ({ push() {}, refresh() {} })}
    >
      <DocumentationSiteLayout
        brand={{ title: "Docs", url: "/" }}
        currentUrl="/guides/install"
        activeSection="guides"
        sections={[
          { id: "guides", title: "Guides", url: "/guides" },
          { id: "reference", title: "Reference", url: "/reference" },
        ]}
        navigation={[]}
        slots={{ search: <button type="button">Search</button> }}
      >
        <main>Installation</main>
      </DocumentationSiteLayout>
    </FrameworkProvider>,
  );
  const header = html.slice(html.indexOf("<header"), html.indexOf("</header>"));
  assert.ok(header.includes("Search"));
  assert.ok(!header.includes("Guides"));
  assert.ok(!html.includes('role="tablist"'));
  assert.ok(!html.includes('role="tabpanel"'));
  assert.match(html, /href="\/guides"[^>]*aria-current="page"/u);
  assert.ok(html.includes('href="/reference"'));
  assert.ok(html.includes("<main>Installation</main>"));
});
