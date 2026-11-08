import { createRoot } from "react-dom/client";
import { Menu, Select, GlassButton, ThemeScope } from "@lenso/ui";
import { Default } from "../src/demos/cn/menu/default";
import "../src/styles/global.css";
export type CloseCase =
  | "cascade"
  | "demo"
  | "text"
  | "icon"
  | "select"
  | "menu-anchored"
  | "select-anchored"
  | "above";
export function mount(host: HTMLElement, kind: CloseCase, theme: "light" | "dark" = "light") {
  const root = createRoot(host);
  const choices = Array.from({ length: 12 }, (_, i) => ({
    value: String(i),
    label: `Action ${i + 1}`,
  }));
  const select = kind.startsWith("select");
  root.render(
    <ThemeScope theme={theme}>
      <main
        style={{
          paddingTop: kind === "above" ? 760 : 120,
          paddingInline: 40,
          minHeight: 1000,
          background: "linear-gradient(135deg,#3087be,#dbebe5)",
        }}
      >
        {kind === "demo" ? (
          <Default />
        ) : select ? (
          <Select defaultValue="5" items={choices} morphTrigger={kind !== "select-anchored"}>
            <Select.Trigger aria-label="Case select" style={{ width: 240, height: 44 }}>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner alignItemWithTrigger={kind === "select"}>
                <Select.Popover>
                  <Select.List>
                    {choices.map((c) => (
                      <Select.Item key={c.value} value={c.value}>
                        <Select.ItemText>{c.label}</Select.ItemText>
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popover>
              </Select.Positioner>
            </Select.Portal>
          </Select>
        ) : (
          <Menu morphTrigger={kind !== "menu-anchored"}>
            {kind === "icon" ? (
              <Menu.Trigger aria-label="Case menu" style={{ width: 44, height: 44 }} />
            ) : (
              <Menu.Trigger
                aria-label="Case menu"
                render={<GlassButton />}
                style={{ width: 140, height: 44 }}
              >
                Long actions
              </Menu.Trigger>
            )}
            <Menu.Portal>
              <Menu.Positioner side={kind === "above" ? "top" : "bottom"}>
                <Menu.Popup style={{ width: 250 }}>
                  {kind === "cascade" && (
                    <Menu.SubmenuRoot presentation="cascade">
                      <Menu.SubmenuTrigger>Nested actions</Menu.SubmenuTrigger>
                      <Menu.Portal>
                        <Menu.Positioner>
                          <Menu.Popup aria-label="Contour child">
                            {choices.map((c) => (
                              <Menu.Item key={c.value}>{c.label}</Menu.Item>
                            ))}
                          </Menu.Popup>
                        </Menu.Positioner>
                      </Menu.Portal>
                    </Menu.SubmenuRoot>
                  )}
                  {choices.map((c) => (
                    <Menu.Item key={c.value}>{c.label}</Menu.Item>
                  ))}
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu>
        )}
      </main>
    </ThemeScope>,
  );
  return () => root.unmount();
}
