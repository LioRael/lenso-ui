"use client";

import { Switch, type SwitchRootProps } from "@lenso/ui";
import { useDataEngine } from "@fumari/stf";

export interface SwitchStoryProps {
  size?: SwitchRootProps["size"];
  disabled?: SwitchRootProps["disabled"];
  checked?: SwitchRootProps["checked"];
  label: string;
}

export function SwitchStory({ label, ...props }: SwitchStoryProps) {
  const engine = useDataEngine();
  return (
    <Switch {...props} onCheckedChange={(checked) => engine.update(["checked"], checked)}>
      <Switch.Content>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        {label}
      </Switch.Content>
    </Switch>
  );
}
