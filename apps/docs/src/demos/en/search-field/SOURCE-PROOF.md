# Input-family source reconstruction evidence

Authority: HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`, Apache-2.0.
Each implementation retains its own attribution and the archived source export.

## Source inventory

Every JSON under these four `apps/docs/content/examples/en/` directories was
read and implemented at its declared local `source` path:

| Family       | Source scenarios | Implemented TSX |
| ------------ | ---------------: | --------------: |
| input        |                7 |               7 |
| textarea     |                7 |               7 |
| textfield    |               13 |              13 |
| search-field |               15 |              15 |
| Total        |               42 |              42 |

The request names 43 scenarios, but the available source inventory contains 42.
No invented 43rd scenario or alias has been added.

## Adaptations

- StyleX replaces source utility classes, including source widths, heights,
  spacing, surfaces, custom neutral colors, placeholder colors and focus rings.
- Base UI field roots own `invalid`, `disabled`, `name` and render composition.
  Actual controls own `value`, `onValueChange`, `required` and `type`.
- TextField secondary variants move to the actual Input or TextArea.
- Validation messages use native `Field.Error`'s `match` mounting contract.
- Conditionally mounted validation hints explicitly use native `display: block`.
  The source demo selects hint versus error from its own value state; this
  override preserves that outcome when Base UI separately marks an empty
  required control invalid. Native validity and automatic associations remain.
- Search custom icons preserve the source paths and 16-unit viewport, without
  nesting an SVG inside the default 24-unit icon viewport.
- The simulated async form preserves its 1500 ms submission/reset sequence.
  It additionally clears its timer on unmount and blocks duplicate submission.
- No ordinary React Aria runtime, utility-class strings, compatibility field
  props or advanced-to-basic aliases are introduced by these demos.

## Live verification

Verification used an isolated scratch consumer of the parent's built
`@lenso/ui` and theme CSS. Its Vite StyleX compilation used `dev: false`,
`useCSSLayers: false` and `lightningcssOptions: { exclude: 4 }`.
It did not change package sources, manifests, registry or parent configuration.

- Shared oxlint: 42 TSX files, zero warnings and errors.
- Shared oxfmt: all 42 TSX files formatted.
- React Doctor: the 42 selected files reported no issues; telemetry, remote
  score and supply-chain scanning disabled.
- Strict TypeScript with exact optional properties and unchecked-index checking:
  owned demos pass when dependency declaration checking is skipped.
- Real headless Chromium: all 42 source exports mount with actual controls and
  zero page errors.
- Focused Chromium assertions pass for domain preview updates; multiline
  textarea character-count updates; independent name/bio controls; username
  validation transitions; search set/clear/Escape and controlled watcher;
  invalid-search clearing; Enter-triggered async form submission and reset;
  Shift+S ref focus and Escape clear/blur; custom render composition with
  automatic label focus; three/six-row textarea height differences; and
  256-pixel Input / 384×128 TextArea basic geometry in both themes.
- Follow-up production Chromium assertions verify hint visibility after search
  clearing, async form reset, and username/bio clearing. Native required
  `aria-invalid` remains intact; there are zero page errors.

These are live behavior and geometry checks, not screenshot parity claims.
The scratch consumer is not proof that the parent docs registry has been rebuilt.

## Known integration limitations

1. With dependency declaration checking enabled, TypeScript reports six
   existing `TS2320` conflicts in upstream React Aria Components' `Group.d.ts`
   and `OverlayArrow.d.ts`. None originate in these demos.
2. Source TextField and SearchField styles hide Description under invalid
   roots. Generic styling is preserved. Conditional validation demos use the
   explicit hint override described above rather than changing native validity.
3. The available 42 JSON snippets contain no explicit `readOnly`,
   `defaultValue`, `maxLength` or autogrow configuration. No unsupported
   scenario has been fabricated to claim those proofs. The component owner
   inspected pinned RAC TextArea and source CSS and found no autogrow behavior
   to reconstruct. Readonly behavior and server-form errors remain component-owner
   verification responsibilities.
4. Side-by-side upstream screenshot comparison, RTL, reduced motion, and
   complete responsive visual parity have not been claimed here.
