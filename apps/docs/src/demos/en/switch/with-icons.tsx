"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
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
    backgroundColor: {
      default: "rgb(34 197 94 / .8)",
      ":is([data-slot='switch'][data-checked] *)": "rgb(34 197 94 / .8)",
      ":is([data-slot='switch'][data-checked]:hover *)": "rgb(34 197 94 / .8)",
      ":is([data-slot='switch'][data-checked]:active *)": "rgb(34 197 94 / .8)",
    },
  },
  red: {
    backgroundColor: {
      default: "rgb(239 68 68 / .8)",
      ":is([data-slot='switch'][data-checked] *)": "rgb(239 68 68 / .8)",
      ":is([data-slot='switch'][data-checked]:hover *)": "rgb(239 68 68 / .8)",
      ":is([data-slot='switch'][data-checked]:active *)": "rgb(239 68 68 / .8)",
    },
  },
  purple: {
    backgroundColor: {
      default: "rgb(168 85 247 / .8)",
      ":is([data-slot='switch'][data-checked] *)": "rgb(168 85 247 / .8)",
      ":is([data-slot='switch'][data-checked]:hover *)": "rgb(168 85 247 / .8)",
      ":is([data-slot='switch'][data-checked]:active *)": "rgb(168 85 247 / .8)",
    },
  },
  blue: {
    backgroundColor: {
      default: "rgb(59 130 246 / .8)",
      ":is([data-slot='switch'][data-checked] *)": "rgb(59 130 246 / .8)",
      ":is([data-slot='switch'][data-checked]:hover *)": "rgb(59 130 246 / .8)",
      ":is([data-slot='switch'][data-checked]:active *)": "rgb(59 130 246 / .8)",
    },
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
