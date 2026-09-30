"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Display, Moon, Sun } from "@gravity-ui/icons";
import { ToggleButton, ToggleButtonGroup } from "@lenso/ui";
import { notebook } from "@/styles/notebook.stylex";

const subscribe = () => () => {};
const options = [
  ["light", Sun],
  ["dark", Moon],
  ["system", Display],
] as const;

// HeroUI's three-icon theme toggle; native Base UI roving focus replaces plain buttons.
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return (
    <ToggleButtonGroup
      aria-label="Color theme"
      value={mounted && theme ? [theme] : []}
      onValueChange={(values) => {
        if (values[0]) setTheme(values[0]);
      }}
      isDetached
      xstyle={notebook.themeGroup}
    >
      {options.map(([value, Icon]) => (
        <ToggleButton
          key={value}
          value={value}
          aria-label={`${value[0]?.toUpperCase()}${value.slice(1)} theme`}
          isIconOnly
          variant="ghost"
          xstyle={[notebook.themeButton, mounted && theme === value && notebook.themeActive]}
        >
          <Icon width={14} height={14} aria-hidden="true" />
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
