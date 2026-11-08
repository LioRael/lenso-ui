# Consumer setup

Use the installed CLI's help as the command source. `init` plans changes;
`--write` applies a reviewed plan without installing packages or running scripts.
Preserve user-owned configuration when the CLI reports conflicts.

Lenso publishes compiler-readable JS declarations. Compile library and
application styles together with official StyleX plugins: `@stylexjs/unplugin`
for Vite/Rolldown, or Babel plus PostCSS for Next. Import theme/base CSS from
`@lenso/tokens/styles.css`; the application compiler generates atomic CSS.

For Next, transpile `@lenso/tokens` and, when used, `@lenso/docs`. PostCSS scans
include their shipped declarations alongside all application sources, including
server-only styles. Each rendering root layout, custom global error and custom
global not-found document imports a stylesheet with the theme and `@stylex`.
Next owns CSS assets and manifests.

The Docs host stages ordinary official Babel/PostCSS defaults when no authored
config exists. Authored configs take precedence. Use the official StyleX
integration for the installed framework and plugin versions. Validate packed
builds, SSR, CSS delivery and development updates in the consumer itself.
