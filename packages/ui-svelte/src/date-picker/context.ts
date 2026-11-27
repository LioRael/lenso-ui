import type { DatePickerController } from "@ui-sdk/svelte/date-picker";
import { createOptionalContext } from "../context.js";
export const [getController, setController] = createOptionalContext<() => DatePickerController>();
