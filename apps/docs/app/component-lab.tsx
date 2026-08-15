"use client";

import { DialRoot, DialTimeline, useDialKit, useDialTimeline } from "dialkit";

import { Sidebar } from "@lenso/primitives/sidebar";
import { Button } from "@lenso/ui/button";
import { Dialog } from "@lenso/ui/dialog";
import { Select } from "@lenso/ui/select";
import { TextField } from "@lenso/ui/text-field";
import { ThemeScope } from "@lenso/ui/theme-scope";

export function ComponentLab() {
  const lab = useDialKit(
    "Component Lab",
    {
      dark: false,
      previewGap: [24, 8, 64, 4],
      sidebarOpen: true,
    },
    { id: "lenso-component-lab" },
  );
  const timeline = useDialTimeline(
    "Dialog entrance",
    {
      popup: {
        at: 0,
        duration: 0.28,
        from: { opacity: 0, scale: 0.97, y: 8 },
        to: { opacity: 1, scale: 1, y: 0 },
        transition: { type: "spring", bounce: 0.12 },
      },
    },
    { autoplay: false, id: "dialog-entrance" },
  );

  return (
    <ThemeScope theme={lab.dark ? "dark" : "light"}>
      <div className="shell">
        <header className="hero">
          <div>
            <p className="eyebrow">Lenso UI · experimental 0.1</p>
            <h1>Product-grade parts, source when you need it.</h1>
            <p className="lede">
              Base UI behavior, StyleX output, an unbranded token contract, and the same canonical
              source for packages and the shadcn registry.
            </p>
          </div>
          <code>pnpm add @lenso/ui @lenso/tokens</code>
        </header>

        <main className="lab" style={{ gap: lab.previewGap }}>
          <section className="card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Foundation</p>
                <h2>Button</h2>
              </div>
              <span>Figma 27:56</span>
            </div>
            <div className="row">
              <Button>Continue</Button>
              <Button variant="secondary">Cancel</Button>
              <Button variant="ghost">More</Button>
              <Button variant="danger">Delete</Button>
              <Button loading>Saving</Button>
            </div>
          </section>

          <section className="card grid-two">
            <div>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Form</p>
                  <h2>Text Field</h2>
                </div>
                <span>Figma 30:42</span>
              </div>
              <TextField.Root>
                <TextField.Label>Workspace name</TextField.Label>
                <TextField.Control placeholder="Enter value" />
                <TextField.Description>Visible to your teammates.</TextField.Description>
              </TextField.Root>
            </div>
            <div>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Overlay</p>
                  <h2>Dialog</h2>
                </div>
                <span>Figma 245:804</span>
              </div>
              <Dialog.Root>
                <Dialog.Trigger render={<Button variant="secondary" />}>Open dialog</Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Backdrop />
                  <Dialog.Viewport>
                    <Dialog.Popup>
                      <Dialog.Title>Edit details</Dialog.Title>
                      <Dialog.Description>
                        The portal inherits the nearest Theme Scope by default.
                      </Dialog.Description>
                      <TextField.Root>
                        <TextField.Label>Field label</TextField.Label>
                        <TextField.Control placeholder="Enter value" />
                        <TextField.Description>Optional supporting text.</TextField.Description>
                      </TextField.Root>
                      <div className="dialog-actions">
                        <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
                        <Dialog.Close render={<Button />}>Save</Dialog.Close>
                      </div>
                      <Dialog.Close />
                    </Dialog.Popup>
                  </Dialog.Viewport>
                </Dialog.Portal>
              </Dialog.Root>
              <div
                className="motion-sample"
                style={{
                  opacity: timeline.popup.current.opacity,
                  transform: `translateY(${timeline.popup.current.y}px) scale(${timeline.popup.current.scale})`,
                }}
              >
                DialKit timeline preview
              </div>
              <Button onClick={() => timeline.replay()} variant="ghost">
                Replay entrance
              </Button>
            </div>
          </section>

          <section className="card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Selection</p>
                <h2>Select positioning</h2>
              </div>
              <span>Figma 224:518</span>
            </div>
            <div className="row">
              {(["popper", "item-aligned"] as const).map((position) => (
                <Select.Root
                  defaultValue="monday"
                  items={[
                    { label: "Sunday", value: "sunday" },
                    { label: "Monday", value: "monday" },
                    { label: "Tuesday", value: "tuesday" },
                    { label: "Wednesday", value: "wednesday" },
                    { label: "Thursday", value: "thursday" },
                  ]}
                  key={position}
                >
                  <Select.Trigger aria-label={`${position} weekday`}>
                    <Select.Value />
                    <Select.Icon />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Positioner position={position}>
                      <Select.Popup>
                        <Select.List>
                          {[
                            ["sunday", "Sunday"],
                            ["monday", "Monday"],
                            ["tuesday", "Tuesday"],
                            ["wednesday", "Wednesday"],
                            ["thursday", "Thursday"],
                          ].map(([value, label]) => (
                            <Select.Item key={value} value={value}>
                              <Select.ItemText>{label}</Select.ItemText>
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.List>
                      </Select.Popup>
                    </Select.Positioner>
                  </Select.Portal>
                </Select.Root>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Product primitive</p>
                <h2>Independent and nested sidebars</h2>
              </div>
              <span>Figma 375:189</span>
            </div>
            <Sidebar.Group className="sidebar-stage">
              <Sidebar.Root open={lab.sidebarOpen} side="left">
                <Sidebar.Trigger>Toggle navigation</Sidebar.Trigger>
                <Sidebar.Panel className="sidebar-panel">Left navigation</Sidebar.Panel>
              </Sidebar.Root>
              <Sidebar.Inset className="sidebar-inset">Product canvas</Sidebar.Inset>
              <Sidebar.Root defaultOpen side="right">
                <Sidebar.Trigger>Toggle inspector</Sidebar.Trigger>
                <Sidebar.Panel className="sidebar-panel">Right inspector</Sidebar.Panel>
              </Sidebar.Root>
            </Sidebar.Group>
          </section>
        </main>
      </div>
      <DialRoot defaultOpen={false} />
      <DialTimeline defaultOpen={false} />
    </ThemeScope>
  );
}
