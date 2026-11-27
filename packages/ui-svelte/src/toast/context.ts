import type { ToastData } from "@ui-sdk/svelte/toast";
import type { Snippet } from "svelte";
import { createOptionalContext } from "../context.js";

export type ToastContentValue = string | Snippet;
export type ToastTone = "default" | "accent" | "success" | "warning" | "danger";
export type ToastVariant = ToastTone | "glass" | "pill";
export const [getToastData, setToastData] =
  createOptionalContext<() => ToastData<ToastContentValue>>();
export const [getToastAppearance, setToastAppearance] = createOptionalContext<{
  pill: () => boolean;
  tone: () => ToastTone;
}>();
