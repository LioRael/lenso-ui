"use client";

import { Globe } from "@gravity-ui/icons";
import { Menu } from "@lenso/ui";
import { useRouter } from "next/navigation";
import { notebook } from "@/styles/notebook.stylex";
import type { Locale } from "@/lib/source";

export function LanguageToggle({ locale, slug }: { locale: Locale; slug: string }) {
  const router = useRouter();
  return (
    <Menu.Root>
      <Menu.Trigger aria-label="Change language" xstyle={notebook.iconButton}>
        <Globe width={16} height={16} aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={8} align="end">
          <Menu.Popup xstyle={notebook.menu}>
            <Menu.RadioGroup
              value={locale}
              onValueChange={(value) => router.push(`/${value}/docs/${slug}`)}
            >
              <Menu.RadioItem value="en" xstyle={notebook.menuItem}>
                English
              </Menu.RadioItem>
              <Menu.RadioItem value="cn" xstyle={notebook.menuItem}>
                中文
              </Menu.RadioItem>
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
