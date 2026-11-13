# Lenso Docs project

Edit `content/` and `docs.config.ts`.

```sh
bun install
bun run dev
```

Build with `bun run build`; preview the static `out/` export with `bun run preview`.
The generated Vite / TanStack Start host owns routing, MDX and StyleX setup.
Bun 1.4.4 or later and Node.js 22.12 or later are required.

If this project was created with local packages, keep `.lenso-packages/` with it.
Those tarballs are installed normally and do not refer back to the source checkout.
