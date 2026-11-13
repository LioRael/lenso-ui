import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Modal,
  AlertDialog,
  Drawer,
  Popover,
  Tooltip,
  Menu,
  ContextMenu,
  Select,
  ComboBox,
  Autocomplete,
  Button,
  ThemeScope,
} from "@lenso/ui";
import { ProfileDialog, ReadingDrawer } from "../src/demos/shared/presentation-panels";
import { Basic as AuditDatePicker } from "../src/demos/en/date-picker/basic";
import { Basic as AuditRangePicker } from "../src/demos/en/date-range-picker/basic";
import { Basic as AuditColorPicker } from "../src/demos/en/color-picker/basic";
import { Command } from "@lenso/ui/command";
import { ActionSheetStory } from "../src/stories/action-sheet-demo";

function AnchoredChoices({ prefix }: { prefix: string }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
      <Popover>
        <Popover.Trigger render={<Button />}>{prefix} popover</Popover.Trigger>
        <Popover.Content>
          <Popover.Arrow />
          <Popover.Title>{prefix} details</Popover.Title>
          <Popover.Description>Anchored material and arrow.</Popover.Description>
          <Popover.Close>Close {prefix} details</Popover.Close>
        </Popover.Content>
      </Popover>
      <Tooltip delay={0}>
        <Tooltip.Trigger render={<Button />}>{prefix} help</Tooltip.Trigger>
        <Tooltip.Content>
          <Tooltip.Arrow />
          {prefix} help text
        </Tooltip.Content>
      </Tooltip>
      <Menu morphTrigger={false}>
        <Menu.Trigger render={<Button />}>{prefix} menu</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>Copy {prefix}</Menu.Item>
          <Menu.Sub>
            <Menu.SubTrigger>More {prefix}</Menu.SubTrigger>
            <Menu.SubContent>
              <Menu.Item>Archive {prefix}</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
        </Menu.Content>
      </Menu>
      <Select defaultValue="red" morphTrigger={false}>
        <Select.Trigger aria-label={`${prefix} select`}>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Content>
          <Select.List>
            <Select.Item value="red">Red</Select.Item>
            <Select.Item value="blue">Blue</Select.Item>
          </Select.List>
        </Select.Content>
      </Select>
      <ComboBox>
        <ComboBox.InputGroup>
          <ComboBox.Input aria-label={`${prefix} combo`} />
          <ComboBox.Trigger aria-label={`Show ${prefix} combo`}>
            <ComboBox.Indicator />
          </ComboBox.Trigger>
        </ComboBox.InputGroup>
        <ComboBox.Content>
          <ComboBox.List>
            <ComboBox.Item value="red">Red</ComboBox.Item>
            <ComboBox.Item value="blue">Blue</ComboBox.Item>
          </ComboBox.List>
        </ComboBox.Content>
      </ComboBox>
      <Autocomplete>
        <Autocomplete.InputGroup>
          <Autocomplete.Input aria-label={`${prefix} autocomplete`} />
          <Autocomplete.Trigger aria-label={`Show ${prefix} suggestions`}>
            <Autocomplete.Indicator />
          </Autocomplete.Trigger>
        </Autocomplete.InputGroup>
        <Autocomplete.Content>
          <Autocomplete.List>
            <Autocomplete.Item value="Red">Red</Autocomplete.Item>
            <Autocomplete.Item value="Blue">Blue</Autocomplete.Item>
          </Autocomplete.List>
        </Autocomplete.Content>
      </Autocomplete>
    </div>
  );
}
function Audit() {
  const [dark, setDark] = useState(false);
  return (
    <ThemeScope theme={dark ? "dark" : "light"}>
      <main
        style={{
          padding: 24,
          minHeight: "100vh",
          background: "var(--lenso-background-primary)",
          color: "var(--lenso-label-primary)",
        }}
      >
        <h1>Overlay migration audit</h1>
        <label>
          <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />
          Dark audit
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, paddingBlock: 24 }}>
          <ProfileDialog />
          <ReadingDrawer />
          <ActionSheetStory placement="bottom" />
          <AlertDialog>
            <AlertDialog.Trigger render={<Button />}>Audit confirmation</AlertDialog.Trigger>
            <AlertDialog.Backdrop />
            <AlertDialog.Content>
              <AlertDialog.Title>Confirm audit</AlertDialog.Title>
              <AlertDialog.Description>A response is required.</AlertDialog.Description>
              <AlertDialog.Action variant="cancel">Keep audit</AlertDialog.Action>
              <AlertDialog.Action>Confirm audit action</AlertDialog.Action>
            </AlertDialog.Content>
          </AlertDialog>
          <Modal>
            <Modal.Trigger render={<Button />}>Nested audit</Modal.Trigger>
            <Modal.Backdrop />
            <Modal.Content>
              <Modal.Title>Nested audit</Modal.Title>
              <Modal.Body>
                <AnchoredChoices prefix="Nested" />
                <Modal>
                  <Modal.Trigger render={<Button />}>Child dialog</Modal.Trigger>
                  <Modal.Backdrop />
                  <Modal.Content>
                    <Modal.Title>Child audit</Modal.Title>
                    <Modal.Close>Close child audit</Modal.Close>
                  </Modal.Content>
                </Modal>
              </Modal.Body>
              <Modal.Footer>
                <Modal.Close>Close nested audit</Modal.Close>
              </Modal.Footer>
            </Modal.Content>
          </Modal>
          <Modal scroll="outside">
            <Modal.Trigger render={<Button />}>Outside scroll audit</Modal.Trigger>
            <Modal.Backdrop />
            <Modal.Content>
              <Modal.Title>Outside scroll audit</Modal.Title>
              <Modal.Body>
                {Array.from({ length: 35 }, (_, i) => (
                  <p key={i}>Scrollable audit paragraph {i + 1}.</p>
                ))}
              </Modal.Body>
              <Modal.Close>Close outside audit</Modal.Close>
            </Modal.Content>
          </Modal>
          {(["left", "right", "top", "bottom"] as const).map((side) => (
            <Drawer key={side} side={side}>
              <Drawer.Trigger render={<Button />}>Audit {side} drawer</Drawer.Trigger>
              <Drawer.Backdrop />
              <Drawer.Content>
                <Drawer.Title>{side} audit panel</Drawer.Title>
                <Drawer.Close>Close {side} audit</Drawer.Close>
              </Drawer.Content>
            </Drawer>
          ))}
        </div>
        <AnchoredChoices prefix="Page" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 24 }}>
          <section aria-label="Date picker audit">
            <AuditDatePicker />
          </section>
          <section aria-label="Range picker audit">
            <AuditRangePicker />
          </section>
          <section aria-label="Color picker audit">
            <AuditColorPicker />
          </section>
        </div>
        <Modal>
          <Modal.Trigger render={<Button />}>Audit command palette</Modal.Trigger>
          <Command.Backdrop />
          <Command.Content contentProps={{ "aria-label": "Audit command palette" }}>
            <Command.Header>
              <Command.InputGroup>
                <Command.Input
                  aria-label="Audit command search"
                  placeholder="Search audit actions…"
                />
              </Command.InputGroup>
            </Command.Header>
            <Command.List>
              <Command.Item value="open">Open audit file</Command.Item>
              <Command.Item value="settings">Audit settings</Command.Item>
            </Command.List>
          </Command.Content>
        </Modal>
        <ContextMenu>
          <ContextMenu.Trigger
            style={{ marginTop: 24, padding: 24, border: "1px solid currentColor" }}
          >
            Audit context target
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            <ContextMenu.Item>Inspect audit target</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu>
      </main>
    </ThemeScope>
  );
}
export function mount(host: HTMLElement) {
  const root = createRoot(host);
  root.render(<Audit />);
  return () => root.unmount();
}
