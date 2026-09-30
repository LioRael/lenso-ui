# @lenso/ui

HeroUI source-backed component composition implemented with Base UI and
StyleX. Date, time and color families retain React Aria's specialized
interaction models and their required supporting contexts.

Import themes and component styles once:

```tsx
import "@lenso/tokens/styles.css";
import { Button } from "@lenso/ui";

<Button variant="primary" size="md">
  Save
</Button>;
```

Components use native Base UI props such as `disabled`, `onClick` and `render`.
Date/color components use their React Aria contracts. `xstyle` is a typed
StyleX override; native runtime styles and state-dependent style callbacks
remain available.

This package is under reconstruction, not certified as complete HeroUI parity.
See the repository source contract before extending a family.

HeroUI-derived styles and composition retain Apache-2.0 attribution.
Package artifacts include `HEROUI-LICENSE.txt` and `HEROUI-NOTICE.md`.
