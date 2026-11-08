"use client";
import { Button, Spinner } from "@lenso/ui";
export function Loading() {
  return (
    <Button isLoading>
      <Spinner color="current" size="sm" />
      Uploading...
    </Button>
  );
}
