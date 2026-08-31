"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { SettingsRow } from "@lenso/ui/settings-row";
import { Switch } from "@lenso/ui/switch";

import {
  SettingsGroup,
  SettingsSection,
} from "../../../../registry/source/recipes/settings-section";
import styles from "./settings-page.module.css";

function mergeClassName(generated?: string, className?: string): string {
  return [generated, className].filter(Boolean).join(" ");
}

export interface SettingsPageProps extends React.ComponentPropsWithoutRef<"main"> {
  as?: "div" | "main";
  description?: string;
  idPrefix?: string;
  title?: string;
}

export const SettingsPage = React.forwardRef<HTMLElement, SettingsPageProps>(function SettingsPage(
  {
    as = "main",
    className,
    description = "Choose how this workspace looks, notifies you, and behaves on this device.",
    idPrefix,
    title = "Preferences",
    ...props
  },
  ref,
) {
  const generatedId = React.useId().replaceAll(":", "");
  const prefix = idPrefix ?? `settings-page-${generatedId}`;
  const titleId = `${prefix}-title`;
  const appearanceTitleId = `${prefix}-appearance-title`;
  const notificationsTitleId = `${prefix}-notifications-title`;
  const summariesTitleId = `${prefix}-summaries-title`;

  const content = (
    <>
      <div className={styles.content}>
        <header className={styles.pageHeader}>
          <h1 id={titleId}>{title}</h1>
          <p>{description}</p>
        </header>

        <SettingsSection.Root aria-labelledby={appearanceTitleId}>
          <SettingsSection.Header>
            <SettingsSection.Title id={appearanceTitleId}>Appearance</SettingsSection.Title>
            <SettingsSection.Description>
              Keep display preferences local to the person and device that chose them.
            </SettingsSection.Description>
          </SettingsSection.Header>
          <SettingsGroup>
            <SettingsRow.Root>
              <SettingsRow.Copy>
                <SettingsRow.Label>Follow system theme</SettingsRow.Label>
                <SettingsRow.Description>
                  Match the operating system light or dark appearance.
                </SettingsRow.Description>
              </SettingsRow.Copy>
              <SettingsRow.Control>
                {({ controlId, disabled, labelId, visualState }) => (
                  <Switch.Root
                    aria-labelledby={labelId}
                    data-visual-state={visualState}
                    defaultChecked
                    disabled={disabled}
                    id={controlId}
                  >
                    <Switch.Thumb />
                  </Switch.Root>
                )}
              </SettingsRow.Control>
            </SettingsRow.Root>
            <SettingsRow.Root>
              <SettingsRow.Copy>
                <SettingsRow.Label>Reduce interface motion</SettingsRow.Label>
                <SettingsRow.Description>
                  Prefer transitions that do not rely on large movement.
                </SettingsRow.Description>
              </SettingsRow.Copy>
              <SettingsRow.Control>
                {({ controlId, disabled, labelId, visualState }) => (
                  <Switch.Root
                    aria-labelledby={labelId}
                    data-visual-state={visualState}
                    disabled={disabled}
                    id={controlId}
                  >
                    <Switch.Thumb />
                  </Switch.Root>
                )}
              </SettingsRow.Control>
            </SettingsRow.Root>
          </SettingsGroup>
        </SettingsSection.Root>

        <SettingsSection.Root aria-labelledby={notificationsTitleId}>
          <SettingsSection.Header>
            <SettingsSection.Title id={notificationsTitleId}>Notifications</SettingsSection.Title>
            <SettingsSection.Description>
              Product code owns delivery channels, persistence, and permission prompts.
            </SettingsSection.Description>
          </SettingsSection.Header>
          <SettingsSection.Group>
            <SettingsRow.Root>
              <SettingsRow.Copy>
                <SettingsRow.Label>Product updates</SettingsRow.Label>
                <SettingsRow.Description>
                  Receive occasional notes about meaningful changes.
                </SettingsRow.Description>
              </SettingsRow.Copy>
              <SettingsRow.Control>
                {({ controlId, disabled, labelId, visualState }) => (
                  <Switch.Root
                    aria-labelledby={labelId}
                    data-visual-state={visualState}
                    defaultChecked
                    disabled={disabled}
                    id={controlId}
                  >
                    <Switch.Thumb />
                  </Switch.Root>
                )}
              </SettingsRow.Control>
            </SettingsRow.Root>
            <SettingsRow.Root>
              <SettingsRow.Copy>
                <SettingsRow.Title id={summariesTitleId}>Activity summaries</SettingsRow.Title>
                <SettingsRow.Description>
                  Bundle lower-priority activity into a concise summary.
                </SettingsRow.Description>
              </SettingsRow.Copy>
              <SettingsRow.Control>
                <Button variant="secondary">Configure</Button>
              </SettingsRow.Control>
            </SettingsRow.Root>
          </SettingsSection.Group>
        </SettingsSection.Root>
      </div>
    </>
  );

  const rootProps = {
    ...props,
    "aria-labelledby": titleId,
    className: mergeClassName(styles.root, className),
    "data-slot": "settings-page-template",
  };

  return as === "div" ? (
    <div {...rootProps} ref={ref as React.ForwardedRef<HTMLDivElement>}>
      {content}
    </div>
  ) : (
    <main {...rootProps} ref={ref}>
      {content}
    </main>
  );
});
