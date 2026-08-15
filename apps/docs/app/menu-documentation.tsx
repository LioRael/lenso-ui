"use client";

import * as React from "react";
import { CalendarIcon, FileIcon, LinkIcon, StarIcon, Trash2Icon } from "lucide-react";

import { Button } from "@lenso/ui/button";
import { Menu } from "@lenso/ui/menu";
import { ThemeScope } from "@lenso/ui/theme-scope";
import { DocsShell } from "./docs-shell";
import { useDocsPageTheme } from "./use-docs-page-theme";

const codeExample = `import { Menu } from "@lenso/ui/menu"

<Menu.Root>
  <Menu.Trigger>Open menu</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.LinkItem href="/issue/14">Open issue</Menu.LinkItem>
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger>Create related</Menu.SubmenuTrigger>
          <Menu.Portal><Menu.Positioner side="right"><Menu.Popup submenu>...</Menu.Popup></Menu.Positioner></Menu.Portal>
        </Menu.SubmenuRoot>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>`;

function Item({
  children,
  icon: Icon,
  shortcut,
}: {
  children: React.ReactNode;
  icon: React.ComponentType<{ size?: number }>;
  shortcut?: string;
}) {
  return (
    <Menu.Item>
      <Menu.Leading>
        <Icon size={16} />
      </Menu.Leading>
      <Menu.Label>{children}</Menu.Label>
      {shortcut && (
        <Menu.Trailing>
          <Menu.Shortcut>{shortcut}</Menu.Shortcut>
        </Menu.Trailing>
      )}
    </Menu.Item>
  );
}

export function MenuDocumentation() {
  const pageTheme = useDocsPageTheme();
  return (
    <DocsShell
      actions={["View source", "Install"]}
      breadcrumbs={["Components", "Menu"]}
      current="menu"
      theme={pageTheme}
    >
      <div className="button-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">FOUNDATION COMPONENT · OVERLAYS</p>
          <h1>Menu</h1>
          <p className="button-description">
            Composable application menu with shortcuts, links, nested surfaces, and complete
            keyboard navigation.
          </p>
          <div className="metadata-pills button-metadata">
            <span>Figma canonical</span>
            <span>Base UI behavior</span>
          </div>
        </section>
        <section className="button-playground">
          <div className="playground-heading">
            <div>
              <h2>Live playground</h2>
              <p>Open the real component and navigate nested actions with the keyboard.</p>
            </div>
          </div>
          <div className="playground-body">
            <article className="rendered-stage">
              <div className="stage-header">
                <h3>Rendered component</h3>
                <span>BOUND TO REAL INSTANCE</span>
              </div>
              <ThemeScope className="stage-canvas popover-stage" theme={pageTheme}>
                <Menu.Root>
                  <Menu.Trigger render={<Button variant="secondary" />}>Open menu</Menu.Trigger>
                  <Menu.Portal>
                    <Menu.Positioner>
                      <Menu.Popup aria-label="Issue actions">
                        <Item icon={CalendarIcon} shortcut="⇧ D">
                          Due date
                        </Item>
                        <Menu.LinkItem href="#link">
                          <Menu.Leading>
                            <LinkIcon size={16} />
                          </Menu.Leading>
                          <Menu.Label>Add link…</Menu.Label>
                          <Menu.Trailing>
                            <Menu.Shortcut>⌃ L</Menu.Shortcut>
                          </Menu.Trailing>
                        </Menu.LinkItem>
                        <Item icon={FileIcon}>Add document…</Item>
                        <Menu.Separator />
                        <Menu.SubmenuRoot>
                          <Menu.SubmenuTrigger>
                            <Menu.Leading>
                              <StarIcon size={16} />
                            </Menu.Leading>
                            <Menu.Label>Create related</Menu.Label>
                          </Menu.SubmenuTrigger>
                          <Menu.Portal>
                            <Menu.Positioner side="right" sideOffset={-4}>
                              <Menu.Popup submenu>
                                <Menu.Hint>Try: 24h, 7 days, Feb 9</Menu.Hint>
                                <Item icon={CalendarIcon}>Custom…</Item>
                                <Item icon={CalendarIcon}>Tomorrow</Item>
                                <Item icon={CalendarIcon}>End of this week</Item>
                                <Item icon={CalendarIcon}>In one week</Item>
                              </Menu.Popup>
                            </Menu.Positioner>
                          </Menu.Portal>
                        </Menu.SubmenuRoot>
                        <Menu.Separator />
                        <Menu.Item tone="danger">
                          <Menu.Leading>
                            <Trash2Icon size={16} />
                          </Menu.Leading>
                          <Menu.Label>Delete</Menu.Label>
                          <Menu.Trailing>
                            <Menu.Shortcut>⌘ ⌫</Menu.Shortcut>
                          </Menu.Trailing>
                        </Menu.Item>
                      </Menu.Popup>
                    </Menu.Positioner>
                  </Menu.Portal>
                </Menu.Root>
              </ThemeScope>
            </article>
            <aside className="playground-inspector">
              <div className="inspector-header">
                <strong>Menu</strong>
                <button type="button">Example · Nested</button>
              </div>
              <div className="inspector-divider" />
              <p>Icons and every structural part remain consumer replaceable.</p>
            </aside>
          </div>
        </section>
        <section className="button-guidance select-guidance">
          <article>
            <h2>Usage guidance</h2>
            <ul>
              <li>Use Item for actions and LinkItem for navigation.</li>
              <li>Keep labels concise and group destructive actions last.</li>
            </ul>
          </article>
          <article>
            <h2>Accessibility</h2>
            <ul>
              <li>Base UI owns roles, roving focus, typeahead, and nested keyboard navigation.</li>
              <li>Escape closes the active surface and restores focus.</li>
            </ul>
          </article>
        </section>
        <section className="button-implementation select-implementation">
          <div>
            <h2>Implementation</h2>
            <p>StyleX visual slots over composable Base UI behavior.</p>
          </div>
          <pre>
            <code>{codeExample}</code>
          </pre>
        </section>
      </div>
    </DocsShell>
  );
}
