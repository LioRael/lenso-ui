"use client";

import * as React from "react";
import { CircleIcon } from "lucide-react";

import { Button } from "@lenso/ui/button";
import { CommandMenu } from "@lenso/ui/command-menu";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { DocsShell } from "./docs-shell";

const commands = [
  "Assign to…",
  "Un-assign from me",
  "Change status…",
  "Set priority…",
  "Add to project…",
  "Change or add labels…",
  "Set due date…",
] as const;

const codeExample = `import { CommandMenu } from "@lenso/ui/command-menu"

<CommandMenu.Root items={commands}>
  <CommandMenu.Panel>
    <CommandMenu.Search>
      <CommandMenu.Input placeholder="Type a command or search…" />
    </CommandMenu.Search>
    <CommandMenu.List>
      {(command) => <CommandMenu.Item value={command}>{command}</CommandMenu.Item>}
    </CommandMenu.List>
  </CommandMenu.Panel>
</CommandMenu.Root>`;

export function CommandMenuDocumentation() {
  const [copied, setCopied] = React.useState(false);
  const [pageTheme, setPageTheme] = React.useState<"dark" | "light">("light");
  const [stageTheme, setStageTheme] = React.useState<"System" | "Light" | "Dark">("System");
  const [state, setState] = React.useState<"Default" | "No Results" | "Query">("Default");

  React.useEffect(() => {
    const theme = new URLSearchParams(window.location.search).get("theme");
    if (theme === "dark" || theme === "light") setPageTheme(theme);
  }, []);

  const query = state === "Query" ? "status" : state === "No Results" ? "zzzzzz" : "";
  const items = state === "No Results" ? [] : commands;
  const resolvedTheme =
    stageTheme === "System" ? pageTheme : (stageTheme.toLowerCase() as "dark" | "light");

  return (
    <DocsShell
      actions={["View source", "Install"]}
      breadcrumbs={["Components", "Command Menu"]}
      current="command-menu"
      theme={pageTheme}
    >
      <div className="button-docs-content command-menu-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">FOUNDATION COMPONENT · NAVIGATION</p>
          <h1>Command Menu</h1>
          <p className="button-description">
            Search, grouped commands, selected item, and keyboard shortcuts.
          </p>
          <div className="metadata-pills button-metadata">
            <span>Figma canonical</span>
            <span>Implementation ready</span>
          </div>
        </section>

        <section className="button-playground">
          <div className="playground-heading">
            <div>
              <h2>Live playground</h2>
              <p>
                Filter the real Base UI-backed command collection and navigate it with the keyboard.
              </p>
            </div>
            <div className="playground-actions">
              <Button
                onClick={() => {
                  setState("Default");
                  setStageTheme("System");
                }}
                variant="secondary"
              >
                Reset
              </Button>
              <Button
                onClick={async () => {
                  await navigator.clipboard.writeText(codeExample);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1200);
                }}
                variant="secondary"
              >
                {copied ? "Copied" : "Copy JSX"}
              </Button>
            </div>
          </div>
          <div className="playground-body command-menu-playground-body">
            <article className="rendered-stage">
              <div className="stage-header">
                <h3>Rendered component</h3>
                <span>BOUND TO REAL INSTANCE</span>
              </div>
              <ThemeScope className="stage-canvas command-menu-stage" theme={resolvedTheme}>
                <CommandMenu.Root items={items} inputValue={query}>
                  <CommandMenu.Panel>
                    <CommandMenu.Search>
                      <CommandMenu.Input
                        aria-label="Command search"
                        placeholder="Type a command or search…"
                      />
                      <CommandMenu.SearchHint>Ask Lenso　 Tab</CommandMenu.SearchHint>
                    </CommandMenu.Search>
                    {state !== "No Results" && (
                      <CommandMenu.GroupLabel>
                        {state === "Query" ? "Commands" : "TES-14　·　kkk"}
                      </CommandMenu.GroupLabel>
                    )}
                    <CommandMenu.List>
                      {(command: string) => (
                        <CommandMenu.Item key={command} value={command}>
                          <CommandMenu.ItemIcon>
                            <CircleIcon aria-hidden="true" size={10} />
                          </CommandMenu.ItemIcon>
                          <CommandMenu.ItemText>{command}</CommandMenu.ItemText>
                          <CommandMenu.Shortcut>S</CommandMenu.Shortcut>
                        </CommandMenu.Item>
                      )}
                    </CommandMenu.List>
                    <CommandMenu.Empty>No commands found</CommandMenu.Empty>
                  </CommandMenu.Panel>
                </CommandMenu.Root>
              </ThemeScope>
            </article>
            <form className="playground-inspector" onSubmit={(event) => event.preventDefault()}>
              <div className="inspector-header">
                <strong>Command Menu</strong>
                <button type="button">
                  Example · Default <span aria-hidden="true">⌄</span>
                </button>
              </div>
              <div className="inspector-divider" />
              <label className="inspector-row">
                <span>State</span>
                <select
                  onChange={(event) => setState(event.target.value as typeof state)}
                  value={state}
                >
                  <option>Default</option>
                  <option>Query</option>
                  <option>No Results</option>
                </select>
              </label>
              <label className="inspector-row">
                <span>Theme</span>
                <select
                  onChange={(event) => setStageTheme(event.target.value as typeof stageTheme)}
                  value={stageTheme}
                >
                  <option>System</option>
                  <option>Light</option>
                  <option>Dark</option>
                </select>
              </label>
            </form>
          </div>
        </section>

        <section className="button-guidance select-guidance">
          <article>
            <h2>Usage guidance</h2>
            <ul>
              <li>Use for fast, keyboard-first actions and navigation.</li>
              <li>Compose inside a Dialog when the menu should be modal.</li>
            </ul>
          </article>
          <article>
            <h2>Accessibility</h2>
            <ul>
              <li>Combobox semantics, filtering, and arrow-key navigation come from Base UI.</li>
            </ul>
          </article>
        </section>
        <section className="button-implementation select-implementation">
          <div>
            <h2>Implementation</h2>
            <p>Every visual part remains replaceable through the composition API.</p>
          </div>
          <pre>
            <code>{codeExample}</code>
          </pre>
        </section>
      </div>
    </DocsShell>
  );
}
