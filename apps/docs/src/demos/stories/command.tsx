import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Command } from "@lenso/ui/command";

const commands = ["Open file", "Create project", "Settings"];
export function CommandStory({ disabled = false }: { disabled?: boolean }) {
  const [lastCommand, setLastCommand] = useState("");
  return (
    <div {...stylex.props(styles.root)}>
      <Command items={commands} disabled={disabled}>
        <Command.Input aria-label="Find a command" placeholder="Find a command…" />
        <Command.Empty>No matching commands.</Command.Empty>
        <Command.List>
          <Command.Group>
            <Command.GroupLabel>Workspace</Command.GroupLabel>
            <Command.Collection>
              {(command: string) => (
                <Command.Item key={command} value={command} onSelect={setLastCommand}>
                  {command}
                </Command.Item>
              )}
            </Command.Collection>
          </Command.Group>
        </Command.List>
      </Command>
      <output aria-live="polite" {...stylex.props(styles.status)}>
        {lastCommand ? `Selected: ${lastCommand}` : "Choose a command to try it."}
      </output>
    </div>
  );
}
const styles = stylex.create({
  root: { width: 320, maxWidth: "100%", display: "flex", flexDirection: "column", gap: 8 },
  status: { paddingInline: 12, fontSize: 13, color: "var(--lenso-label-secondary)" },
});
