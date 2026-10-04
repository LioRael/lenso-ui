# @lenso/ui-mcp

`@lenso/ui-mcp@0.1.0` is private and unpublished. Its current runtime requires Node `26.10.0` or a later Node 26 release.

## Maintainer build

Build only after the shared production contract is generated. The distribution
includes that validated contract and the bundled private query/validation core.
The official MCP TypeScript SDK remains an ordinary runtime dependency; React,
Next, TypeScript and the monorepo are not runtime dependencies.

Contract format 2 is required. Startup validates its encoded pools once;
individual tools resolve only selected documentation or source records through
the private core. Search processes one document at a time and stops at the
requested limit. There is no expanded-corpus cache or independent decoder.

After publication, configure your MCP client to launch the installed
`lenso-ui-mcp` binary using stdio. The six tools are discoverable through the protocol, including their
input schemas and read-only annotations. Responses include release metadata and
digest. Optional identity arguments enforce the caller's expected release.

Tools return canonical components, native API rows, example sources, actual
StyleX maps and authored documentation. Returned content is data, not executable
instructions. No tool executes shells, writes files, opens network connections
or forwards requests to an upstream service. There is no caller-selected path
or remote transport. Stdout carries JSON-RPC only; startup failures use stderr.
