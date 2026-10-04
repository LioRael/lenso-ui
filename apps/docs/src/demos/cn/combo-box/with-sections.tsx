// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6, Apache-2.0. Native grouped collection filters without losing section semantics.
import { ComboBox } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
import { styles } from "../../en/combo-box/styles.stylex";
import { useFocusMenu } from "../../en/combo-box/shared";
const regions = [
  {
    label: "北美洲",
    items: [
      {
        value: "usa",
        label: "美国",
      },
      {
        value: "canada",
        label: "加拿大",
      },
      {
        value: "mexico",
        label: "墨西哥",
      },
    ],
  },
  {
    label: "欧洲",
    items: [
      {
        value: "uk",
        label: "英国",
      },
      {
        value: "france",
        label: "法国",
      },
      {
        value: "germany",
        label: "德国",
      },
      {
        value: "spain",
        label: "西班牙",
      },
      {
        value: "italy",
        label: "意大利",
      },
    ],
  },
  {
    label: "亚洲",
    items: [
      {
        value: "japan",
        label: "日本",
      },
      {
        value: "china",
        label: "中国",
      },
      {
        value: "india",
        label: "印度",
      },
      {
        value: "south-korea",
        label: "韩国",
      },
    ],
  },
];
export function WithSections() {
  const id = useId();
  const menu = useFocusMenu();
  return (
    <div {...stylex.props(styles.field)}>
      <ComboBox {...menu.root} items={regions}>
        <ComboBox.Label htmlFor={id}>国家</ComboBox.Label>
        <ComboBox.InputGroup>
          <ComboBox.Input {...menu.input} id={id} placeholder="搜索国家…" />
          <ComboBox.Trigger aria-label="Show countries">
            <ComboBox.Indicator />
          </ComboBox.Trigger>
        </ComboBox.InputGroup>
        <ComboBox.Portal>
          <ComboBox.Positioner>
            <ComboBox.Popover>
              <ComboBox.List>
                {(region: (typeof regions)[number], index: number) => (
                  <ComboBox.Group key={region.label} items={region.items}>
                    {index > 0 && <ComboBox.Separator />}
                    <ComboBox.GroupLabel>{region.label}</ComboBox.GroupLabel>
                    <ComboBox.Collection>
                      {(country: (typeof region.items)[number]) => (
                        <ComboBox.Item key={country.value} value={country}>
                          {country.label}
                          <ComboBox.ItemIndicator />
                        </ComboBox.Item>
                      )}
                    </ComboBox.Collection>
                  </ComboBox.Group>
                )}
              </ComboBox.List>
            </ComboBox.Popover>
          </ComboBox.Positioner>
        </ComboBox.Portal>
      </ComboBox>
    </div>
  );
}
