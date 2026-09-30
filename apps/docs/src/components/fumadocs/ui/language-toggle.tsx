"use client";

import { Globe } from "@gravity-ui/icons";
import { Dropdown } from "@lenso/ui";
import { useRouter } from "next/navigation";
import { notebook } from "@/styles/notebook.stylex";
import type { Locale } from "@/lib/source";

export function LanguageToggle({ locale, slug }: { locale: Locale; slug: string }) {
  const router = useRouter();
  return (
    <Dropdown.Root>
      <Dropdown.Trigger aria-label="Change language" xstyle={notebook.iconButton}>
        <Globe width={16} height={16} aria-hidden="true" />
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Positioner sideOffset={8} align="end">
          <Dropdown.Popup xstyle={notebook.menu}>
            <Dropdown.RadioGroup
              value={locale}
              onValueChange={(value) => router.push(`/${value}/docs/${slug}`)}
            >
              <Dropdown.RadioItem value="en" xstyle={notebook.menuItem}>
                English
              </Dropdown.RadioItem>
              <Dropdown.RadioItem value="cn" xstyle={notebook.menuItem}>
                中文
              </Dropdown.RadioItem>
            </Dropdown.RadioGroup>
          </Dropdown.Popup>
        </Dropdown.Positioner>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}
