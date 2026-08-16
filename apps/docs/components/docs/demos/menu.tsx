"use client";

import * as React from "react";
import { CalendarIcon, FileIcon, LinkIcon, StarIcon, Trash2Icon } from "lucide-react";

import { Menu } from "@lenso/ui/menu";
import { ThemeScope } from "@lenso/ui/theme-scope";
import { CodeBlock } from "../code-block";
import { ComponentPage } from "../component-page";
import { LivePlayground } from "../live-playground";
import { PlaygroundControls } from "../playground-controls";
import { useDocsPageTheme } from "../use-docs-page-theme";

const codeExample = `import { Menu } from "@lenso/ui/menu"

<Menu.Root>
  <Menu.ControlTrigger>Open menu</Menu.ControlTrigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.LinkItem href="/issue/14">Open issue</Menu.LinkItem>
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger>Create related</Menu.SubmenuTrigger>
          <Menu.Portal>
            <Menu.Positioner side="right">
              <Menu.Popup submenu>...</Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
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
    <ComponentPage
      description="Composable application menu with shortcuts, links, nested surfaces, and complete keyboard navigation."
      eyebrow="Foundation component · Overlays"
      metadata={["Figma canonical", "Base UI behavior"]}
      name="Menu"
      slug="menu"
    >
      <LivePlayground
        controls={
          <PlaygroundControls
            example="default"
            exampleLabel="Example · Nested"
            name="Menu"
            onExampleChange={() => {}}
          >
            <p>Icons and every structural part remain consumer replaceable.</p>
          </PlaygroundControls>
        }
        controlsMode="custom"
        description="Open the real component and navigate nested actions with the keyboard."
        preview={
          <ThemeScope className="stage-canvas popover-stage" theme={pageTheme}>
            <Menu.Root>
              <Menu.ControlTrigger>Open menu</Menu.ControlTrigger>
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
        }
      />
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
        <CodeBlock code={codeExample} />
      </section>
    </ComponentPage>
  );
}
