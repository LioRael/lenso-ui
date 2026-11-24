import { createComponent, merge, type ComponentProps } from "solid-js";
import { Calendar } from "./calendar.js";
import { rangeCalendarStyles } from "@lenso/tokens/range-calendar";

export type RangeCalendarProps = Omit<ComponentProps<typeof Calendar.Root>, "mode">;

export function RangeCalendarRoot(props: RangeCalendarProps) {
  return createComponent(
    Calendar.Root,
    merge(props, {
      mode: "range" as const,
      get xstyle() {
        return [rangeCalendarStyles.root, props.xstyle];
      },
    }),
  );
}

export const RangeCalendar: typeof RangeCalendarRoot &
  Omit<typeof Calendar, "Root"> & {
    Root: typeof RangeCalendarRoot;
  } = Object.assign(RangeCalendarRoot, Calendar, { Root: RangeCalendarRoot });
