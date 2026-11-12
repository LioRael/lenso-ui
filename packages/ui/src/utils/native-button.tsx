"use client";

import { Button as SdkButton } from "@ui-sdk/react/button";
import { useCallback, type ComponentProps, type Ref } from "react";
import { slotRender } from "./sdk-render.js";
import { assignRef } from "./interaction/ref.js";

export type NativeButtonProps = Omit<ComponentProps<typeof SdkButton>, "ref"> & {
  ref?: Ref<HTMLElement>;
  "data-slot"?: unknown;
};

export function NativeButton({
  ref,
  render,
  "data-slot": slot = "button",
  ...props
}: NativeButtonProps) {
  const elementRef = useCallback((node: HTMLButtonElement | null) => assignRef(ref, node), [ref]);
  return <SdkButton {...props} ref={elementRef} render={slotRender("button", slot, render)} />;
}
