> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# Resource transaction boundary experiment

This follow-up remains an opt-in headless compiler-output/runtime experiment. Production compilation, SDK source, native hosts and the default theme are unchanged.

## Implemented boundary

`transaction.mjs` extracts the original native `commit` and `settle` functions into generated `transaction.js`. Lexical references are resolved against Babel bindings: transaction/resource state uses live accessors; navigation validation, DOM publication, focus, transitions and host command dispatch use a separate host interface. Mutable bindings remain shared; constants/imports have getters only. No second resource store or copied root state is created. The original native rollback, settlement, queued request and commit ordering are retained.

This is an interface boundary, **not yet an independently loadable resource runtime**. The shared runtime constructs the host adapter and still retains its dependencies. Resource request/reply, store/overlay state and the checked TypeScript adapter remain in the shared runtime. The accessor layer increases code size and is not a demonstrated search CPU optimization. A future physical split must relocate the host adapter and establish a lifecycle-safe registration boundary; merely extracting functions is insufficient.

Full-view dependencies now preload without execution, alongside search dependencies. Navigation still activates the original generated view on the same root. This trades earlier bandwidth for fewer navigation fetch dependencies, while retaining the approved download-early/execute-on-interaction policy.

## Same-run measurements

November 11, 2026; 300 URLs, two languages, two versions, five samples per implementation/action, Chromium, gzip, disabled cache, 4x CPU throttling, same zero-debounce substring algorithm and unique paragraph query. Fumadocs is already active before action timing; cold navigation totals are included below. Earlier prototype cohorts were measured separately and must not be compared as controlled before/after results.

## Slow cohort

Latency: 80 ms; download: 200000 bytes/s. Median values; timings in milliseconds, transfer metrics in bytes.

| Metric                  | Full Exact | Prototype | Fumadocs matched |
| ----------------------- | ---------: | --------: | ---------------: |
| fcpMs                   |        220 |       232 |              288 |
| firstCounterMs          |      488.1 |     148.3 |            116.2 |
| firstSearchMs           |      614.9 |     546.7 |            468.2 |
| coldOpenToSearchMs      |        937 |     918.6 |           1758.4 |
| searchScriptMs          |       38.3 |      40.4 |             26.4 |
| coldNavMs               |      240.5 |     342.2 |            235.8 |
| backMs                  |       61.8 |      58.5 |             35.1 |
| jsThroughSearch         |     122697 |    113876 |           202229 |
| totalThroughSearchBytes |     146735 |    137952 |           208814 |

## Fast cohort

Latency: 0 ms; download: 10000000 bytes/s. Median values; timings in milliseconds, transfer metrics in bytes.

| Metric                  | Full Exact | Prototype | Fumadocs matched |
| ----------------------- | ---------: | --------: | ---------------: |
| fcpMs                   |        156 |       160 |              148 |
| firstCounterMs          |      255.5 |     150.9 |            178.2 |
| firstSearchMs           |      176.5 |     115.2 |              120 |
| coldOpenToSearchMs      |      474.8 |       375 |            675.3 |
| searchScriptMs          |       50.1 |      43.9 |             18.7 |
| coldNavMs               |      193.5 |     270.2 |            131.5 |
| backMs                  |       69.9 |      53.7 |             48.2 |
| jsThroughSearch         |     122697 |    113876 |           202229 |
| totalThroughSearchBytes |     146735 |    137952 |           208814 |

## Acceptance and remaining work

Chromium and WebKit passed root/getter/internal signal-node identity, exactly one remaining-root initialization, counter/keyboard actions, rapid input during delayed loading, native resource results, promotion, language/version scope and history. Added actual search-index chunk failure coverage: the resource renders its error state and the counter remains usable. The existing early typed-write/rollback/delegation check passed. Both cohorts also passed scope checks and eight reading/focus screenshot comparisons. Targeted formatting/lint passed. No native-host or arbitrary mutation/task activation acceptance is claimed.

Do not adopt this candidate by default. First navigation remains slower than full Exact and Fumadocs; the complete search resource dependency graph is still coupled to the host. Timing variation and extra accessor code also prevent claiming a general startup win. The next step is physical ownership separation of the host adapter and resource request/reply state, plus reuse/adoption of the SSR projection rather than clearing/rebuilding it on promotion.

All samples, conditions, version pins and generated-file hashes are in [resource-results.json](bench/local-activation/resource-results.json). Earlier receipts remain in results.json. To reproduce, use the prior build/verify instructions, then run the benchmark with `FUMA_LOCAL_ACTIVATION_LABEL=resource`; add `FUMA_ACTIVATION_FAST=1` for the fast cohort. `LOCAL_RESOURCE_SPLIT=0` reproduces the earlier transaction/view-preload variant. Do not run the earlier report generator on the new artifact: it deliberately refuses the mismatched cohort.
