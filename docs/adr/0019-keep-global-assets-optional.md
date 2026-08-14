---
status: accepted
---

# Keep global reset and font assets optional

`@lenso/ui/styles.css` contains generated tokens and component CSS but no general reset or font files. A separate optional preflight stylesheet contains only narrowly documented host rules required for overlay roots and stacking behavior. An optional `@lenso/fonts` package provides provenance-recorded WOFF2 files, font-face declarations, hashes, and required license texts for the approved IBM Plex Sans and Roboto Mono assets; no UI or primitive package depends on it, and Consumers may supply other compatible font stacks.
