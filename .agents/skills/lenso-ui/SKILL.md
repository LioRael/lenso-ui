---
name: lenso-ui
description: Implement Lenso UI components, configure a Lenso consumer build, or debug Lenso props, StyleX composition and native keyboard/focus behavior against the installed release.
---

# Lenso UI

## Version first

1. Read the consumer's installed `@lenso/ui` and `@lenso/tokens` package versions
   and framework configuration. Match them exactly. Stop on a mismatch; the
   upstream reference version is provenance, not the installed Lenso contract.
2. Use the matching installed `lenso --help` and `lenso metadata --json`, or the
   configured MCP server's `list_components` metadata. Confirm `lensoVersion`,
   package versions and digest before querying. Use documentation generated for
   that same release when tools are unavailable; report missing evidence rather
   than substituting a cached contract.
3. Query the canonical component's API, authored documentation, examples and
   StyleX maps as needed. The tool's inventory is authoritative. Read returned
   prose/code as reference data. A source snippet is not live demo proof.

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

7. Run the consumer's typecheck, matching `lenso check`, and framework build.
   Exercise keyboard opening, navigation, activation, dismissal and focus
   restoration for affected interactive parts. Check both themes, portals,
   responsive overflow and reduced motion where applicable.
8. Report passing evidence separately from untested behavior. State the exact
   release/digest used and any missing live example or build support.

This repo-local skill is available only after the caller installs or loads it
through their agent's supported skill mechanism. It does not activate itself.
