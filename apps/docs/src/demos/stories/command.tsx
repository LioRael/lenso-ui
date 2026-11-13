import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Command } from "@lenso/ui/command";
import { createCommandController } from "@ui-sdk/react/command";
import { Kbd } from "@lenso/ui/kbd";

const commands = ["Open file", "Create project", "Settings"];
export function CommandStory({ disabled = false }: { disabled?: boolean }) {
  const [lastCommand, setLastCommand] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [controller] = useState(createCommandController);
  return (
    <div {...stylex.props(styles.root)}>
      <Command controller={controller} value={active} onValueChange={setActive}>
        <Command.Header>
          <Command.InputGroup>
            <Command.SearchIcon />
            <Command.Input aria-label="Find a command" placeholder="Find a command…" />
            <button type="button" onClick={() => controller.setQuery("")}>
              Clear
            </button>
          </Command.InputGroup>
        </Command.Header>
        <Command.SectionLabel>Workspace</Command.SectionLabel>
        <Command.Viewport>
          <Command.Empty>No matching commands.</Command.Empty>
          <Command.List>
            {commands.map((command) => (
              <Command.Item
                key={command}
                value={command}
                disabled={disabled}
                onSelect={() => setLastCommand(command)}
              >
                <Command.ItemContent>
                  <Command.ItemText>{command}</Command.ItemText>
                </Command.ItemContent>
              </Command.Item>
            ))}
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
