---
description: Author Markdown, interactive pages and root data extensions.
group: Documentation
---

# Authoring

Register pages in `docs.json`. Navigation follows the configured order.

## Page metadata

Markdown pages can use YAML frontmatter for `title`, `description`, `group`, `nav` and `search`. Values in `docs.json` take precedence. If no title is supplied, the first H1 becomes the page title.

Groups organize consecutive navigation entries. Previous and Next follow the configured order. A page with `nav: false` stays accessible by URL while leaving the navigation sequence; `search: false` also removes it from search.

Use Copy Markdown or Open Markdown to access the original source, including its frontmatter. These actions are available on Markdown pages.

## Markdown pages

Use headings, paragraphs, links, images, lists, quotations, tables and fenced code. Raw HTML and MDX are deliberately rejected in this prototype.

```json
{ "path": "/guide", "title": "Guide", "source": "guide.md" }
```

## Exact pages

Export a Contract component with no required props. Its state and actions belong to the page.

```contract
component Playground
  state count = 0
  action increment
    count = count + 1
  view
    button press=increment
      text `Count: ${count}`
```

The [working playground](/playground) is compiled by Exact, rather than rendered as a source snippet.

## Languages and versions

Declare `locales` and `versions` in `docs.json`. Pages can specify `locale` and `version`; omitted values use the configured defaults. Keep the same logical `id` across translated or versioned counterparts and give each variant its own concrete URL.

Language and version controls preserve the current document when a counterpart exists. Otherwise they use the target scope's first navigation page. Navigation, Previous/Next and search stay inside the current language and version.

Try the [Chinese guide](/zh/authoring) or the [archived version 1 guide](/v1/authoring). The archived files are maintained separately from this page.

## Root data

For reads, writes and timers, configure a root extension in `docs.json`. Its Contract member file declares `resource`, `mutation`, `task` and `provide`; custom pages receive the values and actions through `inject`. The TypeScript data module exports `grants` and `answer`.

```json
{
  "root": {
    "source": "data/root.contract",
    "data": "data/source.ts",
    "imports": [{ "source": "data/models.contract", "names": ["Counter"] }]
  }
}
```

The [root data example](/data) reads a counter, submits updates, recovers from failures and runs a pausable timer. Its task uses `when docsPath == "/data"` to stop when you leave the page. The counter is stored in memory for the current session.

> A page can own its state while the documentation framework owns its route.

| Source   | Rendering               |
| -------- | ----------------------- |
| Markdown | Compiled document nodes |
| Contract | Your Exact component    |
