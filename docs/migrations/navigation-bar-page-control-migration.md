# NavigationBar and PageControl

NavigationBar is additive, exported from `@lenso/ui` and
`@lenso/ui/navigation-bar`. It composes Toolbar and ScrollEdge. Use `title`,
`large`, `onBack`, `backLabel`, `leading`, `trailing` and `level`; action slots
compose Toolbar.Group and Toolbar.Button. An optional `scrollRef` identifies
the scroll owner. Routing, browser history and focus/scroll restoration remain
application responsibilities. No navigation stack or edge-swipe gesture is added.

PageControl preserves `count`, `page`, `defaultPage`, `onPageChange`, disabled
state and page labels. Existing consumers need no changes. The new
`variant="plain"` omits the material capsule and its horizontal padding. The
default remains `prominent`, now using the shared small Glass surface in a 26px
capsule with its existing rim and shadow. This corrects the initial Ultrathin
presentation, which was nearly invisible on flat backgrounds. The 44px button
hit areas and pagination API remain unchanged. The wrapper stays internal.

Keyboard users now enter through one selected dot, rather than every dot.
Arrow keys select adjacent pages; Left/Right follow the Base UI direction
provider. Home/End select the first/last page. Keys stop at the bounds and focus
follows accepted selection, including across the nine-dot window. A controlled
owner must update `page` from `onPageChange`; rejected requests retain focus.
Consumer `onKeyDown` can prevent the built-in behavior. Modified keys are left
to the browser. Keep the controlled content labelled separately.
