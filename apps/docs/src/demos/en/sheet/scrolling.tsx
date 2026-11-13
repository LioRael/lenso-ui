"use client";

import { useState } from "react";
import { createDrawerController } from "@ui-sdk/core/drawer";
import { Button, GlassButton, Sheet } from "@lenso/ui";
import { IconChevronDown, IconChevronUp } from "@lenso/ui/icons";

export function Scrolling() {
  const [snapPoint, setSnapPoint] = useState<React.ComponentProps<typeof Sheet>["snapPoint"]>(1);
  const [controller] = useState(() => createDrawerController());
  const expanded = snapPoint === 1;
  return (
    <Sheet controller={controller} defaultSnapPoint={1} onSnapPointChange={setSnapPoint}>
      <Sheet.Trigger render={<Button />}>Open notes</Sheet.Trigger>
      <Sheet.Backdrop />
      <Sheet.Content>
        <Sheet.Handle />
        <Sheet.Header>
          <Sheet.Close />
          <Sheet.Title>Notes</Sheet.Title>
          <GlassButton
            isIconOnly
            variant="prominent"
            style={{ width: 44, height: 44 }}
            aria-label={expanded ? "Collapse sheet" : "Expand sheet"}
            icon={expanded ? <IconChevronDown /> : <IconChevronUp />}
            onClick={() => controller.setSnapPoint(expanded ? 0.525 : 1)}
          />
        </Sheet.Header>
        <Sheet.Body>
          <Sheet.Description>
            Scroll through the notes without moving the header or footer.
          </Sheet.Description>
          {Array.from({ length: 40 }, (_, index) => (
            <p key={index}>Note {index + 1}</p>
          ))}
        </Sheet.Body>
        <Sheet.Footer>
          <Sheet.Close render={<Button variant="prominent" />}>Done</Sheet.Close>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet>
  );
}
