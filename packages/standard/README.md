# Shared development conventions

The TypeScript family follows HeroUI v3.2.6's `base`, `react`, `next`, `node`
and `vite` structure (Apache-2.0), adapted to bundler resolution and React's
automatic JSX runtime. Node uses NodeNext resolution.

Root scripts should invoke the actual shared configurations:

```sh
oxlint --config packages/standard/oxlint.json .
oxfmt --config packages/standard/oxfmt.json --check .
```

No ESLint, Prettier or Tailwind tooling is required.

## React correctness exceptions

Keep the React plugin and `correctness: error`. The two exact-file `react/refs`
overrides in `oxlint.json` defer analysis of preserved native composition:
`resize-handle` passes event callbacks to Base UI `mergeProps`, and `sidebar`
passes refs to `composeRefs`, which returns a commit-time callback. Neither
operation reads `ref.current` during render. These primitives remain byte-for-byte
preserved; the override is not a package-wide exemption or permission to read refs
in JSX. The prefix glob accommodates the shared configuration's location; the
two complete repository-path suffixes are the only exempt files.

Other exceptions sit on the affected statement with the integration reason:
imperative DOM scroll/portal style synchronization, a write-once measurement
baseline, or a cancellable external-request/timer lifecycle. Render-affecting
pagination cursors must be state, not covered by these exceptions.

Run the root `pnpm lint` against current source. Lenso does not duplicate
upstream rule tests or freeze the lint configuration in an acceptance test.
Keep exception reasons beside the affected code or here; an exact-version
false positive may warrant a small reproduction, not a manual source allowlist.
