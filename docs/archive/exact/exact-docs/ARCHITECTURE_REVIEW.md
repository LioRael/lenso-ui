> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# Activation architecture review

The current prototype has reached a structural limit. Search imports the native checked data/resource runtime; that path still reaches view publication, navigation and host state. First navigation then initializes the full generated projection over the current page before changing the route. Moving command registration or adopting nodes does not remove either major operation.

The latest controlled slow-cohort search median was 557.8 ms with 28.5 ms of CDP script duration. This does not mean the remaining time is all network: scheduling, browser input work, layout and paint also contribute. It does rule out treating JavaScript execution alone as the explanation for the entire delay. The profile receipt records resource timing alongside sampled stacks.

The startup profiler previously started profiling after initial page load, unintentionally giving deferred module downloads extra time before the action. It now starts before navigation, filters sampled stacks to the action-to-paint interval using NavigationStart, and has a bounded paint timeout with page errors. Old profile timings should not be compared with the corrected diagnostic as controlled before/after measurements.

## Direction to discontinue

Do not continue extracting native functions into accessor factories and call that a lightweight resource kernel. The shared runtime retains the state owners and static dependency graph. Do not present entry-file gzip size as the whole activation closure, move work earlier without accounting for it, or replace Exact resources with a benchmark-only JavaScript search implementation.

## Replacement architecture

The compiler needs to emit an explicit root environment and separate activation units with a dependency manifest. A single resource owner must retain typed writes, atomic rollback, resource ticket generations, pending/failure state and request dispatch independently of a view host. DOM publication, navigation projection and host commands must register through capability interfaces; importing the resource owner must not import those implementations.

The documentation view host should activate persistent shell bindings once and update the destination reading region directly on navigation. It must not adopt the old full page as a prerequisite to displaying the next one. Arbitrary custom Exact pages require a compiler-emitted activation unit on the same root environment, with explicit lifecycle rules for tasks/mutations; they cannot be silently replaced by fetched HTML.

## Gates before claiming a new optimization

1. Build graph: the search unit must not statically depend on DOM creation, navigation projection, paint or host-command implementations.
2. State semantics: shared root/cell/resource identity, typed refusal rollback, out-of-order reply suppression, resource failure/retry and task ownership survive view activation.
3. Navigation: the first route transition executes destination projection only; the persistent shell is retained and custom-page behavior remains supported.
4. Timing: measure the complete transitive activation closure, action-to-paint, cold-open-to-paint and reading-session bytes against the previous prototype and Fumadocs matched in one cohort. Abort a candidate that merely shifts waiting into initial reading.

This review delivers a corrected diagnostic and a concrete replacement boundary. No new resource owner or destination-only view host is implemented in this turn, and no new performance improvement is claimed. The existing experimental/default build status remains unchanged; headless behavior, root state and the default theme are preserved.
