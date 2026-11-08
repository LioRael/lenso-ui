"use client";
import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, Drawer, Fieldset, Form, Label, Modal, Switch, TextField } from "@lenso/ui";

const styles = stylex.create({
  sections: { display: "flex", flexDirection: "column", gap: 24 },
  status: { margin: 0, fontSize: 15, lineHeight: "20px", color: "var(--lenso-label-secondary)" },
});

export function ProfileDialog({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [profile, setProfile] = useState({ name: "Alex", email: "alex@example.com" });
  const [saved, setSaved] = useState(false);
  const formId = useId();
  return (
    <>
      <Modal open={open} onOpenChange={setOpen}>
        <Modal.Trigger render={<Button />}>Edit profile</Modal.Trigger>
        <Modal.Portal>
          <Modal.Backdrop />
          <Modal.Viewport>
            <Modal.Popup>
              <Modal.Close aria-label="Close profile" />
              <Modal.Header>
                <Modal.Title>Edit profile</Modal.Title>
                <Modal.Description>Update your name and contact email.</Modal.Description>
              </Modal.Header>
              <Modal.Body>
                <Form
                  id={formId}
                  onSubmit={(event) => {
                    event.preventDefault();
                    const data = new FormData(event.currentTarget);
                    setProfile({
                      name: String(data.get("name")),
                      email: String(data.get("email")),
                    });
                    setSaved(true);
                    setOpen(false);
                  }}
                >
                  <Fieldset aria-label="Profile details">
                    <Fieldset.Group>
                      <TextField name="name">
                        <TextField.Label>Name</TextField.Label>
                        <TextField.Input defaultValue={profile.name} required autoComplete="name" />
                      </TextField>
                      <TextField name="email">
                        <TextField.Label>Email</TextField.Label>
                        <TextField.Input
                          type="email"
                          defaultValue={profile.email}
                          required
                          autoComplete="email"
                        />
                      </TextField>
                    </Fieldset.Group>
                  </Fieldset>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Modal.Close render={<Button size="lg" variant="bordered" />}>Cancel</Modal.Close>
                <Button size="lg" variant="prominent" type="submit" form={formId}>
                  Save changes
                </Button>
              </Modal.Footer>
            </Modal.Popup>
          </Modal.Viewport>
        </Modal.Portal>
      </Modal>
      {saved && <output {...stylex.props(styles.status)}>Profile saved for {profile.name}.</output>}
    </>
  );
}

function PreferenceRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <Fieldset.Row>
      <Label htmlFor={id}>{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange}>
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Content>
      </Switch>
    </Fieldset.Row>
  );
}

export function ReadingDrawer({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [comfortable, setComfortable] = useState(true);
  const [images, setImages] = useState(true);
  const [digest, setDigest] = useState(false);
  return (
    <Drawer.Provider>
      <Drawer swipeDirection="right" defaultOpen={defaultOpen}>
        <Drawer.Trigger render={<Button />}>Reading preferences</Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup>
              <Drawer.Content>
                <Drawer.Close aria-label="Close preferences" />
                <Drawer.Header>
                  <Drawer.Title>Reading preferences</Drawer.Title>
                  <Drawer.Description>
                    Adjust how articles appear in your library.
                  </Drawer.Description>
                </Drawer.Header>
                <Drawer.Body>
                  <div {...stylex.props(styles.sections)}>
                    <Fieldset>
                      <Fieldset.Legend>Reading</Fieldset.Legend>
                      <Fieldset.Group>
                        <PreferenceRow
                          label="Comfortable spacing"
                          checked={comfortable}
                          onCheckedChange={setComfortable}
                        />
                        <PreferenceRow
                          label="Show images"
                          checked={images}
                          onCheckedChange={setImages}
                        />
                      </Fieldset.Group>
                    </Fieldset>
                    <Fieldset>
                      <Fieldset.Legend>Updates</Fieldset.Legend>
                      <Fieldset.Group>
                        <PreferenceRow
                          label="Email digest"
                          checked={digest}
                          onCheckedChange={setDigest}
                        />
                      </Fieldset.Group>
                    </Fieldset>
                  </div>
                </Drawer.Body>
                <Drawer.Footer>
                  <Button
                    size="lg"
                    variant="bordered"
                    onClick={() => {
                      setComfortable(true);
                      setImages(true);
                      setDigest(false);
                    }}
                  >
                    Reset
                  </Button>
                  <Drawer.Close render={<Button size="lg" variant="prominent" />}>
                    Done
                  </Drawer.Close>
                </Drawer.Footer>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer>
    </Drawer.Provider>
  );
}
