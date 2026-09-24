import Link from "next/link";
import * as stylex from "@stylexjs/stylex";

import { styles } from "./overview.stylex";

const groups = [
  {
    id: "quick-start",
    title: "Start",
    description: "Get the package into an application and choose how to own its source.",
    links: [
      { href: "/start/installation", label: "Installation", detail: "Set up packages and styles" },
      { href: "/start/quick-start", label: "Quick start", detail: "Build the first interface" },
      {
        href: "/start/package-vs-registry",
        label: "Package vs Registry",
        detail: "Choose managed or editable source",
      },
    ],
  },
  {
    id: "foundations",
    title: "Foundations",
    description: "Use semantic roles for color, type and state before composing a page.",
    links: [
      { href: "/foundations/tokens", label: "Tokens", detail: "Find the right semantic role" },
      { href: "/foundations/themes", label: "Themes", detail: "Work in Light and Dark" },
      { href: "/foundations/theme-lab", label: "Theme Lab", detail: "Try scoped overrides" },
    ],
  },
  {
    id: "components",
    title: "Components",
    description: "Start with the interface job, then select the smallest useful part.",
    links: [
      { href: "/components/button", label: "Button", detail: "Actions and emphasis" },
      { href: "/components/text-field", label: "Text Field", detail: "Short form input" },
      { href: "/components/menu", label: "Menu", detail: "Contextual actions and choices" },
      { href: "/components/tabs", label: "Tabs", detail: "Peer views and selection" },
    ],
  },
  {
    id: "patterns",
    title: "Patterns & templates",
    description: "Combine parts for a workflow while the application owns its data and behavior.",
    links: [
      {
        href: "/patterns/application-sidebar",
        label: "Application Sidebar",
        detail: "Compact destinations",
      },
      { href: "/templates/agent-page", label: "Agent Page", detail: "Prompt and response layout" },
      {
        href: "/templates/console-workspace",
        label: "Console Workspace",
        detail: "Extensible App shell",
      },
      { href: "/templates/settings-page", label: "Settings Page", detail: "Grouped preferences" },
    ],
  },
] as const;

export function OverviewContent() {
  return (
    <div {...stylex.props(styles.page)}>
      <header {...stylex.props(styles.intro)}>
        <p {...stylex.props(styles.eyebrow)}>Lenso UI</p>
        <h1 {...stylex.props(styles.title)}>A shared foundation for Lenso interfaces.</h1>
        <p {...stylex.props(styles.description)}>
          Semantic tokens, accessible components and adaptable patterns. Use the guides below to
          find the right part, then explore its states in the live playground.
        </p>
      </header>

      <nav aria-label="Browse Lenso UI documentation" {...stylex.props(styles.directory)}>
        {groups.map((group) => (
          <section id={group.id} key={group.id} {...stylex.props(styles.group)}>
            <div {...stylex.props(styles.groupIntro)}>
              <h2 {...stylex.props(styles.groupTitle)}>{group.title}</h2>
              <p {...stylex.props(styles.groupDescription)}>{group.description}</p>
            </div>
            <div {...stylex.props(styles.links)}>
              {group.links.map((link) => (
                <Link href={link.href} key={link.href} {...stylex.props(styles.link)}>
                  <span {...stylex.props(styles.linkLabel)}>{link.label}</span>
                  <span {...stylex.props(styles.linkDetail)}>{link.detail}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </nav>
    </div>
  );
}
