import { useState } from "react";
import { createRoot } from "react-dom/client";
import { AlertDialog, Button, Drawer, Modal, Sheet, ThemeScope } from "@lenso/ui";
import { ProfileDialog, ReadingDrawer } from "../src/demos/shared/presentation-panels";
import { ActionSheetStory } from "../src/stories/action-sheet-demo";
import "../src/styles/global.css";

export function mount(
  host: HTMLElement,
  theme: "light" | "dark",
  direction: "ltr" | "rtl" = "ltr",
) {
  const root = createRoot(host);
  root.render(
    <ThemeScope theme={theme} dir={direction}>
      <main style={{ padding: 24, display: "flex", flexWrap: "wrap", gap: 16 }}>
        <ProfileDialog />
        <ReadingDrawer />
        <ActionSheetStory />
        <Modal>
          <Modal.Trigger render={<Button />}>Full-screen content</Modal.Trigger>
          <Modal.Backdrop />
          <Modal.Content size="full" style={{ padding: 0, backgroundColor: "rgb(17 23 31)" }}>
            <Modal.Title>Full-screen content</Modal.Title>
            <Modal.Close>Close full screen</Modal.Close>
          </Modal.Content>
        </Modal>
        {(["left", "top", "bottom"] as const).map((side) => (
          <Drawer key={side} side={side}>
            <Drawer.Trigger render={<Button />}>{side} panel</Drawer.Trigger>
            <Drawer.Backdrop />
            <Drawer.Content>
              <Drawer.Layout>
                <Drawer.Header>
                  <Drawer.Title>{side} panel</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                  <p>Existing directional presentations remain available.</p>
                </Drawer.Body>
                <Drawer.Footer>
                  <Drawer.Close>Close panel</Drawer.Close>
                </Drawer.Footer>
              </Drawer.Layout>
            </Drawer.Content>
          </Drawer>
        ))}
        <Modal>
          <Modal.Trigger render={<Button />}>Long content</Modal.Trigger>
          <Modal.Backdrop />
          <Modal.Content>
            <Modal.Close aria-label="Close long content" />
            <Modal.Header>
              <Modal.Title>Long content</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {Array.from({ length: 60 }, (_, i) => (
                <p key={i}>Scrollable paragraph {i + 1}.</p>
              ))}
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close>Done reading</Modal.Close>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
        <AlertDialog>
          <AlertDialog.Trigger render={<Button />}>Confirm deletion</AlertDialog.Trigger>
          <AlertDialog.Backdrop />
          <AlertDialog.Content>
            <AlertDialog.Header>
              <AlertDialog.Title>Delete note?</AlertDialog.Title>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <AlertDialog.Description>This decision requires a response.</AlertDialog.Description>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <AlertDialog.Action variant="cancel">Keep note</AlertDialog.Action>
              <AlertDialog.Action variant="destructive">Delete</AlertDialog.Action>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog>
        <MaterialStateSheet />
      </main>
    </ThemeScope>,
  );
  return () => root.unmount();
}

function MaterialStateSheet() {
  const [expanded, setExpanded] = useState(false);
  return (
    <Sheet
      snapPoints={[0.5, 1]}
      snapPoint={expanded ? 1 : 0.5}
      onSnapPointChange={(point) => setExpanded(point === 1)}
    >
      <Sheet.Trigger render={<Button />}>Bottom sheet</Sheet.Trigger>
      <Sheet.Backdrop />
      <Sheet.Content>
        <Sheet.Header>
          <Sheet.Title>Bottom sheet</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Body>
          Sheet retains its own surface, drag and snap presentation.
          <Button onClick={() => setExpanded(true)}>Expand sheet</Button>
        </Sheet.Body>
      </Sheet.Content>
    </Sheet>
  );
}
