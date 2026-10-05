# Browser proof infrastructure

`@lenso/testing/browser` exports `browserConfig(overrides)`: a composable Vitest
configuration with Playwright Chromium and StyleX compilation. It does not
guess package names or rewrite source import paths. Its Vite root is the
consumer's working directory.

```ts
import { browserConfig } from "@lenso/testing/browser";

export default browserConfig({
  test: {
    include: ["src/**/*.browser.test.tsx"],
    setupFiles: ["@lenso/testing/setup/browser"],
  },
});
```

The setup imports only the canonical `@lenso/tokens/styles.css`. The compiler
combines the built package's raw StyleX metadata and consumer declarations
in one processing pass.

Helpers provide animation-frame/layout settling, restorable document themes
and server hook rendering. Browser React cleanup remains owned by
`vitest-browser-react`; consumers can compose their existing setup normally.

Tests record concrete hook failures: missing SSR guards, treating `"all"` as a
set of selection keys, moving unknown/duplicate keys, denied storage, controlled
overlay state, leaking old media subscriptions and width-driven height changes.

```sh
pnpm --filter @lenso/testing test
pnpm --filter @lenso/testing test:browser
```

Chromium must be available through Playwright. These hook tests do not establish
component visual parity or Storybook coverage.

## Documentation composition integration

`integration/components/` owns tests that render authored docs demos. Component
tests in `packages/react` no longer import the application. The integration
suite retains keyboard/focus, loading activation, controlled state, RTL,
Portal/theme, native forms, overflow, virtualization and geometry assertions.
It consumes the ordinary workspace package build; it does not build packages.

```sh
pnpm --filter @lenso/testing test:integration
```

The integration TypeScript config follows only imported demos, not the entire
documentation application or generated registry.

## Installed package consumer

```sh
pnpm --filter @lenso/testing test:package
```

This is the single UI installed-consumer fixture. It packs existing UI, tokens
and StyleX build outputs, installs those tarballs into an isolated consumer
using the local pnpm store, checks public exports and consumer types, renders
on the server, and builds a small production browser application. Browser
assertions cover actual emitted CSS, dynamic StyleX width, scoped portalled
themes and keyboard focus restoration. It never rebuilds workspace packages
or links workspace package sources into the consumer.

Package builds must already exist. The offline install needs the dependency
store populated by the normal workspace install.

The former compiled-priority experiment and acceptance capsules are retired.
The current priority regression lives in
`packages/stylex-build/tests/compiled-priority.test.ts`; it checks Chromium's
computed styles in both stylesheet orders without a bundler build.
