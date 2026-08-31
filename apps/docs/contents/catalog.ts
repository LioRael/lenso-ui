export type DocsSectionId =
  | "start"
  | "foundations"
  | "components"
  | "primitives"
  | "patterns"
  | "templates"
  | "guides"
  | "reference";

export type DocsPage =
  | "overview"
  | "installation"
  | "quick-start"
  | "package-vs-registry"
  | "release-status"
  | "tokens"
  | "themes"
  | "strict-csp"
  | "avatar"
  | "breadcrumb"
  | "button"
  | "checkbox"
  | "combobox"
  | "command-menu"
  | "content-state"
  | "description-list"
  | "dialog"
  | "disclosure"
  | "icon-button"
  | "inline-alert"
  | "label"
  | "menu"
  | "page-header"
  | "popover"
  | "quick-link"
  | "radio"
  | "resize-handle"
  | "select"
  | "shimmer-text"
  | "settings-row"
  | "application-sidebar"
  | "status-marker"
  | "surface"
  | "switch"
  | "tabs"
  | "text-area"
  | "text-field"
  | "tooltip"
  | "toast"
  | "agent-page"
  | "page-layout"
  | "settings-page";

export interface DocsNavLink {
  readonly href: string;
  readonly id: string;
  readonly kind: "link";
  readonly label: string;
}

export interface DocsNavPage {
  readonly aliases?: readonly string[];
  readonly href: string;
  readonly kind: "page";
  readonly label: string;
  readonly slug: DocsPage;
}

export type DocsNavItem = DocsNavLink | DocsNavPage;

export interface DocsSection {
  readonly defaultOpen?: boolean;
  readonly id: DocsSectionId;
  readonly items: readonly DocsNavItem[];
  readonly label: string;
  readonly order: number;
}

/**
 * The documentation navigation registry is the source of truth for section order,
 * labels, page placement, canonical paths, and compatibility paths.
 */
