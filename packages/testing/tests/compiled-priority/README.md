# Compiled package priority regression

This fixture is deliberately red against the installed StyleX 0.19.0 pipeline.
Use Node 24.18.0 and an existing dependency workspace; it does not install packages
or write to that workspace.

```sh
node packages/testing/tests/compiled-priority/proof.mjs \
  /absolute/empty-scratch /absolute/read-only-dependency-workspace
```

The runner builds fresh token and React packages, emits declarations, checks the
consumer's types, and builds production Vite using the actual Storybook compiler
configuration. Browser assertions target native keyboard state, opacity, scalar
pseudo-element styles, geometry and property precedence. Matched selectors are
diagnostic evidence, not the browser assertion targets.

It also loads the fresh package stylesheet after the consumer stylesheet to
verify dynamic `paddingTop: 29` against the real compiled modal `padding: 24`
map in both stylesheet orders. Results, compiler metadata, before/after Lightning
CSS and CJS/ESM option checks are written beneath scratch.

## Rejected experiment

```sh
node packages/testing/tests/compiled-priority/proof.mjs \
  /absolute/different-empty-scratch /absolute/read-only-dependency-workspace --legacy
```

This explicitly applies `unplugin-forwarding.experimental.patch` to a scratch
copy and enables the existing public `legacyDisableLayers` option only in scratch.
The patch modifies MIT-licensed `@stylexjs/unplugin`; upstream copyright headers
and license files remain unchanged in the staged package.

The mode fixes checked opacity and Radio scale but fails the late-package padding
assertion: the runtime variable remains `29px`, while computed padding becomes
`24px`. Two full UI runs also failed the Modal, AlertDialog and Drawer concrete
contracts, with 248 of 251 tests passing. Single-file runs passed because the
stylesheet insertion order differed. This mode must not be adopted as a fix.
Neither pnpm patch registration nor production compiler options enable it.

The additional `--application-order` scratch experiment sets the public
`styleResolution: "application-order"` option consistently in fresh package and
consumer builds while enabling the same experimental forwarding flag. It also
fails: checked scalar styles pass, but late package CSS resets dynamic physical
padding and LTR/RTL logical/physical overrides. Its full UI run passed 248 of 251
tests, with the same three concrete popup contracts failing.

The installed application-order mode retains the padding shorthand and null
overlap metadata; it does not expand padding into separate longhands. The package
map's `kmVPX3` shorthand and caller's `kLKAdn` physical longhand remain distinct.
Mode selection affects the compiled overlap-key ABI used by `stylex.props`;
packages and consumers must be rebuilt consistently. `compiler.json` records
the generated maps for both modes, and `results.json` records the actual imported
package and consumer maps. Matching modes are not enough to fix this failure.

The directional assertions preserve the existing property-specificity contract:
logical-only start/end values reverse in RTL; physical left/right values do not.
Mixed physical and logical declarations retain the baseline physical-property
priority, regardless of their composition order. The withdrawn default-mode
baseline passed all 251 UI tests; the original scalar collision remains red.

## Processor design comparison

The upstream processor groups raw priorities by `floor(priority / 1000)`, then
uses each **present group's ordinal index** for guard specificity and layer names.
The same atom therefore changes rank when unrelated groups occur in another bundle.

- **Stable numeric bucket mapping:** a bounded upstream processor change could
  derive guard rank and layer identity from the numeric bucket instead of its
  ordinal. This retains shorthand/general/physical/pseudo-element tiers and fixes
  the observed bucket mismatch without removing specificity. It still needs tests
  for sub-bucket priorities, RTL, media conditions, variables and layers. Existing
  sub-bucket ordering relies on globally sorted CSS; independent assets can still
  reverse equal-specificity conditional rules. It is not yet a complete fix.
- **Full numeric-priority specificity mapping:** this needs a defined domain for
  fractional priorities and nested selectors, a bounded encoding, and an upstream
  compatibility decision. Repeating guards according to raw priority is not an
  acceptable ad hoc substitute.
- **One processing pass over all raw metadata:** this preserves global sorting,
  deduplication and priority assignment. Precompiled packages currently do not
  expose that metadata. Implementing it would add a package artifact/consumption
  contract and bundler integration for tsdown, Vite and Webpack, rather than a
  small configuration fix.

No replacement processor algorithm or metadata pipeline is implemented here.

## Current pipeline status

The rejected experiments above remain historical results; none was rewritten as
a successful fix. A separate, unpublished `@lenso/stylex-build` 0.1.0 package
now performs raw package and application StyleX processing in one pass. This is
the current pipeline direction and does not depend on adopting those historical
flags or experiments.

The frozen tool candidate independently passes the original three CSS-delivery
and raw-query regressions. On Node 24.18.0, its unchanged default documentation
build generates 358 pages and passes 136 locale, 16 native API and 8 SSR
stylesheet checks. Exact source and artifact hashes are recorded in the
[docs acceptance capsule](../../../../apps/docs/test/final-source-acceptance.json).
The [UI/Storybook capsule](final-ui-storybook-acceptance.json) records the final
253-test UI suite, full strict types, 583 source plus 9 Local story inventory,
and representative production iframe proofs. Neither publication nor complete
upstream parity is claimed here.
