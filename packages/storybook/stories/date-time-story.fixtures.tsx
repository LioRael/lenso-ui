/**
 * Date/time story support adapted from HeroUI v3.2.6, commit
 * e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
 * Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0
 * Gravity UI icons: Copyright YANDEX LLC, MIT; see GRAVITY-ICONS-LICENSE.txt.
 */
import type { Decorator } from "@storybook/react-vite";
import type { FormEvent, ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { I18nProvider, isRTL } from "react-aria-components/I18nProvider";
import { descriptionStyles } from "@lenso/tokens/description";
import { dateTimeStoryStyles as s } from "./date-time-story.stylex";

export const dateTimeStoryLocale: Decorator = (Story) => {
  const locale = new URLSearchParams(window.location.search).get("dateTimeLocale");
  return locale ? (
    <I18nProvider locale={locale}>
      <div dir={isRTL(locale) ? "rtl" : "ltr"}>
        <Story />
      </div>
    </I18nProvider>
  ) : (
    <Story />
  );
};

/** Capture actual browser serialization before the source's simulated request resets the model. */
export function dateTimeStorySubmission(event: FormEvent<HTMLFormElement>) {
  event.currentTarget.dataset["submitted"] = JSON.stringify(
    Object.fromEntries(new FormData(event.currentTarget)),
  );
  event.currentTarget.dataset["submissionCount"] = String(
    Number(event.currentTarget.dataset["submissionCount"] ?? 0) + 1,
  );
}

export function DateTimeStoryValue({ children }: { children: ReactNode }) {
  return <p {...stylex.props(descriptionStyles.description)}>{children}</p>;
}

export function DateTimeStoryIcon({
  name,
  muted = true,
}: {
  name: "calendar" | "clock" | "chevron-down" | "circle-question";
  muted?: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="currentColor"
      {...stylex.props(s.icon, muted && s.muted)}
    >
      {name === "chevron-down" ? (
        <path
          fillRule="evenodd"
          d="M2.97 5.47a.75.75 0 0 1 1.06 0L8 9.44l3.97-3.97a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 0-1.06"
          clipRule="evenodd"
        />
      ) : name === "clock" ? (
        <path
          fillRule="evenodd"
          d="M13.5 8a5.5 5.5 0 1 1-11 0a5.5 5.5 0 0 1 11 0M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0M8.75 4.5a.75.75 0 0 0-1.5 0V8a.75.75 0 0 0 .3.6l2 1.5a.75.75 0 1 0 .9-1.2l-1.7-1.275z"
          clipRule="evenodd"
        />
      ) : name === "calendar" ? (
        <path
          fillRule="evenodd"
          d="M5.25 5.497a.75.75 0 0 1-.75-.75V4A1.5 1.5 0 0 0 3 5.5v1h10v-1A1.5 1.5 0 0 0 11.5 4v.75a.75.75 0 0 1-1.5 0V4H6v.747a.75.75 0 0 1-.75.75M10 2.5H6v-.752a.75.75 0 1 0-1.5 0V2.5a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3v-.75a.75.75 0 0 0-1.5 0zM3 8v3.5A1.5 1.5 0 0 0 4.5 13h7a1.5 1.5 0 0 0 1.5-1.5V8z"
          clipRule="evenodd"
        />
      ) : (
        <path
          fillRule="evenodd"
          d="M8 13.5a5.5 5.5 0 1 0 0-11a5.5 5.5 0 0 0 0 11M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14M6.44 4.54c.43-.354.994-.565 1.56-.565c1.217 0 2.34.82 2.34 2.14c0 .377-.078.745-.298 1.1c-.208.339-.513.614-.875.867c-.217.153-.325.257-.379.328c-.038.052-.038.07-.038.089a.75.75 0 0 1-1.5 0c0-.794.544-1.286 1.057-1.645c.28-.196.4-.332.458-.426a.54.54 0 0 0 .075-.312c0-.3-.244-.641-.84-.641a1 1 0 0 0-.608.223c-.167.138-.231.287-.231.418a.75.75 0 0 1-1.5 0c0-.674.345-1.22.78-1.577M8 12a1 1 0 1 0 0-2a1 1 0 0 0 0 2"
          clipRule="evenodd"
        />
      )}
    </svg>
  );
}
