"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "fumadocs-ui/provider/base";
import { Display, Moon, Sun } from "@gravity-ui/icons";
import { Tabs } from "@lenso/ui/tabs";
import { headerControls as s } from "@lenso/docs/presentation";
import { useDocumentationMessages } from "./i18n";

const subscribe = () => () => {};
const options = [
  ["light", Sun],
  ["dark", Moon],
  ["system", Display],
] as const;

export function ThemeToggle() {
  const messages = useDocumentationMessages();
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
        <Tabs.List aria-label={messages.colorTheme} xstyle={s.themeList}>
          {options.map(([value, Icon]) => (
            <Tabs.Tab
              key={value}
              value={value}
              title={messages.theme[value]}
              aria-label={messages.theme[value]}
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
