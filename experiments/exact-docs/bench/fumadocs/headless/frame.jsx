import { BenchLink, PageActions } from "./client";
import { ScopeControls } from "./scope-controls";
import { Search } from "./search";
import { Contents } from "./toc";
export function PageFrame({ page, tree }) {
  return (
    <div lang={page.locale}>
      <BenchLink href={page.path + "#docs-content"}>Skip to content</BenchLink>
      <header>Documentation comparison</header>
      <ScopeControls page={page} />
      <nav aria-label="Documentation">
        {tree.children.map((group) => (
          <section key={group.$id ?? group.name} aria-label={group.name}>
            <h2>{group.name}</h2>
            {group.children.map((item) => (
              <BenchLink
                key={item.url}
                href={item.url}
                aria-current={item.url === page.path ? "page" : "false"}
              >
                {item.name}
              </BenchLink>
            ))}
          </section>
        ))}
      </nav>
      <Search key={page.scope} scopeIndex={page.scopeIndex} />
      <Contents toc={page.toc}>
        <main id="docs-content" tabIndex={-1}>
          <p>{page.description}</p>
          <PageActions markdown={page.markdown} href={page.markdownUrl} />
          <article dangerouslySetInnerHTML={{ __html: page.html }} />
          <nav aria-label="Adjacent pages">
            {page.previous && (
              <BenchLink href={page.previous.href}>Previous: {page.previous.title}</BenchLink>
            )}
            {page.next && <BenchLink href={page.next.href}>Next: {page.next.title}</BenchLink>}
          </nav>
        </main>
      </Contents>
    </div>
  );
}
