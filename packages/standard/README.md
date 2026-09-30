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
