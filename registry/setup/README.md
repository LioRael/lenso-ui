# Lenso registry setup

The `setup` registry item is the shared starting point for editable Lenso UI source. It installs the generated StyleX token bridge and the matching `@lenso/tokens` dependency:

```bash
pnpm dlx shadcn@latest add https://ui.lenso.dev/r/setup.json
```

After installation, configure the Consumer's framework to compile StyleX source and import the semantic token CSS once:

```tsx
import "@lenso/tokens/styles.css";
```

Then add a component or Recipe from the same stable registry:

```bash
pnpm dlx shadcn@latest add https://ui.lenso.dev/r/button.json
```

Registry items are editable Consumer-owned copies. The setup item does not provide a global reset, font assets, application routing, or a mandatory Lenso provider. Use an immutable versioned endpoint such as `https://ui.lenso.dev/r/v/0.2.0/setup.json` when a reproducible release snapshot is required.
