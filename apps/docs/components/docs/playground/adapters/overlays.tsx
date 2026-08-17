"use client";

import * as React from "react";
import {
  CalendarIcon,
  ChevronDownIcon,
  CircleIcon,
  FileIcon,
  LinkIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "@lenso/ui/button";
import { Combobox } from "@lenso/ui/combobox";
import { CommandMenu } from "@lenso/ui/command-menu";
import { Menu } from "@lenso/ui/menu";
import { Popover } from "@lenso/ui/popover";
import { Toast, type ToastTone } from "@lenso/ui/toast";
import { ThemeScope } from "@lenso/ui/theme-scope";
import { Tooltip } from "@lenso/ui/tooltip";

import type { PlaygroundAdapter } from "../types";

function stringValue(
  values: Readonly<Record<string, boolean | number | string>>,
  id: string,
  fallback: string,
) {
  const value = values[id];
  return typeof value === "string" ? value : fallback;
}

const labels = ["Bug", "Feature", "Improvement"] as const;
const markerColors = ["#eb5757", "#bb87fc", "#4ea7fc"] as const;

function ComboboxPreview({ multiple, state }: { multiple: boolean; state: string }) {
  const content = (
    <>
      <Combobox.InputGroup>
        <Combobox.Input
          disabled={state === "loading"}
          placeholder={state === "loading" ? "Loading labels…" : "Change or add labels…"}
        />
        <Combobox.Shortcut>L</Combobox.Shortcut>
      </Combobox.InputGroup>
      <Combobox.Portal>
        <Combobox.Positioner>
          <Combobox.Popup>
            {state === "loading" ? (
              <Combobox.Status>Loading labels…</Combobox.Status>
            ) : state === "empty" ? (
              <Combobox.Empty>No labels found</Combobox.Empty>
            ) : (
              <Combobox.List>
                {(label: string) => {
                  const index = labels.indexOf(label as (typeof labels)[number]);
                  return (
                    <Combobox.Item key={label} value={label}>
                      {multiple ? (
                        <>
                          <Combobox.ItemIndicator />
                          <Combobox.Marker style={{ color: markerColors[index] }} />
                          <Combobox.ItemText>{label}</Combobox.ItemText>
                        </>
                      ) : (
                        <>
                          <Combobox.Marker style={{ color: markerColors[index] }} />
                          <Combobox.ItemText>{label}</Combobox.ItemText>
                          <Combobox.ItemIndicator />
                          <Combobox.Trailing>{index}</Combobox.Trailing>
                        </>
                      )}
                    </Combobox.Item>
                  );
                }}
              </Combobox.List>
            )}
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </>
  );

  return multiple ? (
    <Combobox.Root
      key="multiple"
      defaultValue={["Improvement"]}
      items={labels}
      multiple
      open={state !== "closed"}
    >
      {content}
    </Combobox.Root>
  ) : (
    <Combobox.Root key="single" defaultValue="Improvement" items={labels} open={state !== "closed"}>
      {content}
    </Combobox.Root>
  );
}

export const comboboxAdapter: PlaygroundAdapter = ({ theme, values }) => {
  const state = stringValue(values, "state", "closed");
  const multiple = stringValue(values, "selection", "multiple") === "multiple";

  return (
    <ThemeScope className="stage-canvas" theme={theme}>
      <ComboboxPreview multiple={multiple} state={state} />
    </ThemeScope>
  );
};

const commands = [
  "Assign to…",
  "Un-assign from me",
  "Change status…",
  "Set priority…",
  "Add to project…",
  "Change or add labels…",
  "Set due date…",
] as const;

export const commandMenuAdapter: PlaygroundAdapter = ({ theme, values }) => {
  const state = stringValue(values, "state", "default");
  const query = state === "query" ? "status" : state === "no-results" ? "zzzzzz" : "";
  const items = state === "no-results" ? [] : commands;

  return (
    <ThemeScope className="stage-canvas command-menu-stage" theme={theme}>
      <CommandMenu.Root items={items} inputValue={query}>
        <CommandMenu.Panel>
          <CommandMenu.Search>
            <CommandMenu.Input
              aria-label="Command search"
              placeholder="Type a command or search…"
            />
            <CommandMenu.SearchHint>Ask Lenso　 Tab</CommandMenu.SearchHint>
          </CommandMenu.Search>
          {state !== "no-results" && (
            <CommandMenu.GroupLabel>
              {state === "query" ? "Commands" : "TES-14　·　kkk"}
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
  );
};

function MenuItem({
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

export const menuAdapter: PlaygroundAdapter = ({ theme }) => (
  <ThemeScope className="stage-canvas popover-stage" theme={theme}>
    <Menu.Root>
      <Menu.ControlTrigger>Open menu</Menu.ControlTrigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup aria-label="Issue actions">
            <MenuItem icon={CalendarIcon} shortcut="⇧ D">
              Due date
            </MenuItem>
            <Menu.LinkItem href="#link">
              <Menu.Leading>
                <LinkIcon size={16} />
              </Menu.Leading>
              <Menu.Label>Add link…</Menu.Label>
              <Menu.Trailing>
                <Menu.Shortcut>⌃ L</Menu.Shortcut>
              </Menu.Trailing>
            </Menu.LinkItem>
            <MenuItem icon={FileIcon}>Add document…</MenuItem>
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
                    <MenuItem icon={CalendarIcon}>Custom…</MenuItem>
                    <MenuItem icon={CalendarIcon}>Tomorrow</MenuItem>
                    <MenuItem icon={CalendarIcon}>End of this week</MenuItem>
                    <MenuItem icon={CalendarIcon}>In one week</MenuItem>
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
);

export const popoverAdapter: PlaygroundAdapter = ({ setValue, theme, values }) => {
  const arrow = values.arrow === true;
  const open = values.open === true;
  const placement = stringValue(values, "placement", "bottom") as
    | "bottom"
    | "left"
    | "right"
    | "top";

  return (
    <ThemeScope className="stage-canvas popover-stage" theme={theme}>
      <Popover.Root onOpenChange={(nextOpen) => setValue("open", nextOpen)} open={open}>
        <Popover.Trigger>
          Open popover
          <ChevronDownIcon
            aria-hidden="true"
            size={10}
            strokeWidth={1.5}
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 120ms ease-out",
            }}
          />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner side={placement}>
            <Popover.Popup aria-label="Project actions">
              {arrow && <Popover.Arrow />}
              <Popover.Item>Edit issue</Popover.Item>
              <Popover.Item>Set reminder</Popover.Item>
              <Popover.Item tone="danger">Delete</Popover.Item>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </ThemeScope>
  );
};

function ToastPreview({ tone }: { tone: ToastTone }) {
  const { add, close } = Toast.useToastManager();

  React.useEffect(() => {
    const id = add({ description: "“TES-11” copied to clipboard", timeout: 0, type: tone });
    return () => close(id);
  }, [add, close, tone]);

  return (
    <>
      <Button
        onClick={() => add({ description: "“TES-11” copied to clipboard", type: tone })}
        variant="secondary"
      >
        Show toast
      </Button>
      <Toast.Portal>
        <Toast.Viewport>
          <Toast.List />
        </Toast.Viewport>
      </Toast.Portal>
    </>
  );
}

export const toastAdapter: PlaygroundAdapter = ({ theme, values }) => (
  <ThemeScope className="stage-canvas" theme={theme}>
    <Toast.Provider timeout={5000}>
      <ToastPreview tone={stringValue(values, "tone", "default") as ToastTone} />
    </Toast.Provider>
  </ThemeScope>
);

export const tooltipAdapter: PlaygroundAdapter = ({ theme, values }) => (
  <ThemeScope className="stage-canvas tooltip-stage" theme={theme}>
    <Tooltip.Provider closeDelay={0} delay={200}>
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger render={<Button variant="secondary" />}>Hover for help</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup>
              Help with
              {values.shortcut === true && <Tooltip.Shortcut>?</Tooltip.Shortcut>}
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  </ThemeScope>
);
