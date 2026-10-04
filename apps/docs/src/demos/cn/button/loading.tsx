// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Button, Spinner } from "@lenso/ui";
export function Loading() {
  return (
    <Button isLoading>
      <Spinner color="current" size="sm" />
      上传中…
    </Button>
  );
}
