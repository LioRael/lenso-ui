# Theme Builder application previews

## Direction and evidence

The previous previews were rejected for their appearance. Rebuild one
representative Dashboard and obtain user approval before expanding Mail, Chat
or Finances.

Live visual references captured in this thread:

- `https://heroui.pro/templates/dashboard`
- `https://heroui.pro/templates/email` (redirects to its sample inbox)
- `https://heroui.pro/templates/chat` (redirects to its AI showcase)
- `https://heroui.pro/templates/finances`

The captures are 1440 × 1000, with settled rendering. The remote Pro revision
is unavailable and is not the pinned open-source HeroUI revision. Observe
geometry and hierarchy; do not import proprietary source or redistribute its
images. Native initials avatars and first-party local data replace those assets.
Reference captures remain review artifacts, not package assets.

Implementation uses Lenso UI/tokens 0.9.0, current native contracts and StyleX.
The Theme Builder owns all palette/font/radius choices. Preview code uses
semantic variables and does not introduce a fixed color palette.

Design dials: energy 1, rhythm 2, motion 1. Information and familiar controls
provide the focal points; motion is native state feedback only.

## Dashboard representative

### Frame

At the wide desktop reference:

- A 240px navigation sidebar spans the preview height, separated by one subtle
  vertical rule. User identity occupies its 64px top row; help/reset and the local
  demo disclosure sit at the bottom.
- The remaining main pane owns vertical scrolling. Its inner horizontal padding
  is 20px. A 64px greeting/action header sits above the report.
- The report toolbar is 40px high: segmented Overview/Sales/Expenses at left,
  range/download actions at right.
- Four distinct 100px metric surfaces share one row, with 12px gaps.
- Two equal 316px chart surfaces share the next row, with a 12px gap and 16px
  separation from adjacent groups.
- The employee section follows with a title/count, compact filter/sort/columns
  controls and a 220px search field. Its table has a 36px neutral header and
  approximately 56px white/surface rows.

Reading order is identity/navigation, greeting, report mode/range, metrics,
sales and traffic charts, then team records. Remove the old narrow view-filter
rail, oversized single area chart and side checklist from the main composition.

### Type and surfaces

- Inherit `--font-sans`; greeting 20px/600, chart/section titles 16px/500–600.
- Metric labels 14px muted, primary values 26px/600, table text 13px, secondary
  labels and chart ticks 11–12px. Use tabular numbers for numeric data.
- Background is `--background`, cards/table bodies `--surface`, low-emphasis
  controls and table header `--default`. Text pairs use the matching foregrounds.
- Cards use `--radius-2xl` and `--surface-shadow`; no extra glow or gradient.
  Compact source-like pill controls are intentional, not applied to every surface.
- Chart series use `--accent` and a source-derived softer accent mix. Status
  changes use semantic success/danger pairs and directional text/icons.

### Content and behavior

Use clearly labelled local sample business/team data. This is a Theme Builder
preview, not a connected business product.

- Four metrics: revenue, expenses, sales and derived profit.
- Sales performance: rounded vertical bars, three compact summary values and
  readable axes. Traffic source: two line series with an inline legend and a
  session summary. Figures have accessible titles and text summaries.
- A six-person employee table: ID, member/avatar/email, role, worker type and
  view/edit/remove actions. Use native initials avatars rather than remote images.
- Reporting range and report-mode controls update the visible data, not only
  their selected styles. Search/type filter/sort operate on actual local rows.
- Columns change visible table fields. Invite/edit/view/remove use native
  overlays and local state with explicit no-network disclosure.
- Sidebar entries navigate/focus the relevant local section or open a meaningful
  local settings/tasks view; no inert placeholder links or fabricated log-out.
- Download exports actual visible sample data. Neutralize spreadsheet formula
  prefixes in user-provided CSV cells.

### Responsive rules

- Below 1200px, the sidebar becomes a compact icon rail; below 768px it becomes
  an explicit collapsible/drawer navigation so content keeps the available width.
- Metrics become two columns below 1000px; charts become one column below 1000px.
- Below 480px, metrics become one column, matching the captured narrow reference;
  metric values remain readable and toolbars wrap in semantic groups.
- Only the employee table may scroll horizontally, inside its own named,
  keyboard-reachable viewport. The page must not overflow at 320px.
- Preserve logical RTL spacing and native overlay/focus behavior in both themes.

## Acceptance before extending the design

