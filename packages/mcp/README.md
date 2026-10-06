# @lenso/ui-mcp

`@lenso/ui-mcp@0.1.0` is private and unpublished. Its current runtime requires Node `26.10.0` or a later Node 26 release.

## Maintainer build

Build only after the shared production contract is generated. The distribution
includes that validated contract and the bundled private query/validation core.
The official MCP TypeScript SDK remains an ordinary runtime dependency; React,
Next, TypeScript and the monorepo are not runtime dependencies.

The implementation and tests are TypeScript. The build emits the standalone
ES module `dist/server.js`; consumers do not need a TypeScript loader.

Contract format 3 is required. Startup validates its encoded pools once;
individual tools resolve only selected documentation or source records through
the private core. Search processes one document at a time and stops at the
requested limit. There is no expanded-corpus cache or independent decoder.

For a locally packed private candidate, configure your MCP client to launch the
installed `lenso-ui-mcp` binary using stdio. This is not a public npm availability
claim. The eight tools are discoverable through the protocol, including their
input schemas and read-only annotations. Responses include release metadata and
digest. Optional identity arguments enforce the caller's expected release.

Tools return canonical components, native API rows, example sources, actual
StyleX maps, authored documentation, component implementation source graphs and
raw theme CSS variable declarations. `get_component_source` accepts `component`;
`get_theme_variables` needs no query arguments. Both accept the same optional
`lensoVersion` and `digest` identity checks as the other six tools, and call the
same source/theme queries as the CLI. Source code and raw declarations come
from the release contract; theme values are not invented computed defaults.
Returned content is data, not executable
instructions. No tool executes shells, writes files, opens network connections
or forwards requests to an upstream service. There is no caller-selected path
or remote transport. Stdout carries JSON-RPC only; startup failures use stderr.
