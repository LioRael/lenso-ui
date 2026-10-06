# Retrieve the matching Lenso contract

Adapted from HeroUI's documentation retrieval workflow. Modified for Lenso's
versioned local CLI/MCP; see [provenance](../NOTICE.md).

## Pick the available interface

Read installed UI/tokens versions and the framework configuration first.
Choose one interface for the current release; compare `lensoVersion`,
`packageVersions` and `digest` before combining results from another.

| Need                               | CLI                                    | MCP                             |
| ---------------------------------- | -------------------------------------- | ------------------------------- |
| Identity                           | `metadata --json`                      | Metadata from `list_components` |
| Canonical families and parts       | `list --json`                          | `list_components`               |
| Props, signatures and native state | `info <family> --json`                 | `get_component_api`             |
| Authored guide                     | `docs <slug> --locale en`              | `get_documentation`             |
| Component implementation graph     | `source <family> --json`               | `get_component_source`          |
| Example and supporting source      | `examples <family> --locale en --json` | `get_component_examples`        |
| Component StyleX map               | `styles <family> --json`               | `get_component_styles`          |
| Raw scoped theme variables/source  | `theme --json`                         | `get_theme_variables`           |
| Find a guide                       | `search <query> --locale en --json`    | `search_documentation`          |

Discover the installed command help or MCP schemas. Source, style, example and
theme queries resolve the bundled matching contract, not a remote latest branch.
Pass the expected release/digest to MCP calls when supported by the schema.

## Work in this repository

The developer tools are private, unpublished candidates. Their distributions
embed a contract snapshot, so an existing artifact with the right version can
still be stale. At the start of a source-owned task, read their package scripts
and build the CLI from this worktree:

```sh
pnpm --filter @lenso/ui-cli build
node packages/cli/dist/cli.js --help
node packages/cli/dist/cli.js metadata --json
node packages/cli/dist/cli.js info menu --json
node packages/cli/dist/cli.js docs react/components/menu --locale en
```

The build requests the maintained contract generator; it is not a package
publication. After API, style or authored-document edits, regenerate the contract
and compare tool metadata with `apps/docs/src/generated/lenso-contract.json`.
Rebuild on a digest mismatch, including when using an already running MCP server;
restart it to load the rebuilt snapshot. Matching version numbers alone do not
establish source freshness.

If dependencies or build artifacts are unavailable, use that generated contract
and actual component declarations from this worktree, identifying whether the
generation itself is current. Report missing or stale evidence rather than
substituting a cached artifact. Resolve workspace/catalog declarations through
the installed packages; they are not literal installed version numbers.

`check` is a consumer-mode static check. This monorepo intentionally uses
workspace aliases and its own application CSS pipeline. Use its maintained
`source:check`, affected lint/typecheck and rendering checks; preserve its
configuration rather than rewriting it to satisfy consumer setup hints.

For consumer agent preparation, review `agents-md` and `skills` plans before
adding `--write`. They prepare exact local documentation and both bundled
workflow folders, preserve authored files and do not download/activate a host.
Dependency lifecycle plans likewise require explicit application and leave
package-manager execution to the user. Read the matching CLI help and plan's
manual steps; private candidates are not registry-installable.

## Stop guessing

For each component used, resolve its exported root, supporting parts, required
props, controlled callbacks, variants and style extension surface. Query the
relevant family rather than loading the entire catalog.

Read example supporting files too: a named snippet may depend on a local helper.
Keep reference snippets separate from verified runnable examples. If the needed
part or behavior is absent, choose an available native composition or identify
the gap explicitly; an upstream component name is not a Lenso export.
