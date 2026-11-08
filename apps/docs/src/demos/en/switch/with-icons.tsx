"use client";
import {
  BellFill,
  BellSlash,
  Check,
  Microphone,
  MicrophoneSlash,
  Moon,
  Power,
  Sun,
  VolumeFill,
  VolumeSlashFill,
} from "@gravity-ui/icons";
import { Switch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { display: "flex", gap: ".75rem" },
  icon: { width: ".75rem", height: ".75rem", color: "inherit", opacity: 1 },
  offIcon: { opacity: 0.7 },
  green: {
    backgroundColor: "color-mix(in srgb, var(--lenso-system-green) 80%, transparent)",
  },
  red: {
    backgroundColor: "color-mix(in srgb, var(--lenso-system-red) 80%, transparent)",
  },
  purple: {
    backgroundColor: "color-mix(in srgb, var(--lenso-system-purple) 80%, transparent)",
  },
  blue: {
    backgroundColor: "color-mix(in srgb, var(--lenso-system-blue) 80%, transparent)",
  },
});
const icons = {
  check: { off: Power, on: Check, selectedControl: styles.green },
  darkMode: { off: Moon, on: Sun, selectedControl: undefined },
  microphone: { off: Microphone, on: MicrophoneSlash, selectedControl: styles.red },
  notification: { off: BellSlash, on: BellFill, selectedControl: styles.purple },
  volume: { off: VolumeFill, on: VolumeSlashFill, selectedControl: styles.blue },
};
export function WithIcons() {
  return (
    <div {...stylex.props(styles.root)}>
      {Object.entries(icons).map(([key, value]) => (
        <Switch
          key={key}
          defaultChecked
          aria-label={key}
          size="lg"
          render={(props, { checked }) => (
            <span {...props}>
              <Switch.Content>
                <Switch.Control xstyle={checked && value.selectedControl}>
                  <Switch.Thumb>
                    <Switch.Icon>
                      {checked ? (
                        <value.on {...stylex.props(styles.icon)} aria-hidden="true" />
                      ) : (
                        <value.off
                          {...stylex.props(styles.icon, styles.offIcon)}
                          aria-hidden="true"
                        />
                      )}
                    </Switch.Icon>
                  </Switch.Thumb>
                </Switch.Control>
              </Switch.Content>
            </span>
          )}
        />
      ))}
    </div>
  );
}
