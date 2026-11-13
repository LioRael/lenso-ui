import { createRoot } from "react-dom/client";
import { useState } from "react";
import {
  Menu,
  Select,
  Modal,
  Popover,
  Tooltip,
  ComboBox,
  Autocomplete,
  DatePicker,
  ColorPicker,
  Sheet,
  Drawer,
  ActionSheet,
  AlertDialog,
  ThemeScope,
} from "@lenso/ui";

function Fixture() {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<"right" | "left" | "top" | "bottom">("right");
  const query = new URLSearchParams(location.search);
  return (
    <ThemeScope theme={query.get("theme") === "dark" ? "dark" : "light"}>
      <main
        style={{
          minHeight: "100vh",
          padding: 32,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 24,
          background: "linear-gradient(135deg,#2878b4,#d3efea 45%,#e7a7c9)",
        }}
      >
        <Menu open={open} onOpenChange={setOpen}>
          <Menu.Trigger aria-label="Visual actions" />
          <Menu.Content aria-label="Visual actions">
            <Menu.Item>Copy</Menu.Item>
            <Menu.Sub presentation={query.get("stack") === "true" ? "stacked" : "auto"}>
              <Menu.SubTrigger>Sort by</Menu.SubTrigger>
              <Menu.SubContent aria-label="Sort by">
                <Menu.Item>Name</Menu.Item>
                <Menu.Sub>
                  <Menu.SubTrigger>Advanced</Menu.SubTrigger>
                  <Menu.SubContent aria-label="Advanced">
                    <Menu.Item>Date</Menu.Item>
                  </Menu.SubContent>
                </Menu.Sub>
              </Menu.SubContent>
            </Menu.Sub>
          </Menu.Content>
        </Menu>
        <button onClick={() => setOpen(false)}>Close externally</button>
        <Select
          defaultValue="name"
          items={[
            { value: "name", label: "Name" },
            { value: "date", label: "Date" },
          ]}
        >
          <Select.Trigger aria-label="Visual select">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Content>
            <Select.List>
              <Select.Item value="name">
                <Select.ItemText>Name</Select.ItemText>
                <Select.ItemIndicator />
              </Select.Item>
              <Select.Item value="date">
                <Select.ItemText>Date</Select.ItemText>
                <Select.ItemIndicator />
              </Select.Item>
            </Select.List>
          </Select.Content>
        </Select>
        <ComboBox>
          <ComboBox.Label>Country</ComboBox.Label>
          <ComboBox.Input />
          <ComboBox.Trigger aria-label="Show countries" />
          <ComboBox.Content>
            <ComboBox.List>
              <ComboBox.Item value="Japan">Japan</ComboBox.Item>
            </ComboBox.List>
          </ComboBox.Content>
        </ComboBox>
        <Autocomplete>
          <Autocomplete.Label>City</Autocomplete.Label>
          <Autocomplete.Input />
          <Autocomplete.Content>
            <Autocomplete.List>
              <Autocomplete.Item value="Paris">Paris</Autocomplete.Item>
            </Autocomplete.List>
          </Autocomplete.Content>
        </Autocomplete>
        <DatePicker>
          <DatePicker.Trigger aria-label="Open dates">Dates</DatePicker.Trigger>
          <DatePicker.Popover>
            <DatePicker.Dialog>Calendar</DatePicker.Dialog>
          </DatePicker.Popover>
        </DatePicker>
        <ColorPicker>
          <ColorPicker.Trigger>Open colors</ColorPicker.Trigger>
          <ColorPicker.Popover>
            <ColorPicker.Dialog>Colors</ColorPicker.Dialog>
          </ColorPicker.Popover>
        </ColorPicker>
        <Popover>
          <Popover.Trigger>Details</Popover.Trigger>
          <Popover.Content>
            <Popover.Title>Details panel</Popover.Title>
            <Popover.Close>Close details</Popover.Close>
          </Popover.Content>
        </Popover>
        <Tooltip delay={0}>
          <Tooltip.Trigger>Help</Tooltip.Trigger>
          <Tooltip.Content>Helpful text</Tooltip.Content>
        </Tooltip>
        <Modal>
          <Modal.Trigger>Open modal</Modal.Trigger>
          <Modal.Backdrop />
          <Modal.Content keepMounted>
            <Modal.Title>Modal panel</Modal.Title>
            <Modal.Close>Close modal</Modal.Close>
          </Modal.Content>
        </Modal>
        <Modal>
          <Modal.Trigger>Open full modal</Modal.Trigger>
          <Modal.Content size="full">
            <Modal.Title>Full modal</Modal.Title>
            <Modal.Close>Close full modal</Modal.Close>
          </Modal.Content>
        </Modal>
        <Sheet snapPoints={[0.5, 1]} defaultSnapPoint={0.5}>
          <Sheet.Trigger>Open sheet</Sheet.Trigger>
          <Sheet.Backdrop />
          <Sheet.Content>
            <Sheet.Title>Parent sheet</Sheet.Title>
            <Sheet.Close aria-label="Close sheet" />
            <Sheet>
              <Sheet.Trigger>Nested sheet</Sheet.Trigger>
              <Sheet.Backdrop />
              <Sheet.Content>
                <Sheet.Title>Child sheet</Sheet.Title>
                <Sheet.Close aria-label="Close child sheet" />
              </Sheet.Content>
            </Sheet>
          </Sheet.Content>
        </Sheet>
        <select
          aria-label="Drawer side"
          value={side}
          onChange={(event) => {
            const value = event.target.value;
            if (value === "right" || value === "left" || value === "top" || value === "bottom")
              setSide(value);
          }}
        >
          {["right", "left", "top", "bottom"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <Drawer side={side}>
          <Drawer.Trigger>Open drawer</Drawer.Trigger>
          <Drawer.Backdrop />
          <Drawer.Content>
            <Drawer.Title>Drawer panel</Drawer.Title>
            <Drawer.Close>Close drawer</Drawer.Close>
          </Drawer.Content>
        </Drawer>
        <ActionSheet>
          <ActionSheet.Trigger>Open actions</ActionSheet.Trigger>
          <ActionSheet.Backdrop />
          <ActionSheet.Content>
            <ActionSheet.Title>Action panel</ActionSheet.Title>
            <ActionSheet.Close>Cancel actions</ActionSheet.Close>
          </ActionSheet.Content>
        </ActionSheet>
        <AlertDialog>
          <AlertDialog.Trigger>Open alert</AlertDialog.Trigger>
          <AlertDialog.Backdrop />
          <AlertDialog.Content size="lg">
            <AlertDialog.Title>Alert panel</AlertDialog.Title>
            <AlertDialog.Action variant="cancel">Cancel alert</AlertDialog.Action>
          </AlertDialog.Content>
        </AlertDialog>
      </main>
    </ThemeScope>
  );
}
createRoot(document.getElementById("fixture")!).render(<Fixture />);
