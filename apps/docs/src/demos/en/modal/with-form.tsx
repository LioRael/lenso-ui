"use client";
// Adapted from HeroUI v3.2.6 modal-with-form (Apache-2.0).
import { Envelope } from "@gravity-ui/icons";
import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, Input, Label, Modal, Surface, TextField } from "@lenso/ui";

const styles = stylex.create({
  popup: { maxWidth: 448 },
  icon: { backgroundColor: "var(--accent-soft)", color: "var(--accent-soft-foreground)" },
  envelope: { width: 20, height: 20 },
  caption: { marginTop: 6, fontSize: 14, lineHeight: "20px", color: "var(--muted)" },
  body: { padding: 24 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  field: { width: "100%" },
});

export function WithForm() {
  const formId = useId();
  const [open, setOpen] = useState(false);
  return (
    <Modal open={open} onOpenChange={setOpen}>
      <Modal.Trigger render={<Button variant="secondary" />}>Open Contact Form</Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Viewport>
          <Modal.Popup placement="auto" xstyle={styles.popup}>
            <Modal.Close aria-label="Close dialog" />
            <Modal.Header>
              <Modal.Icon xstyle={styles.icon}>
                <Envelope {...stylex.props(styles.envelope)} />
              </Modal.Icon>
              <Modal.Title>Contact Us</Modal.Title>
              <Modal.Description xstyle={styles.caption}>
                Fill out the form below and we&apos;ll get back to you. The modal adapts
                automatically when the keyboard appears on mobile.
              </Modal.Description>
            </Modal.Header>
            <Modal.Body xstyle={styles.body}>
              <Surface variant="default">
                <form
                  id={formId}
                  {...stylex.props(styles.form)}
                  onSubmit={(event) => {
                    event.preventDefault();
                    setOpen(false);
                  }}
                >
                  <TextField name="name" xstyle={styles.field}>
                    <Label>Name</Label>
                    <Input type="text" variant="secondary" placeholder="Enter your name" />
                  </TextField>
                  <TextField name="email" xstyle={styles.field}>
                    <Label>Email</Label>
                    <Input type="email" variant="secondary" placeholder="Enter your email" />
                  </TextField>
                  <TextField name="phone" xstyle={styles.field}>
                    <Label>Phone</Label>
                    <Input type="tel" variant="secondary" placeholder="Enter your phone number" />
                  </TextField>
                  <TextField name="company" xstyle={styles.field}>
                    <Label>Company</Label>
                    <Input variant="secondary" placeholder="Enter your company name" />
                  </TextField>
                  <TextField name="message" xstyle={styles.field}>
                    <Label>Message</Label>
                    <Input variant="secondary" placeholder="Enter your message" />
                  </TextField>
                </form>
              </Surface>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close render={<Button variant="secondary" />}>Cancel</Modal.Close>
              <Button type="submit" form={formId}>
                Send Message
              </Button>
            </Modal.Footer>
          </Modal.Popup>
        </Modal.Viewport>
      </Modal.Portal>
    </Modal>
  );
}