export const docsRegistry = [
  {
    defaultOpen: true,
    id: "start",
    items: [
      { href: "/", kind: "page", label: "Overview", slug: "overview" },
      {
        href: "/start/installation",
        kind: "page",
        label: "Installation",
        slug: "installation",
      },
      { href: "/start/quick-start", kind: "page", label: "Quick start", slug: "quick-start" },
      {
        href: "/start/package-vs-registry",
        kind: "page",
        label: "Package vs Registry",
        slug: "package-vs-registry",
      },
      {
        href: "/start/release-status",
        kind: "page",
        label: "Release status",
        slug: "release-status",
      },
    ],
    label: "Start",
    order: 10,
  },
  {
    id: "foundations",
    items: [
      { href: "/foundations/tokens", kind: "page", label: "Tokens", slug: "tokens" },
      { href: "/foundations/themes", kind: "page", label: "Themes", slug: "themes" },
    ],
    label: "Foundations",
    order: 20,
  },
  {
    id: "components",
    items: [
      { href: "/components/avatar", kind: "page", label: "Avatar", slug: "avatar" },
      { href: "/components/breadcrumb", kind: "page", label: "Breadcrumb", slug: "breadcrumb" },
      { href: "/components/button", kind: "page", label: "Button", slug: "button" },
      { href: "/components/checkbox", kind: "page", label: "Checkbox", slug: "checkbox" },
      { href: "/components/combobox", kind: "page", label: "Combobox", slug: "combobox" },
      {
        href: "/components/command-menu",
        kind: "page",
        label: "Command Menu",
        slug: "command-menu",
      },
      {
        href: "/components/content-state",
        kind: "page",
        label: "Content State",
        slug: "content-state",
      },
      {
        href: "/components/description-list",
        kind: "page",
        label: "Description List",
        slug: "description-list",
      },
      { href: "/components/dialog", kind: "page", label: "Dialog", slug: "dialog" },
      { href: "/components/disclosure", kind: "page", label: "Disclosure", slug: "disclosure" },
      {
        href: "/components/icon-button",
        kind: "page",
        label: "Icon Button",
        slug: "icon-button",
      },
      {
        href: "/components/inline-alert",
        kind: "page",
        label: "Inline Alert",
        slug: "inline-alert",
      },
      { href: "/components/label", kind: "page", label: "Label", slug: "label" },
      { href: "/components/menu", kind: "page", label: "Menu", slug: "menu" },
      { href: "/components/popover", kind: "page", label: "Popover", slug: "popover" },
      { href: "/components/radio", kind: "page", label: "Radio", slug: "radio" },
      {
        href: "/components/resize-handle",
        kind: "page",
        label: "Resize Handle",
        slug: "resize-handle",
      },
      { href: "/components/select", kind: "page", label: "Select", slug: "select" },
      {
        href: "/components/shimmer-text",
        kind: "page",
        label: "Shimmer Text",
        slug: "shimmer-text",
      },
      {
        href: "/components/status-marker",
        kind: "page",
        label: "Status Marker",
        slug: "status-marker",
      },
      { href: "/components/switch", kind: "page", label: "Switch", slug: "switch" },
      { href: "/components/tabs", kind: "page", label: "Tabs", slug: "tabs" },
      { href: "/components/text-area", kind: "page", label: "Text Area", slug: "text-area" },
      { href: "/components/text-field", kind: "page", label: "Text Field", slug: "text-field" },
      { href: "/components/toast", kind: "page", label: "Toast", slug: "toast" },
      { href: "/components/tooltip", kind: "page", label: "Tooltip", slug: "tooltip" },
    ],
    label: "Components",
    order: 30,
  },
  {
    id: "primitives",
    items: [{ href: "/primitives/surface", kind: "page", label: "Surface", slug: "surface" }],
    label: "Primitives",
    order: 40,
  },
  {
    id: "patterns",
    items: [
      {
        aliases: ["/components/sidebar"],
        href: "/patterns/application-sidebar",
        kind: "page",
        label: "Application Sidebar",
        slug: "application-sidebar",
      },
      {
        aliases: ["/components/page-header"],
        href: "/patterns/page-header",
        kind: "page",
        label: "Page Header",
        slug: "page-header",
      },
      {
        aliases: ["/components/quick-link"],
        href: "/patterns/quick-link",
        kind: "page",
        label: "Quick Link",
        slug: "quick-link",
      },
      {
        aliases: ["/components/settings-row"],
        href: "/patterns/settings-row",
        kind: "page",
        label: "Settings Row",
        slug: "settings-row",
      },
    ],
    label: "Patterns",
    order: 50,
  },
  {
    id: "templates",
    items: [
      {
        href: "/templates/agent-page",
        kind: "page",
        label: "Agent Page",
        slug: "agent-page",
      },
      {
        href: "/templates/page-layout",
        kind: "page",
        label: "Page Layout",
        slug: "page-layout",
      },
      {
        href: "/templates/settings-page",
        kind: "page",
        label: "Settings Page",
        slug: "settings-page",
      },
    ],
    label: "Templates",
    order: 60,
  },
  {
    id: "guides",
    items: [{ href: "/guides/strict-csp", kind: "page", label: "Strict CSP", slug: "strict-csp" }],
    label: "Guides",
    order: 70,
  },
  { id: "reference", items: [], label: "Reference", order: 80 },
] as const satisfies readonly DocsSection[];

export function getOrderedDocsSections(): readonly DocsSection[] {
  return [...docsRegistry].sort((left, right) => left.order - right.order);
}

export function getDocsPageItems(): readonly DocsNavPage[] {
  return getOrderedDocsSections().flatMap((section) =>
    section.items.filter((item): item is DocsNavPage => item.kind === "page"),
  );
}

export function getDocsPageItem(slug: DocsPage): DocsNavPage | undefined {
  return getDocsPageItems().find((item) => item.slug === slug);
}

export function getDocsPageForPath(pathname: string): DocsPage | undefined {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  return getDocsPageItems().find((item) =>
    [item.href, ...(item.aliases ?? [])].includes(normalized),
  )?.slug;
}

export function getDocsSectionForPage(slug: DocsPage): DocsSectionId | undefined {
  return getOrderedDocsSections().find((section) =>
    section.items.some((item) => item.kind === "page" && item.slug === slug),
  )?.id;
}

export function getDocsRouteParams(): Array<{ section: string; slug: string }> {
  return getDocsPageItems()
    .flatMap((item) =>
      [item.href, ...(item.aliases ?? [])]
        .filter((href) => href !== "/")
        .map((href) => {
          const [section, slug] = href.split("/").filter(Boolean);
          return section && slug ? { section, slug } : [];
        }),
    )
    .flat();
}

export function getDocsPageForRoute(section: string, slug: string): DocsPage | undefined {
  return getDocsPageForPath(`/${section}/${slug}`);
}
