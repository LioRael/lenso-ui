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
  morphTrigger = true,
  submenuPresentation = "auto",
  label,
  open,
  disabled,
  align,
}: MenuStoryProps) {
  const engine = useDataEngine(),
    id = useId();
  const [action, setAction] = useState("");
  return (
    <div {...stylex.props(s.row)}>
      <Menu
        open={open}
        elastic={elastic}
        morphTrigger={morphTrigger}
        onOpenChange={(next) => engine.update(["open"], next)}
      >
        {presentation === "bar" ? (
          <Menu.Bar aria-label="Editing actions">
            <Menu.BarItem onClick={() => setAction("Cut")}>Cut</Menu.BarItem>
            <Menu.BarItem onClick={() => setAction("Copy")}>Copy</Menu.BarItem>
            <Menu.BarItem onClick={() => setAction("Paste")}>Paste</Menu.BarItem>
            <Menu.ExpandTrigger id={id} disabled={disabled} aria-label={label} />
          </Menu.Bar>
        ) : (
          <Menu.Trigger id={id} disabled={disabled} aria-label={label} />
        )}
        <Menu.Content aria-label={label} align={align}>
          <Menu.Item onClick={() => setAction("Edit")}>Edit</Menu.Item>
          <Menu.Item onClick={() => setAction("Duplicate")}>Duplicate</Menu.Item>
          <Menu.Sub presentation={submenuPresentation}>
            <Menu.SubTrigger>Sort by</Menu.SubTrigger>
            <Menu.SubContent align={align}>
              <Menu.Item onClick={() => setAction("Sort by name")}>Name</Menu.Item>
              <Menu.Item onClick={() => setAction("Sort by date")}>Date modified</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
          <Menu.Separator />
          <Menu.Item variant="danger" onClick={() => setAction("Delete")}>
            Delete
          </Menu.Item>
        </Menu.Content>
      </Menu>
      <output {...stylex.props(s.output)}>{action}</output>
    </div>
  );
}
