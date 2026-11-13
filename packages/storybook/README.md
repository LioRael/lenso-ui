# Component development

Storybook consumes built `@lenso/ui` exports and `@lenso/tokens/styles.css`.

```sh
bun run dev:storybook
bun turbo run build --filter=@lenso/storybook
```

The workspace build prepares package dependencies and produces a `storybook-static` artifact. An entry in Storybook does not by itself establish interaction or visual correctness. Automated behavior checks run with Bun and a simulated DOM; visual review is separate.

Keep source adaptations reviewable in `stories/` and preserve their license notices. Use UI SDK contracts, native HTML, value models and StyleX.
