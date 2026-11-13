"use client";
import { usePlaygroundLog } from "../../shared/playground-log";

import { Button } from "@lenso/ui";

export function Basic() {
  const log = usePlaygroundLog();
  return <Button onClick={() => log("Button pressed")}>Click me</Button>;
}
