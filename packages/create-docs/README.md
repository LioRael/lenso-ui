# create-lenso-docs

Run `bun create lenso-docs <directory>` to create a content-only Lenso Docs project.
Then run `bun install` and `bun run dev` inside it. Vite / TanStack Start, routing,
MDX and StyleX are configured by the framework.

The initializer writes files without installing dependencies or accessing the
network. For pre-release use, `--packages <directory>` copies one local tarball
for each of Docs, UI, Tokens, Glass and Primitives into `.lenso-packages/` and
configures file dependencies. From the Lenso checkout, `bun run docs:create
<directory>` builds those packages and runs the initializer automatically.
