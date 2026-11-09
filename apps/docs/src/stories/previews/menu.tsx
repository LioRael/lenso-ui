"use client";
import { Menu } from "@lenso/ui";
import { useDataEngine } from "@fumari/stf";
import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { s } from "./materials.stylex";
export interface MenuStoryProps {
  presentation?: "popup" | "bar";
  elastic?: boolean;
  morphTrigger?: boolean;
  submenuPresentation?: "auto" | "stacked" | "cascade";
  label: string;
  open: boolean;
  disabled?: boolean;
  align?: "start" | "end";
}
export function MenuStory({
  presentation = "popup",
  elastic = true,
  label,
  open,
  disabled,
  align,
  submenuPresentation,
  morphTrigger = true,
}: MenuStoryProps) {
  const engine = useDataEngine(),
    id = useId();
  const [action, setAction] = useState("");
  return (
    <div {...stylex.props(s.row)}>
      <Menu
        open={open}
        morphTrigger={morphTrigger}
        elastic={elastic}
        triggerId={id}
        disabled={disabled}
        onOpenChange={(next) => engine.update(["open"], next)}
      >
        {presentation === "bar" ? (
          <Menu.Bar aria-label="Editing actions">
            <Menu.BarItem onClick={() => setAction("Cut")}>Cut</Menu.BarItem>
            <Menu.BarItem onClick={() => setAction("Copy")}>Copy</Menu.BarItem>
            <Menu.BarItem onClick={() => setAction("Paste")}>Paste</Menu.BarItem>
            <Menu.ExpandTrigger id={id} aria-label={label} />
          </Menu.Bar>
        ) : (
          <Menu.Trigger id={id} aria-label={label} />
        )}
        <Menu.Portal>
          <Menu.Positioner align={align}>
            <Menu.Popup aria-label={label}>
              <Menu.Item onClick={() => setAction("Edit")}>Edit</Menu.Item>
              <Menu.Item onClick={() => setAction("Duplicate")}>Duplicate</Menu.Item>
              <Menu.SubmenuRoot presentation={submenuPresentation}>
                <Menu.SubmenuTrigger>Sort by</Menu.SubmenuTrigger>
                <Menu.Portal>
                  <Menu.Positioner>
                    <Menu.Popup>
                      <Menu.Item onClick={() => setAction("Sort by name")}>Name</Menu.Item>
                      <Menu.Item onClick={() => setAction("Sort by date")}>Date modified</Menu.Item>
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.SubmenuRoot>
              <Menu.Separator />
              <Menu.Item variant="danger" onClick={() => setAction("Delete")}>
                Delete
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu>
      <output {...stylex.props(s.output)}>{action}</output>
    </div>
  );
}