Inspect actual rendered captures at 1440 × 1000, 768px and 390px, light/dark,
plus 320px/RTL overflow checks. Compare frame/pane/card boundaries first, then
type/density/spacing, then chart/table and control details.

Run behavioral and semantic checks separately: native panel relationships,
range/filter/sort, local forms, dismiss/focus restoration, theme inheritance into
portals, and sample-state preservation across preview tabs.

Show the representative rendering to the user. Working controls or a passing
build do not approve the visual direction. Mail, Chat and Finances remain
unapproved pending this representative review.

## Approved direction and remaining pages

The user accepted the representative Dashboard direction, then requested native
Tabs/Table composition and the header preset component. Those refinements are
the shared quality baseline. The remaining pages now use the following settled
layouts, based on fresh 1390 × 798 captures of the live Pro references. They are
first-party local examples, not redistributed Pro implementations.

### Mail

- Full-height three-pane composition: 240px folder/profile rail, 360px message
  list, flexible reading pane. The rail and list sit on `--background`.
- Identity row 64px; 36px folder rows; separators and label filters beneath.
  A full-width 32px primary Compose action anchors the rail footer.
- Search sits above the list with 8px outer gutters. Message rows are about
  76px, with 36px initials avatars, sender/time, subject and one-line excerpt.
  Selection is a rounded `--surface` card with the shared surface shadow.
- Reading pane is an inset surface: 8px margin, `--radius-2xl`, 16px toolbar,
  40px article padding, 14px/22px body text, 16px/600 subject. Its scroll belongs
  to the pane, not the whole page.
- Preserve working Inbox/Starred/Archived, search, selection, star/archive,
  native compose/reply and focus restoration. Additional folders/actions appear
  only if their local data/state is implemented. No fake delivery or inbox sync.
- Use native ListBox for message selection, native Popover/Modal/Button/Input
  parts for interactions, and native initials Avatar.
- Below 1100px the folder rail becomes compact; below 768px show list or thread
  with explicit Back to list and accessible navigation. No side-by-side sliver
  panes on a phone.

### Chat

- Follow the reference's 240px recent-conversation rail and a spacious main pane,
  rather than the old 920px framed mini-messenger inside the preview.
- Identity row 64px; compact New conversation/search actions; recent rows 36px.
  Header spans the main pane at 64px, with current conversation and meaningful
  search/export controls.
- Conversation content is centered with a maximum width of 720px and 24px
  horizontal padding. Incoming messages use open text/initials groups; the
  user's messages use right-aligned neutral bubbles. Keep text readable at
  14px/22px and preserve whitespace/wrapping.
- Composer is a 720px-wide `--surface` card at the pane bottom: about 112px,
  16px padding, rounded corners and the shared shadow. Use native TextArea and
  Button; attachments/actions exist only if implemented.
- Preserve real local conversation switching, per-conversation drafts and
  user-message sending. Sample messages stay explicitly sample/team content;
  do not invent streaming, model connectivity or generated AI replies merely
  because the remote reference showcases them.
- Native ListBox owns recent selection; local New conversation may use Modal.
  Search/export acts on real local messages. No network or asset downloads.
- Below 768px collapse the rail into accessible navigation. Keep the composer
  reachable, messages independently scrollable and state stable across global
  preview switches and viewport changes.

### Finances

- Use the approved 240px account/navigation rail, 64px greeting/action row and
  20px main gutter; remove the old centered 1000px ledger card.
- Four 100px summary surfaces: Balance, Income, Expenses and Budget remaining,
  with 12px gaps and the approved value/change hierarchy.
- Middle row: a large roughly two-thirds-width 400px history chart surface and
  a one-third-width expense-category list. Derive the chronological balance line
  from actual opening balance and transactions, not a decorative fake curve.
- Category rows use native initials/icon containers, category labels and actual
  expense amounts. View all/reset/filter actions must affect the local records.
- Recent transaction section follows the same title/toolbar/native Table
  composition as Dashboard: 36px header, 56px rows, tabular money, inner
  horizontal viewport.
- Keep month selection, type/search filtering, integer-cent amount validation
  and local Add transaction; added records update totals, history and categories.
  Use native Tabs for alternate overview/budget views if offered, native Table
  sorting/keyboard parts and native Select/Modal form hierarchy.
- Keep the studio ledger domain; do not present fake wallet addresses, payment
  connectivity, token logos or real transfers to imitate the Pro crypto content.
- Metrics become two columns below 1000px and one below 480px; chart/category
  layout becomes one column below 1000px; rail collapses/draws below 768px.

