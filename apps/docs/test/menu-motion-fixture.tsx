import { createRoot } from "react-dom/client";
import { Menu, Select, ThemeScope } from "@lenso/ui";
import "../src/styles/global.css";

function Fixture() {
  return (
    <ThemeScope theme="light">
      <main
        style={{
          padding: 48,
          minHeight: "100vh",
          background: "linear-gradient(135deg, #2878b4, #d3efea)",
          display: "grid",
          gap: 80,
          justifyItems: "center",
          alignContent: "start",
        }}
      >
        <h1>Menu motion regression</h1>
        <Menu morphTrigger={false} elastic={false}>
          <Menu.Trigger>Plain actions</Menu.Trigger>
          <Menu.Content>
            <Menu.Item>Parcel</Menu.Item>
            <Menu.Item>Freight</Menu.Item>
          </Menu.Content>
        </Menu>
        <Select
          morphTrigger={false}
          defaultValue="name"
          items={[
            { value: "name", label: "Name" },
            { value: "size", label: "Size" },
          ]}
        >
          <Select.Trigger aria-label="Plain sort">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Content alignItemWithTrigger={false}>
            <Select.List>
              <Select.Item value="name">
                <Select.ItemText>Name</Select.ItemText>
                <Select.ItemIndicator />
              </Select.Item>
              <Select.Item value="size">
                <Select.ItemText>Size</Select.ItemText>
                <Select.ItemIndicator />
              </Select.Item>
            </Select.List>
          </Select.Content>
        </Select>
      </main>
    </ThemeScope>
  );
}
export function mount(host: HTMLElement) {
  const root = createRoot(host);
  root.render(<Fixture />);
  return () => root.unmount();
}
