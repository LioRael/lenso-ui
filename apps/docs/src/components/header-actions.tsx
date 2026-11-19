"use client";

import * as stylex from "@stylexjs/stylex";
import { LogoGithub } from "@gravity-ui/icons";
import { GlassButton } from "@lenso/ui";
import type { Locale } from "@/lib/source";
import { headerControls as s } from "@/styles/header-controls.stylex";
import { DocsThemePicker } from "./docs-theme-picker";
import { ThemeToggle } from "./fumadocs/ui/theme-toggle";

export function AppearanceControls({ locale }: { locale: Locale }) {
  return (
    <fieldset aria-label={locale === "cn" ? "外观" : "Appearance"} {...stylex.props(s.appearance)}>
      <DocsThemePicker locale={locale} />
      <ThemeToggle />
    </fieldset>
  );
}

export function RepositoryControl({ repository }: { repository: string }) {
  return (
    <GlassButton
      // The render prop creates a real anchor; override Base Button’s default role.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="link"
      variant="default"
      isIconOnly
      render={<a href={repository} aria-label="Lenso UI on GitHub" />}
      xstyle={[s.control, s.icon, s.link]}
    >
      <LogoGithub width={16} height={16} aria-hidden="true" />
    </GlassButton>
  );
}
