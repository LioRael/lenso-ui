"use client";

import { useState } from "react";

import { Switch } from "@lenso/ui/switch";

export function OverviewThemeSwitch() {
  const [checked, setChecked] = useState(false);

  return (
    <Switch.Root
      aria-label={checked ? "Disable preview setting" : "Enable preview setting"}
      checked={checked}
      onCheckedChange={setChecked}
      size="compact"
    >
      <Switch.Thumb />
    </Switch.Root>
  );
}
