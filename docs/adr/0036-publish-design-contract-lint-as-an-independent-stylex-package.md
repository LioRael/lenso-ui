---
status: accepted
---

# Publish design-contract lint as an independent StyleX package

`@lenso/design-lint` is maintained inside the Lenso UI repository but is independently publishable. Keeping the package here lets its real integration fixture use the repository's generated token contract and Button ownership contract without creating a second GitHub repository or coupling the linter to documentation or Console internals.

The first adapter is StyleX. `@stylexjs/eslint-plugin` remains responsible for StyleX correctness, including valid properties and values, shorthand behavior, ordering, and compiler-specific syntax. The design-contract package adds project-configurable token-family and component-ownership policy and should run alongside the official plugin rather than duplicate it.

The linter consumes generated token contract JSON after generation; the DTCG sources and resolver under `packages/tokens/src` remain the authority. Version one reports only locally provable `stylex.create` values and JSX `xstyle` references, skips dynamic or cross-file compositions conservatively, and does not apply autofixes whose semantics could change.
