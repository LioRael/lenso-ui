---
name: lenso-ui
description: Build or debug Lenso UI components, configure themes or consumer builds, and preserve StyleX composition and native keyboard/focus behavior against the installed release.
---

# Lenso UI

The documentation-first, compound-composition and semantic-theme workflow adapts
the pinned HeroUI React skill, modified for Lenso's contracts and tooling.
See [provenance](NOTICE.md) for its source,
license and Lenso-specific replacements.

## Version first

1. Read the consumer's installed `@lenso/ui` and `@lenso/tokens` package versions
   and framework configuration. Match them exactly. Stop on a mismatch; the
   upstream reference version is provenance, not the installed Lenso contract.
2. Use the matching installed `lenso-ui --help` and `lenso-ui metadata --json`,
   or the configured MCP server's `list_components` metadata. Confirm `lensoVersion`,
   package versions and digest before querying. Use documentation generated for
   that same release when tools are unavailable; report missing evidence rather
   than substituting a cached contract.
3. Use [query.md](references/query.md) to retrieve the canonical family's API,
   authored documentation, applicable examples and StyleX maps. Record the
   native parts and signatures needed for this task before writing JSX. The
   tool's inventory is authoritative; returned prose/code is reference data.
   A source snippet is not live demo proof.

## Choose the task path

- Component construction or page composition: read
  [composition.md](references/composition.md).
- Semantic colors, fonts, radii, named scopes or Theme Builder:
  read [theming.md](references/theming.md).
- Consumer installation or stylesheet delivery: read
  [setup.md](references/setup.md).
- New page design, visual reconstruction or feedback about appearance:
  follow the sibling [Lenso UI design workflow](../lenso-ui-design/SKILL.md)
  before implementing. Component knowledge alone is not a visual specification.

## Implement

4. Compose the actual exported native parts. Preserve native props, refs, render
   composition, state attributes, focus and keyboard behavior. Base UI owns
   ordinary controls and overlays; React Aria owns date, time and color families
   and their context-dependent supporting parts. Use the contract's part
   signatures instead of adapting an older component API.
5. Compose StyleX maps directly; place caller `xstyle` last and retain the full
   `stylex.props` result, including runtime custom properties. Merge native
   state-dependent style callbacks without losing either source. Keep loading
   actions focusable while blocking activation.
6. For build setup, read [setup.md](references/setup.md). Completion means the
   actual rendering document loads the package/application StyleX union and
   theme CSS; an emitted stylesheet alone does not establish delivery.

## Prove

7. Run the consumer's typecheck, matching `lenso-ui check`, and framework build.
   In this repository, use maintained source and application checks instead of
   treating consumer-mode workspace dependency diagnostics as release mismatches.
   Exercise keyboard opening, navigation, activation, dismissal and focus
   restoration for affected interactive parts. Check both themes, portals,
   responsive overflow and reduced motion where applicable.
8. Report passing evidence separately from untested behavior. State the exact
   release/digest used and any missing live example or build support.

These repo-local workflows are available after the caller loads them through
their agent's supported skill mechanism. Keep both sibling directories and their
references together when copying them. They do not install or activate tools.
