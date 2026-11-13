"use client";

import { Check, Globe } from "@gravity-ui/icons";
import { GlassButton } from "@lenso/ui/glass-button";
import { Menu } from "@lenso/ui/menu";
import Link from "fumadocs-core/link";
import type { DocumentationLocale } from "./document-model";
import { headerControls as s } from "@lenso/docs/presentation";
import { useDocumentationMessages } from "./i18n";

export function DocumentationLanguageToggle({
  locale,
  alternates,
}: {
  locale: string;
  alternates: readonly (DocumentationLocale & { url: string })[];
}) {
  const messages = useDocumentationMessages(locale);
  if (alternates.length < 2) return null;
  return (
    <Menu.Root morphTrigger={false}>
      <Menu.Trigger
        render={<GlassButton variant="default" isIconOnly size="sm" xstyle={[s.control, s.icon]} />}
        aria-label={messages.changeLanguage}
      >
        <Globe width={16} height={16} aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Content sideOffset={8} align="end" aria-label={messages.changeLanguage}>
        <Menu.RadioGroup value={locale}>
          {alternates.map((alternate) => (
            <Menu.RadioItem
              key={alternate.code}
              value={alternate.code}
              closeOnSelect
              render={<Link href={alternate.url} hrefLang={alternate.language} />}
            >
              <Menu.ItemIndicator>
                <Check width={16} height={16} aria-hidden="true" />
              </Menu.ItemIndicator>
              {alternate.label}
            </Menu.RadioItem>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}
