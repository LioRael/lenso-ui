# Final 0.9 current-source validation

**Acceptance passed on the current-source candidate.** One new complete UI run
and one new complete maintained live-example run were performed after the
runtime and navigation repairs. No publication or landing was performed.

Completed: 2026-10-03T05:41:46Z.

## Candidate identity

The isolated fixture was copied from the actual current generated/code checkout,
not the historical S7 or v2 fixture:

- Source: `/Users/leosouthey/Projects/framework/lenso-ui/.delta/worktrees/bbpqwzs45xz4/lenso-ui`.
- Source Git base: `d9aba485aa43b207f0808f9ba62ef7ead39584bb`.
- Fixture and evidence: `/Users/leosouthey/Projects/framework/lenso-ui/.delta/worktrees/45zf2esagvka/lenso-ui/test-results/final-current`.
- Fixture source: `workspace/`; initial inputs: 4,214 files.
- Final source-manifest digest: `b39c127cb1178cc28adcc4b0cf019381e8090b41f468c6a35f9eef4d9b889a86`.
- Final lock SHA-256: `41ba059ef3670aab1e37cf49953f829324afaf015b3873d0438945eabd4c3f41`.
- Next production BUILD_ID: `5NrJHJRRJS0q65QlXtc2-`.
- Contract v2 digest: `fd8254040124367659975f2bcd2ca784a7943c4001b201a3665e114d3fd7e432`.
- Contract bytes: 12,518,029; file SHA-256: `cb4f2c6ea1e0f8c3393fabea4d3bd3fd93b37d1a5be5b82228cc361aeb1ee92b`.

Fresh preparation reproduced the supplied current contract exactly. No copied
source file changed during regeneration. The source manifest, not the fixture's
empty Git boundary commit, identifies the tested code.

Only these explicitly owned repairs overlaid the source:

| File                                                            | SHA-256                                                            | Read-only owner |
| --------------------------------------------------------------- | ------------------------------------------------------------------ | --------------- |
| `apps/docs/scripts/examples-browser-check.mjs`                  | `c7593490cf4aca076db9a19821522fd6b207bc5a27bfd17b86e348c472bee603` | `mhr3behhr4yj`  |
| `apps/docs/scripts/examples-navigation.browser.mjs`             | `0e38f3668edc6e3c257097e010cd522259ed0eb21d66e931a32ecf896eeb2327` | `mhr3behhr4yj`  |
| `packages/react/src/components/modal/overlay-fidelity.test.tsx` | `d8697c19ca1ee197a4eb88e2c3528101b27aae075005d90edf2803d85005dc0f` | `qvwepcwcah6z`  |
| `packages/storybook/stories/menu-toast-proof.mjs`               | `c26ae2930bc0fb177510812c98e86e3d6b14b6926ffeb999f91e769ae4a91f2e` | `qvwepcwcah6z`  |
| `apps/docs/scripts/browser-check.mjs`                           | `2d95ee8efc6973414eca026e47a2c856c8e40e89d4f42937d3ac22885af9b1c5` | `abvxake41prp`  |
| `apps/docs/test/shell.browser.mjs`                              | `dde2ee704557bbbd21404487e51314319027f4d98429946f1783d5f0e4c2f2e0` | `abvxake41prp`  |

Navigation's `.test.mjs` to `.browser.mjs` rename preserved the exact body and
prevented a production-server browser proof from accidentally entering the
serverless Node unit-test glob. It was run explicitly.

## Environment

Node: `/Users/leosouthey/.local/share/mise/installs/node/24.18.0/bin/node`.
The installed graph was copied only from the final-lock owner. Its 21 `@lenso`
links and installed binary shims were rebound to this fixture's current packages.
No provider directory was written and no dependency or root lock was changed.
All commands used direct installed binaries/scripts, never `pnpm run`.

The supplied old browser-cache path was physically absent in this session.
With explicit parent authorization, the installed Playwright CLI downloaded
only its matching browser into the ignored fixture cache:

```sh
PLAYWRIGHT_BROWSERS_PATH=<fixture>/test-results/final-browser-cache \
  /Users/leosouthey/.local/share/mise/installs/node/24.18.0/bin/node \
  apps/docs/node_modules/playwright/cli.js install chromium --only-shell
```

Playwright 1.63.0; headless shell revision 1243; actual `browser.version()`:
153.0.8010.12. Executable SHA-256:
`a0bfe7b4da4787b66058477d696cd1d09065d25f06a548947722b9af77ee8282`.
The install command and installed `browsers.json` are in `browser-identity.json`.
No global cache, OS dependencies or client version were changed.

## Results

