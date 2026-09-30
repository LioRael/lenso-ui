"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Paperclip } from "@gravity-ui/icons";
import { Button, Spinner } from "@lenso/ui";
import { useEffect, useRef, useState } from "react";
export function LoadingState() {
  const [isLoading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <Button
      isLoading={isLoading}
      onClick={() => {
        setLoading(true);
        timer.current = setTimeout(() => setLoading(false), 2000);
      }}
    >
      {isLoading ? (
        <Spinner color="current" size="sm" />
      ) : (
        <Button.Icon>
          <Paperclip />
        </Button.Icon>
      )}
      {isLoading ? "Uploading..." : "Upload File"}
    </Button>
  );
}
