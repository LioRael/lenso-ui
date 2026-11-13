import { createRoot } from "react-dom/client";
import { Menu, ThemeScope } from "@lenso/ui";
import { Default } from "../src/demos/cn/menu/default";
import "../src/styles/global.css";

export function mount(host: HTMLElement) {
  const root = createRoot(host);
  root.render(
    <ThemeScope theme="light">
      <main
        style={{
          padding: 48,
          background: "linear-gradient(135deg,#3087be,#dbebe5)",
          minHeight: 1000,
        }}
      >
        <section data-motion-case="text">
          <Default />
        </section>
        <section data-motion-case="icon" style={{ marginTop: 80 }}>
          <Menu>
            <Menu.Trigger aria-label="Tall icon" />
            <Menu.Content>
              {Array.from({ length: 12 }, (_, i) => (
                <Menu.Item key={i}>Action {i + 1}</Menu.Item>
              ))}
            </Menu.Content>
          </Menu>
        </section>
      </main>
    </ThemeScope>,
  );
  return () => root.unmount();
}
