"use client";

import { useState } from "react";
import { Button, GlassButton, Sheet } from "@lenso/ui";
import { IconChevronDown, IconChevronUp } from "@lenso/ui/icons";

const snapPoints = [0.25, 0.525, 1];
const attachedSnapPoints = [0.25, 1];

export function Basic() {
  const [snapPoint, setSnapPoint] = useState<number | string | null>(0.25);
  const expanded = snapPoint === 1;
  return (
    <Sheet
      snapPoints={snapPoints}
      edgeAttachedSnapPoints={attachedSnapPoints}
      snapPoint={snapPoint}
      onSnapPointChange={setSnapPoint}
    >
      <Sheet.Trigger render={<Button />}>Review changes</Sheet.Trigger>
      <Sheet.Portal>
        <Sheet.Backdrop forceRender />
        <Sheet.Viewport>
          <Sheet.Popup>
            <Sheet.Handle />
            <Sheet.Header>
              <Sheet.Close />
              <Sheet.Title>Review changes</Sheet.Title>
              <GlassButton
                isIconOnly
                variant="prominent"
                style={{ width: 44, height: 44 }}
                aria-label={expanded ? "Collapse sheet" : "Expand sheet"}
                icon={expanded ? <IconChevronDown /> : <IconChevronUp />}
                onClick={() => setSnapPoint(snapPoint === 0.25 ? 0.525 : expanded ? 0.25 : 1)}
              />
            </Sheet.Header>
            <Sheet.Body>
              <Sheet.Description>
                Drag the header between the attached low sheet, floating middle sheet, and
                full-height sheet.
              </Sheet.Description>
            </Sheet.Body>
            <Sheet.Footer>
              <Sheet.Close render={<Button variant="prominent" />}>Done</Sheet.Close>
            </Sheet.Footer>
          </Sheet.Popup>
        </Sheet.Viewport>
      </Sheet.Portal>
    </Sheet>
  );
}
