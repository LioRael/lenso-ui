# Collection regression coverage

```sh
pnpm --filter @lenso/storybook test:browser collection
```

Checks production Table and TagGroup compositions: selection/removal, focus
restoration, sorting, filtering, pagination, async loading, resizing,
virtualization, native form behavior, both themes and mobile table geometry.
Source avatars remain genuine assets; network availability is a separate
failure from component behavior.

Table.Cell produces `td`; source row-header cases use `role="rowheader"` rather
than claiming native `th scope="row"` composition. Source action buttons without
handlers are not real business workflows. Full RTL, tag-mobile interaction,
screen-reader and pixel-parity coverage is not claimed.

Sources are adapted from HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`, under Apache-2.0.
