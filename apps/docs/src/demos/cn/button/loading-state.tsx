// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
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
      {isLoading ? "上传中…" : "上传文件"}
    </Button>
  );
}
