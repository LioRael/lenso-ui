"use client";

import { Globe } from "@gravity-ui/icons";
import { GlassButton, Menu } from "@lenso/ui";
import { useRouter } from "@tanstack/react-router";
import { headerControls as s } from "@/styles/header-controls.stylex";
import type { Locale } from "@/lib/source";

export function LanguageToggle({ locale, slug }: { locale: Locale; slug: string }) {
  const router = useRouter();
  return (
    <Menu.Root morphTrigger={false}>
      <Menu.Trigger
        render={<GlassButton variant="default" isIconOnly size="sm" xstyle={[s.control, s.icon]} />}
        aria-label="Change language"
      >
        <Globe width={16} height={16} aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={8} align="end">
          <Menu.Popup>
            <Menu.RadioGroup
              value={locale}
              onValueChange={(value) =>
                router.navigate({
                  to: slug === "" ? (value === "en" ? "/" : "/cn") : `/${value}/docs/${slug}`,
                })
              }
            >
              <Menu.RadioItem value="en">English</Menu.RadioItem>
              <Menu.RadioItem value="cn">中文</Menu.RadioItem>
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
