import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Command } from "@lenso/ui/command";
import { Kbd } from "@lenso/ui/kbd";

const commands = ["Open file", "Create project", "Settings"];
export function CommandStory({ disabled = false }: { disabled?: boolean }) {
  const [lastCommand, setLastCommand] = useState("");
  const [active, setActive] = useState<string>();
  return (
    <div {...stylex.props(styles.root)}>
      <Command items={commands} disabled={disabled} onItemHighlighted={(item) => setActive(item)}>
        <Command.Header>
          <Command.InputGroup>
            <Command.SearchIcon />
            <Command.Input aria-label="Find a command" placeholder="Find a command…" />
            <Command.Clear />
          </Command.InputGroup>
        </Command.Header>
        <Command.SectionLabel>Workspace</Command.SectionLabel>
        <Command.Viewport>
          <Command.Empty>No matching commands.</Command.Empty>
          <Command.List>
            {(command: string) => (
              <Command.Item key={command} value={command} onSelect={setLastCommand}>
                <Command.ItemContent>
                  <Command.ItemText>{command}</Command.ItemText>
                </Command.ItemContent>
              </Command.Item>
            )}
          </Command.List>
        </Command.Viewport>
        <Command.Footer>
          <Command.Hint>
            <Command.Key>
              <Kbd.Abbr keyValue="up" />
              <Kbd.Abbr keyValue="down" />
            </Command.Key>
            Navigate
          </Command.Hint>
          <Command.Action
            disabled={disabled || !active}
            onClick={() => active && setLastCommand(active)}
          >
            Run command
            <Command.ActionKey>
              <Kbd.Abbr keyValue="enter" />
            </Command.ActionKey>
          </Command.Action>
        </Command.Footer>
      </Command>
      <output aria-live="polite" {...stylex.props(styles.status)}>
        {lastCommand ? `Selected: ${lastCommand}` : "Choose a command to try it."}
      </output>
    </div>
  );
}
const styles = stylex.create({
  root: { width: 480, maxWidth: "100%", display: "flex", flexDirection: "column", gap: 16 },
  status: { paddingInline: 12, fontSize: 13, color: "var(--lenso-label-secondary)" },
});
