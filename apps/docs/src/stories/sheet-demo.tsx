"use client";

import { useState } from "react";
import { createDrawerController } from "@ui-sdk/core/drawer";
import { Button, GlassButton, Sheet } from "@lenso/ui";
import { IconChevronDown, IconChevronUp } from "@lenso/ui/icons";

export function SheetStory({
  detent = "medium",
  dim = true,
  grabber = true,
  threeStage = true,
}: {
  detent?: "small" | "medium" | "large";
  dim?: boolean;
  grabber?: boolean;
  threeStage?: boolean;
}) {
  return (
    <SheetExample
      key={`${detent}-${threeStage}`}
      detent={detent}
      dim={dim}
      grabber={grabber}
      threeStage={threeStage}
    />
  );
}

function SheetExample({
  detent,
  dim,
  grabber,
  threeStage,
}: {
  detent: "small" | "medium" | "large";
  dim: boolean;
  grabber: boolean;
  threeStage: boolean;
}) {
  const [snapPoint, setSnapPoint] = useState<React.ComponentProps<typeof Sheet>["snapPoint"]>(
    detent === "large" ? 1 : detent === "small" && threeStage ? 0.25 : 0.525,
  );
  const [controller] = useState(() => createDrawerController());
  const expanded = snapPoint === 1;
  return (
    <Sheet
      dim={dim}
      snapPoints={threeStage ? [0.25, 0.525, 1] : undefined}
      edgeAttachedSnapPoints={threeStage ? [0.25, 1] : undefined}
      controller={controller}
      defaultSnapPoint={detent === "large" ? 1 : detent === "small" && threeStage ? 0.25 : 0.525}
      onSnapPointChange={setSnapPoint}
    >
      <Sheet.Trigger render={<Button />}>Open sheet</Sheet.Trigger>
      <Sheet.Backdrop />
      <Sheet.Content>
        {grabber && <Sheet.Handle />}
        <Sheet.Header>
          <Sheet.Close />
          <Sheet.Title>Details</Sheet.Title>
          <GlassButton
            isIconOnly
            variant="prominent"
            style={{ width: 44, height: 44 }}
            aria-label={expanded ? "Collapse sheet" : "Expand sheet"}
            icon={expanded ? <IconChevronDown /> : <IconChevronUp />}
            onClick={() =>
              controller.setSnapPoint(
                threeStage
                  ? snapPoint === 0.25
                    ? 0.525
                    : expanded
                      ? 0.25
                      : 1
                  : expanded
                    ? 0.525
                    : 1,
              )
            }
          />
        </Sheet.Header>
        <Sheet.Body>
          <Sheet.Description>
            Review the details here, then close the sheet to return to your work.
          </Sheet.Description>
        </Sheet.Body>
      </Sheet.Content>
    </Sheet>
  );
}
