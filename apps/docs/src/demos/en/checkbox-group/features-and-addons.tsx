"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Bell, Comment, Envelope } from "@gravity-ui/icons";
import { Checkbox, CheckboxGroup, TextField } from "@lenso/ui";
import { labelStyles } from "@lenso/tokens/label";
import { descriptionStyles } from "@lenso/tokens/description";
import { useId } from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  wrapper: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    gap: "2.5rem",
    paddingInline: "1rem",
    paddingBlock: "2rem",
  },
  section: {
    display: "flex",
    width: "100%",
    minWidth: "320px",
    flexDirection: "column",
    gap: "1rem",
  },
  items: { display: "flex", flexDirection: "column", gap: ".5rem" },
  content: {
    position: "relative",
    display: "flex",
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: "1rem",
    borderRadius: "1.5rem",
    backgroundColor: {
      default: "var(--surface)",
      ":is([data-checked] *)": "color-mix(in oklab, var(--accent) 10%, transparent)",
    },
    paddingInline: "1.25rem",
    paddingBlock: "1rem",
    transition: {
      default: "background-color 150ms ease",
      "@media (prefers-reduced-motion: reduce)": "none",
    },
  },
  control: {
    position: "absolute",
    insetInlineEnd: "1rem",
    top: ".75rem",
    width: "1.25rem",
    height: "1.25rem",
    borderRadius: "9999px",
    "::before": { borderRadius: "9999px" },
  },
  icon: { width: "1.25rem", height: "1.25rem", color: "var(--accent-soft-foreground)" },
  copy: { display: "flex", flexDirection: "column", gap: ".25rem" },
});
export function FeaturesAndAddOns() {
  const labelId = useId();
  const addOns = [
    {
      description: "Receive updates via email",
      icon: Envelope,
      title: "Email Notifications",
      value: "email",
    },
    {
      description: "Get instant SMS notifications",
      icon: Comment,
      title: "SMS Alerts",
      value: "sms",
    },
    {
      description: "Browser and mobile push alerts",
      icon: Bell,
      title: "Push Notifications",
      value: "push",
    },
  ];
  return (
    <div {...stylex.props(styles.wrapper)}>
      <section {...stylex.props(styles.section)}>
        <TextField name="notification-preferences">
          <CheckboxGroup aria-labelledby={labelId} aria-describedby={`${labelId}-help`}>
            <span id={labelId} {...stylex.props(labelStyles.label)}>
              Notification preferences
            </span>
            <span id={`${labelId}-help`} {...stylex.props(descriptionStyles.description)}>
              Choose how you want to receive updates
            </span>
            <div {...stylex.props(styles.items)}>
              {addOns.map((addon) => (
                <Checkbox
                  key={addon.value}
                  value={addon.value}
                  variant="secondary"
                  aria-label={addon.title}
                  aria-describedby={`${labelId}-${addon.value}`}
                >
                  <Checkbox.Content xstyle={styles.content}>
                    <Checkbox.Control xstyle={styles.control}>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <addon.icon {...stylex.props(styles.icon)} aria-hidden="true" />
                    <div {...stylex.props(styles.copy)}>
                      <span>{addon.title}</span>
                      <span
                        id={`${labelId}-${addon.value}`}
                        {...stylex.props(descriptionStyles.description)}
                      >
                        {addon.description}
                      </span>
                    </div>
                  </Checkbox.Content>
                </Checkbox>
              ))}
            </div>
          </CheckboxGroup>
        </TextField>
      </section>
    </div>
  );
}
