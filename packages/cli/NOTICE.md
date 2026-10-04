# Developer-tools license scope

The package-root MIT license covers original Lenso developer-tool code only.
It does not relicense the embedded contract's third-party source or documentation.

HeroUI-derived examples, reference documentation and StyleX maps retain
Apache-2.0, Copyright 2025 NextUI Inc. The distribution contains the original
Apache text and Lenso's pinned provenance/modification notice in the
[Apache license](dist/licenses/heroui-LICENSE.txt) and
[provenance/modification notice](dist/licenses/heroui-NOTICE.md).
The original headers within returned source remain intact.

Extracted native declaration descriptions and type information retain their
original licenses and copyright notices in the
[native declaration index](dist/licenses/native-declarations.md).
This does not mean the complete third-party implementations are bundled.

The CLI bundles Babel's parser through the private consumer design-policy
implementation. Its full MIT copyright and permission notice is included in
`dist/licenses/babel-parser-LICENSE`. Linked bundle license comments are retained.
The [package-local license index](dist/licenses/THIRD_PARTY_NOTICES.md) links
only to the actual legal texts shipped in this package.
