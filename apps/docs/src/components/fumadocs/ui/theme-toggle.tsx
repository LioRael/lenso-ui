"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Display, Moon, Sun } from "@gravity-ui/icons";
import { Tabs } from "@lenso/ui";
import { headerControls as s } from "@/styles/header-controls.stylex";

const subscribe = () => () => {};
const options = [
  ["light", Sun],
  ["dark", Moon],
  ["system", Display],
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return (
    <Tabs
      glass
      lift={6}
      value={mounted ? (theme ?? "system") : null}
      onValueChange={(value) => {
        if (typeof value === "string") setTheme(value);
      }}
      xstyle={s.themeGroup}
    >
      <Tabs.ListContainer>
        <Tabs.List aria-label="Color theme" xstyle={s.themeList}>
          {options.map(([value, Icon]) => (
            <Tabs.Tab
              key={value}
              value={value}
              title={`${value[0]?.toUpperCase()}${value.slice(1)} theme`}
              aria-label={`${value[0]?.toUpperCase()}${value.slice(1)} theme`}
            >
              <Icon width={16} height={16} aria-hidden="true" />
            </Tabs.Tab>
          ))}
          <Tabs.Indicator />
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  );
}
