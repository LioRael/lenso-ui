# Native text semantics in the pinned Exact compiler

The Web catalog still includes Typography and Kbd. Their native HTML surface is
not complete in Exact commit `956ae33a35ffa5313d7be3cebc55ed84f9480e0a`.
The owner chose to retain upstream Exact unchanged and keep these gaps open.
No compatibility patch is required or applied by this package.

## Verified boundary

An isolated Contract consumer attempted:

```text
component App
  view
    column
      box semanticTag="kbd"
        box semanticTag="abbr" title="Command"
          text "⌘"
      box semanticTag="p"
        text "Paragraph"
      box semanticTag="code"
        text "value"
```

The official `host/web-js/build.mjs` rejects each `semanticTag` attribute with
`lower-unknown-attr`. It is an internal plan property, not an author-facing
attribute. Direct `p`, `code` and related HTML spellings are redirected by the
Contract compiler's diagnostics to its `text` vocabulary. The pinned Web host's
semantic-element whitelist does not include `kbd`, `abbr`, `p` or `code`.
This concerns authored semantic containers, not every HTML node the host may
generate through other renderers. Other paths have not established the required
component composition and remain unverified.

Headings are different: `h1`–`h6` are supported Contract syntax, lowered to text
with a heading role and level. The Web host emits native heading elements for
static text heading levels. Card and EmptyState titles use that existing text
path; no compiler change is involved. Dynamic heading levels retain ARIA
semantics where the native host tag cannot be selected statically.

## Remaining component work

- Kbd's native `kbd`/`abbr` elements, including expanded key names and ordinary
  arbitrary key content, require a supported declaration path. A styled box is
  not reported as a completed native keyboard component.
- Typography's native paragraph/code elements, complete polymorphic rendering
  and Prose's HTML-selector contract remain open. Supported heading/type recipes
  alone do not complete this family.
- Other Card/EmptyState composition can proceed with native/ARIA heading
  semantics and the unchanged compiler; description containers are documented as
  Contract boxes, not native `p` elements.

Future upstream support can close these gates. Do not replace Exact-owned DOM,
change the shared compiler checkout or silently add a fork to consumer setup.
The full Web catalog target remains in COMPONENTS.md; these are explicit
coverage gaps rather than removed requirements.
