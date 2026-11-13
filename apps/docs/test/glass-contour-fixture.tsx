import { useState, type ComponentProps } from "react";
import { createRoot } from "react-dom/client";
import {
  ActionSheet,
  AlertDialog,
  Button,
  Glass,
  GlassButton,
  Sheet,
  TextArea,
  ThemeScope,
  Toast,
  createToaster,
} from "@lenso/ui";
import "../src/styles/global.css";

function Example({ theme }: { theme: "light" | "dark" }) {
  const [large, setLarge] = useState(false);
  const [snap, setSnap] = useState<ComponentProps<typeof Sheet>["snapPoint"]>(0.5);
  const [toaster] = useState(() => createToaster());
  const shape = {
    width: large ? 240 : 120,
    height: large ? 90 : 50,
    borderRadius: large ? 14 : 25,
    transition: "width 240ms linear, height 240ms linear, border-radius 240ms linear",
  };
  return (
    <ThemeScope theme={theme}>
      <main style={{ padding: 60, display: "grid", gap: 24, justifyItems: "start" }}>
        <Button onClick={() => setLarge(!large)}>Change geometry</Button>
        <GlassButton elastic={false} data-contour-case="button" style={shape}>
          Glass control
        </GlassButton>
        <TextArea glass data-contour-case="textarea" aria-label="Glass editor" style={shape} />
        <Glass data-contour-case="glass" style={shape}>
          Glass surface
        </Glass>
        <Button onClick={() => toaster({ title: "Contour toast", duration: Infinity })}>
          Show toast
        </Button>
        <Toast.Region toaster={toaster}>
          {() => (
            <Toast.Root
              variant="pill"
              data-contour-case="toast"
              style={{ borderRadius: large ? 14 : 20 }}
            >
              <div style={{ width: large ? 240 : 120, height: large ? 90 : 40 }}>
                <Toast.Title />
              </div>
              <Toast.Close aria-label="Dismiss contour toast" />
            </Toast.Root>
          )}
        </Toast.Region>
        <AlertDialog>
          <AlertDialog.Trigger render={<Button />}>Open alert</AlertDialog.Trigger>
          <AlertDialog.Backdrop />
          <AlertDialog.Content aria-label="Contour alert">
            <AlertDialog.Title>Contour alert</AlertDialog.Title>
            <AlertDialog.Description>
              Check the compact glass surface during entry and exit.
            </AlertDialog.Description>
            <AlertDialog.Action variant="cancel">Close alert</AlertDialog.Action>
          </AlertDialog.Content>
        </AlertDialog>
        <ActionSheet>
          <ActionSheet.Trigger render={<Button />}>Open actions</ActionSheet.Trigger>
          <ActionSheet.Backdrop />
          <ActionSheet.Content aria-label="Contour actions">
            <ActionSheet.Title>Contour actions</ActionSheet.Title>
            <ActionSheet.Close>Close actions</ActionSheet.Close>
          </ActionSheet.Content>
        </ActionSheet>
        <Sheet
          snapPoints={[0.5, 1]}
          edgeAttachedSnapPoints={[1]}
          snapPoint={snap}
          onSnapPointChange={setSnap}
        >
          <Sheet.Trigger render={<Button />}>Open sheet</Sheet.Trigger>
          <Sheet.Content aria-label="Contour sheet">
            <Sheet.Header>
              <Sheet.Title>Contour sheet</Sheet.Title>
            </Sheet.Header>
            <Sheet.Body>
              <Button onClick={() => setSnap(snap === 1 ? 0.5 : 1)}>Change detent</Button>
            </Sheet.Body>
            <Sheet.Close>Close sheet</Sheet.Close>
          </Sheet.Content>
        </Sheet>
      </main>
    </ThemeScope>
  );
}

export function mount(host: HTMLElement, theme: "light" | "dark") {
  const root = createRoot(host);
  root.render(<Example theme={theme} />);
  return () => root.unmount();
}
