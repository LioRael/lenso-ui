"use client";
import { useState } from "react";
import { Sidebar } from "@lenso/ui";
import { ChevronDown } from "@gravity-ui/icons";
import { sidebarStyles } from "@lenso/tokens/sidebar";
import * as stylex from "@stylexjs/stylex";
export interface SidebarStoryProps {
  disabled: boolean;
}
export function SidebarStory({ disabled }: SidebarStoryProps) {
  const [selected, setSelected] = useState("library");
  return (
    <Sidebar aria-label="Library navigation">
      <Sidebar.Header>
        <strong>Library</strong>
      </Sidebar.Header>
      <Sidebar.Content>
        <Sidebar.Group aria-label="Collections">
          {["library", "favorites", "recent"].map((value) => (
            <Sidebar.Item
              key={value}
              href={`#${value}`}
              selected={selected === value}
              disabled={disabled}
              onClick={(event) => {
                event.preventDefault();
                setSelected(value);
              }}
            >
              <Sidebar.Text>
                {value[0]?.toUpperCase()}
                {value.slice(1)}
              </Sidebar.Text>
            </Sidebar.Item>
          ))}
        </Sidebar.Group>
        <Sidebar.Disclosure defaultOpen>
          <Sidebar.DisclosureTrigger>
            <Sidebar.Text>Folders</Sidebar.Text>
            <ChevronDown
              aria-hidden="true"
              width={16}
              height={16}
              {...stylex.props(sidebarStyles.disclosureIndicator)}
            />
          </Sidebar.DisclosureTrigger>
          <Sidebar.DisclosurePanel>
            <Sidebar.Item
              href="#archive"
              indent={1}
              selected={selected === "archive"}
              onClick={(event) => {
                event.preventDefault();
                setSelected("archive");
              }}
            >
              Archive
            </Sidebar.Item>
          </Sidebar.DisclosurePanel>
        </Sidebar.Disclosure>
      </Sidebar.Content>
      <Sidebar.Footer aria-live="polite">Viewing {selected}</Sidebar.Footer>
    </Sidebar>
  );
}