| Check                                 | Result                                                                                                                                 | Evidence log                                               |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Fresh StyleX support/tokens/UI builds | PASS                                                                                                                                   | `stylex-build.log`, `tokens-build.log`, `ui-build.log`     |
| Fresh central docs preparation        | PASS, exact current contract                                                                                                           | `prepare-docs.log`                                         |
| Root formatting                       | 2,239 files PASS                                                                                                                       | `root-format-attempt-2.log`                                |
| Root lint                             | 2,149 files; zero warnings/errors                                                                                                      | `root-lint.log`                                            |
| Root/policy/core/legal tests          | 33/33 PASS; structural 84-family check PASS                                                                                            | `root-policy-core-legal.log`                               |
| Docs Node tests                       | 52/52 PASS                                                                                                                             | `docs-node-attempt-2.log`                                  |
| StyleX support/tokens tests           | 9/9 and 1/1 PASS                                                                                                                       | `support-tokens-tests-attempt-2.log`                       |
| Strict UI/docs/Storybook              | Original configs PASS                                                                                                                  | `ui-strict.log`, `docs-strict.log`, `storybook-strict.log` |
| Complete original UI suite            | **260/260 in 38 files PASS, one full run**                                                                                             | `ui-full.log`                                              |
| Preserved primitive browser suite     | 11/11 PASS; all 14 package files identical to input and repository HEAD                                                                | `primitives-original.log`, `final-candidate.json`          |
| Default Next production build         | PASS; 188 authored paths; 193 static-generation slots                                                                                  | `docs-production.log`                                      |
| Fresh Storybook production build      | PASS; 592 stories and 31 docs entries                                                                                                  | `storybook-production.log`                                 |
| Native Menu/toast production proof    | 54 active light/dark mounts plus actual keyboard, focus, submenu, timer, geometry and mobile checks PASS; zero uncaught browser errors | `menu-toast-production-attempt-2.log`                      |
| Authored docs                         | 88 exact Copy Markdown/navigation/search/sitemap cases PASS; zero client errors                                                        | `docs-authored-88.log`                                     |
| Unchanged native API proof            | 16 production display/clipboard cases PASS                                                                                             | `docs-native-api-browser.log`                              |
| Navigation diagnosis                  | 45 mounts PASS; all 10 negative mutations reject; held-prefetch readiness passes while old networkidle rejects                         | `navigation-bounded.log`                                   |
| Complete maintained live matrix       | **5,456/5,456 PASS; zero missing references and failures; one full run**                                                               | `live-maintained-full.log`, `live-maintained/report.json`  |
| Repaired maintained docs smoke        | Normal docs-CWD direct `node scripts/browser-check.mjs` PASS                                                                           | `docs-maintained-smoke-final.log`                          |
| Final two smoke harness files         | Scoped format/lint PASS; no warnings/errors                                                                                            | `final-harness-format.log`, `final-harness-lint.log`       |

Next's unmodified default build used **8 workers on this machine**, not the
historical 9-worker output from the other machine. No worker override or build
configuration change was used.

The full live run took 1,541.416 seconds, from 05:12:02.706Z to 05:37:44.122Z.
Every EN/CN × light/dark × 1440/390 mode checked exactly 682 mounts. Original
geometry, content, overflow, axe semantics and client-error assertions remained
enabled; no scope skip or new exclusion was added. Zero client errors follows
from the passing original assertions, not an invented report field.

The existing axe color-contrast exception remains deliberate. Exact upstream
colors are not a WCAG AA compliance claim.

## Artifact binding

Artifact digests hash each sorted per-file inventory including paths, sizes and
content SHA-256. Next cache files are excluded. Exact inventories are retained.

| Artifact  | Files | Inventory digest                                                   |
| --------- | ----- | ------------------------------------------------------------------ |
| Next      | 3,856 | `1fa48cd532dea8733b13d17564cd321ec526e171df1343da9b01667ce1920d7d` |
| Storybook | 286   | `816962d92baf820bcc353ecde0c4b50c9b49e0ef364228a71cec2cbab8047503` |
| Tokens    | 443   | `3da2fb424be2ffc43b974f9dd605022c809c16d45ceae96fdd752aa528d8a6af` |
| UI        | 554   | `789dad29afcabc56f8084fe4ccddecb271166a2d76ce8fcedbadb165099249de` |

Full live-report SHA-256:
`5298f7f9363a65482aead2747cfee197558f1c1e4e7191aa417913c24b58215e`.

`inputs.json`, `final-source-manifest.json`, `results.json`,
`final-candidate.json`, browser identity, all production inventories, logs and
complete mount report are retained beneath the evidence directory.

## Preserved failures and boundaries

Original historical v2 failed reports under the read-only `srth041rag3a`
checkout were neither edited nor replaced. New reports identify a different,
current-source candidate.

Own preflight failures remain in logs: the outer ignored fixture initially gave
format zero targets; its new private Git boundary initially lacked HEAD for the
importer's unpinned-checkout test; the supplied browser cache was absent; the
first Menu-proof command incorrectly passed a relative installed-module path;
and own server readiness initially called the boolean `Response.ok`.
These were bounded fixture/command corrections, not product/assertion changes.

The first maintained docs smoke exposed stale archived Dropdown/quick-start
assumptions. Its original failure remains `docs-authored-browser.log`; the
owning worker supplied the exact canonical harness repair above. Only that
bounded normal smoke and scoped format/lint were run after this harness-only
overlay. Production artifacts, generated data, full UI and full live suites
were not rebuilt or rerun.

Only this worker's own production servers were stopped after completion.
CLI/MCP package/consumer proof remains separately owned; this report does not
claim it. No primitives, palette/theme, product API, dependency graph, provider
source, publication state or shared Git history was changed.
