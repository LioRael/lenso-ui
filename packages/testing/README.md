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
uses `useCSSLayers: false`, matching the package build; StyleX constants must
come from `@lenso/tokens/tokens.stylex.const`.

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