### Shared final checks

All three inherit palette/font/radius and portalled themes. Use native component
structure rather than manual imitation of tab/table/list roles. Preserve local
state across global preview switches, reduced-motion behavior and logical RTL
spacing. Review each at wide desktop, 768px and 390px in both modes, with 320px
overflow/keyboard checks. Present actual screenshots and record deliberate
content/asset differences separately from geometry or functional regressions.

## Remaining-page reconstruction evidence

Mail, Chat and Finances now use the approved full-height preview frame. Production
captures were inspected at 1440 × 1000 and 390 × 844 in light and dark mode.
Mail uses native single-selection message lists; Chat uses native conversation
lists; Finances uses native sortable Table parts. Team messages and studio-ledger
data deliberately replace the reference's AI/media and crypto content.

Current local checks passed: repository format, lint and interaction boundaries;
docs TypeScript and production export; the maintained documentation browser
suite, including Theme Builder regression checks. The example checks exercise
light/dark, LTR/RTL and widths 1440, 768, 390 and 320. Their axe checks exclude
color contrast, so these results are not a comprehensive WCAG certification.

Focused behavior includes per-conversation draft and message preservation,
transcript export, search and new conversations; nested mobile conversation
Modal/Popover Escape and focus return; Mail compose/reply and mobile list/thread
focus; and integer-cent transaction validation, updated balance history and
signed-amount keyboard sorting. Global preview panels remain mounted.

These are local implementation and rendered-review results, not user approval of
all three pages, pixel-identical Pro parity, authoritative candidate verification,
or authorization to land or publish.

## Correction after remaining-page feedback

The user rejected Chat's resemblance to the reference and requested native
components for every Finances table-like dataset. The next slice corrects these
two pages only.

- Finances expense categories become a second native Table, with stable category
  keys, accessible column headings and native filter Buttons within cells.
  Recent transactions retain their native Table and signed-money sorting.
  Metrics remain a semantic definition list; the history remains a measured SVG.
- Chat follows the reference's AI-conversation presentation rather than team IM:
  240px rail, 64px header, header Search action, centered 720px conversation,
  right-aligned user bubbles and open assistant-answer blocks without repeated
  member avatars/timestamps. Static answers are explicitly sample content, not a
  live model or simulated generation.
- Rail identity is 64px; New conversation and conversation search are compact
  36px icon/text actions rather than a full-width colored pill and permanent
  input. Recent rows use a conversation icon, ellipsis and a neutral selected
  pill. Search fields live in native popovers so idle layout matches the reference.
- The selected sample contains meaningful prompt/answer exchanges, an original
  local layout-note/document preview and compact copy/download actions. No Pro
  media, fake pending state, fake tools or copied proprietary source is introduced.
- Composer is a 720px-wide, 112px-high surface, with 12px inner padding, an open
  native TextArea, round 36px attachment/send actions and local-only helper text
  below the card. Attachment action imports a text/Markdown file as a local
  draft or presents an actual downloadable example; no inert paperclip control.
- Mobile uses a 36px menu trigger, truncated title, search icon, 16px content
  gutters and the same composer hierarchy. Native overlays retain focus and
  keyboard ownership. No extra always-visible search row or wrapped send label.

Compare the revised Chat representative against a fresh 1390 × 798 capture of
the live reference before claiming resemblance. Preserve drafts, sends, search,
exports and global-preview mounting; update behavioral tests to the new sample
titles rather than retaining unrelated channel names as compatibility UI.

The corrected Finances category table keeps visible, compact native column
headings so Tab and ArrowUp never target clipped headers. Its body rows are 40px;
logical cell padding is explicitly composed over the native maps. Transaction
types use inline Chip/Chip.Label, not the positioned Badge component.

Chat uses actual fixed pill/circle geometry rather than an undeclared radius
variable. Its first visible history initializes at the latest sample answer;
theme changes and resizing do not move the reader. Deferred file imports update
the original conversation's draft but cannot focus a newly mounted composer or
interrupt a different overlay.

This correction passed repository format/lint/interaction-boundary checks,
production TypeScript/export and the maintained full documentation browser suite.
New regressions cover native category-header/body arrow navigation, compact row
geometry, inline type-label containment, circle painting, first-visible history,
reading-position preservation, and a deliberately delayed import across a
conversation switch. Light/dark app-only captures at 1390 × 798 were compared with
the current reference; fresh 390px Chat captures verify the narrow composition.
These results do not constitute user visual approval or a claim of identical
commercial content.
