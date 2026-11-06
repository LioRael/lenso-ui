"use client";

import { useId, useState } from "react";
import { useDataEngine } from "@fumari/stf";
import {
  Input,
  SearchField,
  Slider,
  Tabs,
  Menu,
  type InputProps,
  type SliderRootProps,
  type TabsRootProps,
} from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const s = stylex.create({
  field: { width: "100%", maxWidth: 300 },
  slider: { width: 280, maxWidth: "100%" },
  row: { display: "flex", flexDirection: "column", alignItems: "center", gap: 24, minWidth: 0 },
  output: { fontSize: 13, color: "var(--lenso-label-secondary)", minHeight: 20 },
});
export interface InputStoryProps {
  value: string;
  placeholder?: InputProps["placeholder"];
  disabled?: InputProps["disabled"];
  readOnly?: InputProps["readOnly"];
}
export function InputStory({ value, ...props }: InputStoryProps) {
  const engine = useDataEngine();
  return (
    <Input
      {...props}
      value={value}
      aria-label="Sample input"
      xstyle={s.field}
      onValueChange={(next) => engine.update(["value"], next)}
    />
  );
}
export type SearchFieldStoryProps = InputStoryProps;
export function SearchFieldStory({
  value,
  placeholder,
  disabled,
  readOnly,
}: SearchFieldStoryProps) {
  const engine = useDataEngine();
  return (
    <SearchField disabled={disabled} xstyle={s.field}>
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input
          value={value}
          placeholder={placeholder}
          readOnly={readOnly}
          aria-label="Search"
          onValueChange={(next) => engine.update(["value"], next)}
        />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}
export interface SliderStoryProps {
  value: number;
  min?: SliderRootProps["min"];
  max?: SliderRootProps["max"];
  step?: SliderRootProps["step"];
  disabled?: SliderRootProps["disabled"];
}
export function SliderStory({ value, ...props }: SliderStoryProps) {
  const engine = useDataEngine();
  return (
    <Slider
      {...props}
      value={value}
      onValueChange={(next) => engine.update(["value"], typeof next === "number" ? next : next[0])}
      xstyle={s.slider}
    >
      <Slider.Control>
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb aria-label="Volume" />
        </Slider.Track>
      </Slider.Control>
    </Slider>
  );
}
export interface TabsStoryProps {
  value: "overview" | "activity" | "settings";
  orientation?: TabsRootProps["orientation"];
  activateOnFocus?: boolean;
}
export function TabsStory({ value, orientation, activateOnFocus }: TabsStoryProps) {
  const engine = useDataEngine();
  // Shared Story arguments commit after the pointer-release frame; selection must commit locally first.
  const [selection, setSelection] = useState({ value, external: value });
  if (selection.external !== value) setSelection({ value, external: value });
  return (
    <Tabs
      value={selection.value}
      orientation={orientation}
      onValueChange={(next) => {
        setSelection({ value: next, external: value });
        engine.update(["value"], next);
      }}
    >
      <Tabs.List activateOnFocus={activateOnFocus} aria-label="Sections">
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="activity">Activity</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
    </Tabs>
  );
}
export interface MenuStoryProps {
  elastic?: boolean;
  morphTrigger?: boolean;
  submenuPresentation?: "auto" | "stacked" | "cascade";
  label: string;
  open: boolean;
  disabled?: boolean;
  align?: "start" | "end";
}
export function MenuStory({
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
        <Menu.Trigger id={id} aria-label={label} />
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
