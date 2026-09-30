"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Button, Spinner } from "@lenso/ui";
export function Loading() {
  return (
    <Button isLoading>
      <Spinner color="current" size="sm" />
      Uploading...
    </Button>
  );
}
