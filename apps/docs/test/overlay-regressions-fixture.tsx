import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ActionSheet,
  AlertDialog,
  Popover,
  Tooltip,
  Toast,
  createToaster,
  Command,
  Modal,
  Button,
  ThemeScope,
} from "@lenso/ui";
import { DevStyleX } from "../src/components/dev-stylex";
import "../src/styles/global.css";
function Examples() {
  const [dark, setDark] = useState(false);
  const [toaster] = useState(() => createToaster());
  return (
    <ThemeScope theme={dark ? "dark" : "light"}>
      <DevStyleX />
      <main
        style={{
          minHeight: "100vh",
          padding: 32,
          background: dark ? "#242428" : "#e7eaf1",
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
          alignContent: "start",
        }}
      >
        <label>
          <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />
          Dark
        </label>
        <ActionSheet>
          <ActionSheet.Trigger render={<Button />}>Open actions</ActionSheet.Trigger>
          <ActionSheet.Backdrop />
          <ActionSheet.Content>
            <ActionSheet.Title>Actions</ActionSheet.Title>
            <ActionSheet.Action>Save file</ActionSheet.Action>
            <ActionSheet.Close>Cancel</ActionSheet.Close>
          </ActionSheet.Content>
        </ActionSheet>
        <AlertDialog>
          <AlertDialog.Trigger render={<Button />}>Open alert</AlertDialog.Trigger>
          <AlertDialog.Backdrop />
          <AlertDialog.Content>
            <AlertDialog.Title>Alert</AlertDialog.Title>
            <AlertDialog.Description>
              Material should be visible on the first frame.
            </AlertDialog.Description>
            <AlertDialog.Action variant="cancel">Close alert</AlertDialog.Action>
          </AlertDialog.Content>
        </AlertDialog>
        <Popover>
          <Popover.Trigger render={<Button />}>Open popover</Popover.Trigger>
          <Popover.Content>
            <Popover.Title>Popover</Popover.Title>
            <Popover.Arrow />
            <Popover.Close>Close popover</Popover.Close>
          </Popover.Content>
        </Popover>
        <Tooltip delay={0}>
          <Tooltip.Trigger render={<Button />}>Tooltip anchor</Tooltip.Trigger>
          <Tooltip.Content>
            Tooltip material
            <Tooltip.Arrow />
          </Tooltip.Content>
        </Tooltip>
        <Button
          onClick={() =>
            toaster({
              title: "Bottom spacing",
              description: "Sixteen pixels above the safe area",
              duration: Infinity,
            })
          }
        >
          Show toast
        </Button>
        <Toast.Region toaster={toaster} />
        <Modal>
          <Modal.Trigger render={<Button />}>Open command</Modal.Trigger>
          <Modal.Backdrop />
          <Command.Content>
            <Command.Header>
              <Command.Input aria-label="Search commands" placeholder="Search commands" />
            </Command.Header>
            <Command.List>
              <Command.Item value="save">Save file</Command.Item>
              <Command.Item value="open">Open file</Command.Item>
            </Command.List>
          </Command.Content>
        </Modal>
      </main>
    </ThemeScope>
  );
}
export function mount(host: HTMLElement) {
  const root = createRoot(host);
  root.render(<Examples />);
  return () => root.unmount();
}
