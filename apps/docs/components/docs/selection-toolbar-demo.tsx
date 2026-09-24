"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Checkbox } from "@lenso/ui/checkbox";
import { Menu } from "@lenso/ui/menu";
import { SelectionToolbar } from "@lenso/ui/selection-toolbar";
import { Command } from "lucide-react";

import { DataPlayground } from "./data-playground";
import { styles } from "./selection-toolbar-demo.stylex";

const people = ["Ada Lovelace", "Grace Hopper", "Alan Turing"] as const;

export function SelectionToolbarDemo() {
  const [selected, setSelected] = React.useState<ReadonlySet<string>>(
    () => new Set(people.slice(0, 2)),
  );
  const [status, setStatus] = React.useState("");
  const toggle = (name: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(name);
      else next.delete(name);
      return next;
    });
  const copyNames = async () => {
    try {
      await navigator.clipboard.writeText(people.filter((name) => selected.has(name)).join(", "));
      setStatus("Names copied");
    } catch {
      setStatus("Could not copy names");
    }
  };

  return (
    <DataPlayground>
      <div {...stylex.props(styles.stage)}>
        <div {...stylex.props(styles.list)}>
          {people.map((name) => (
            <div key={name} {...stylex.props(styles.row, selected.has(name) && styles.selected)}>
              <Checkbox.Root
                aria-label={`Select ${name}`}
                checked={selected.has(name)}
                onCheckedChange={(checked) => toggle(name, checked)}
              >
                <Checkbox.Indicator />
              </Checkbox.Root>
              {name}
            </div>
          ))}
        </div>
        <output {...stylex.props(styles.status)}>{status}</output>
        <SelectionToolbar.Root count={selected.size} onClear={() => setSelected(new Set())}>
          <Menu.Root>
            <Menu.Trigger render={<SelectionToolbar.Action icon={<Command size={15} />} />}>
              Actions
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner align="center" side="top" sideOffset={8}>
                <Menu.Popup aria-label="Selected person actions">
                  <Menu.Item onClick={copyNames}>Copy names</Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </SelectionToolbar.Root>
      </div>
    </DataPlayground>
  );
}
