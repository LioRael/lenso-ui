# Dependency provenance

The documentation shell uses Fumadocs UI and core 16.9.0 directly under their
MIT licenses. No Fumadocs interaction implementation is copied into this package.
Search and navigation compose public native parts. The native Fumadocs license,
Copyright (c) 2023 Fuma, is included as `LICENSE.FUMADOCS`.

Compiled presentation maps, Tabs, syntax highlighting and the responsive TOC
are built from package-owned `presentation/` sources extracted from Lenso UI
Docs. Their HeroUI v3.2.6 adaptations
retain Apache-2.0 terms; `dist/third-party/heroui` includes the license and
modification notices. These bundled files are not relicensed by the framework's
MIT wrapper license.

The unchanged Inter variable font ships under the SIL Open Font License 1.1.
`dist/fonts` includes its original license and provenance record.

The default theme is supplied by `@lenso/tokens` 0.9.0. Its HeroUI v3.2.6
provenance, Apache-2.0 license and modification notices ship with that dependency.
The framework does not import the Lenso component inventory or archived content.

MDX and Shiki are used through their installed packages.
Their respective copyright and license notices remain in those dependencies.
