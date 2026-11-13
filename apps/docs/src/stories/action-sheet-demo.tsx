"use client";
import { useState } from "react";
import { ActionSheet, Button } from "@lenso/ui";

export function ActionSheetStory({
  placement = "center",
  dim = true,
  message = true,
  destructive = true,
}: {
  placement?: "auto" | "bottom" | "center";
  dim?: boolean;
  message?: boolean;
  destructive?: boolean;
}) {
  const [result, setResult] = useState("");
  return (
    <>
      <ActionSheet dim={dim}>
        <ActionSheet.Trigger render={<Button />}>Photo actions</ActionSheet.Trigger>
        <ActionSheet.Backdrop />
        <ActionSheet.Content placement={placement}>
          <ActionSheet.Header>
            <ActionSheet.Title>Manage this photo</ActionSheet.Title>
            {message && (
              <ActionSheet.Description>Choose what to do with this photo.</ActionSheet.Description>
            )}
          </ActionSheet.Header>
          <ActionSheet.Actions>
            <ActionSheet.Action
              destructive={destructive}
              onClick={() => setResult("Removed from album")}
            >
              Remove from album
            </ActionSheet.Action>
            <ActionSheet.Action onClick={() => setResult("Photo duplicated")}>
              Duplicate
            </ActionSheet.Action>
            <ActionSheet.Close>Cancel</ActionSheet.Close>
          </ActionSheet.Actions>
        </ActionSheet.Content>
      </ActionSheet>
      <output aria-live="polite">{result}</output>
    </>
  );
}
