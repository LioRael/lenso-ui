---
status: accepted
---

# Use the Next documentation product as the component lab

Lenso UI will not maintain Storybook or Ladle beside its planned Next App Router documentation product. The documentation application and development-only component lab render shared example modules, while isolated browser tests and end-to-end checks consume the same examples without introducing a second visual catalog.

The full DialKit parameter and timeline authoring surface is available in development. Public documentation selectively exposes reduced controls only on intentional Playground pages. DialKit remains a docs/lab dependency and never enters `@lenso/ui`, `@lenso/tokens`, or registry component dependencies; approved values are committed through review to DTCG tokens, component defaults, or production motion source rather than written back automatically.
