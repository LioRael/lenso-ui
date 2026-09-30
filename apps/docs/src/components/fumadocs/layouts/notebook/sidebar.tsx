import Link from "next/link";
import * as stylex from "@stylexjs/stylex";
import { styles } from "@/styles/docs.stylex";
import type { SearchEntry } from "../../ui/search-dialog";
import { Collapsible } from "@base-ui/react/collapsible";
import { ChevronDown } from "@gravity-ui/icons";
import { sidebar } from "@/styles/sidebar.stylex";

function Status({ entry }: { entry: SearchEntry }) {
  if (!entry.status || entry.status === "new-dot") return null;
  return (
    <span {...stylex.props(sidebar.chip, sidebar[entry.status])}>
      {entry.statusLabel ?? { new: "New", preview: "Preview", updated: "Updated" }[entry.status]}
    </span>
  );
}

function Entry({
  entry,
  current,
  onNavigate,
}: {
  entry: SearchEntry;
  current: string;
  onNavigate?: (() => void) | undefined;
}) {
  if (entry.children)
    return (
      <Collapsible.Root
        defaultOpen={entry.defaultOpen ?? entry.children.some((child) => child.href === current)}
      >
        <Collapsible.Trigger {...stylex.props(styles.navLink, sidebar.item, sidebar.trigger)}>
          {entry.label}
          <Status entry={entry} />
          <ChevronDown
            width={16}
            height={16}
            aria-hidden="true"
            {...stylex.props(sidebar.chevron)}
          />
        </Collapsible.Trigger>
        <Collapsible.Panel {...stylex.props(sidebar.children)}>
          {entry.children.map((child) => (
            <Entry
              key={child.href ?? child.label}
              entry={child}
              current={current}
              onNavigate={onNavigate}
            />
          ))}
        </Collapsible.Panel>
      </Collapsible.Root>
    );
  if (!entry.href) return <p {...stylex.props(styles.navHeading)}>{entry.label}</p>;
  return (
    <Link
      href={entry.href}
      {...(onNavigate ? { onClick: onNavigate } : {})}
      aria-current={entry.href === current ? "page" : undefined}
      {...stylex.props(styles.navLink, sidebar.item, entry.href === current && styles.active)}
    >
      {entry.label}
      <Status entry={entry} />
    </Link>
  );
}

export function SidebarPageTree({
  entries,
  current,
  onNavigate,
}: {
  entries: SearchEntry[];
  current: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Documentation pages" {...stylex.props(styles.navigation)}>
      {entries.map((entry) => (
        <Entry
          key={entry.href ?? entry.label}
          entry={entry}
          current={current}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}
