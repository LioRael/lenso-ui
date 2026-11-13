"use client";
// Copyright NextUI Inc. Apache-2.0. Modified for Lenso.
import {
  createContext,
  use,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
  type ComponentProps,
} from "react";
import {
  Collapsible,
  createCollapsibleController,
  type CollapsibleController,
} from "@ui-sdk/react/collapsible";
import { useNativeCalendarState } from "../../utils/calendar-state.js";
export interface YearPickerContextValue {
  isYearPickerOpen: boolean;
  setIsYearPickerOpen: CollapsibleController["setOpen"];
  controller: CollapsibleController;
  calendarRef: RefObject<HTMLDivElement | null>;
  calendarGridSlot: "calendar-grid" | "range-calendar-grid";
}
export const YearPickerContext = createContext<YearPickerContextValue | null>(null);
export function useYearPicker() {
  const context = use(YearPickerContext);
  if (!context) throw new Error("Year picker requires Calendar or RangeCalendar");
  return context;
}
export const useCalendarOrRangeState = useNativeCalendarState;
export type YearPickerOptions = {
  isYearPickerOpen?: boolean | undefined;
  defaultYearPickerOpen?: boolean | undefined;
  onYearPickerOpenChange?: ComponentProps<typeof Collapsible>["onOpenChange"];
};
export function YearPickerProvider({
  children,
  isYearPickerOpen,
  defaultYearPickerOpen = false,
  onYearPickerOpenChange,
  range = false,
  disabled = false,
  label = "Calendar",
}: YearPickerOptions & {
  children: ReactNode;
  range?: boolean;
  disabled?: boolean;
  label?: string;
}) {
  const [controller] = useState(createCollapsibleController);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  return (
    <Collapsible
      aria-label={`${label} year picker`}
      disabled={disabled}
      open={isYearPickerOpen}
      defaultOpen={isYearPickerOpen === undefined ? defaultYearPickerOpen : undefined}
      onOpenChange={onYearPickerOpenChange}
      controller={controller}
      style={{ display: "contents" }}
    >
      {(state) => (
        <YearPickerContext
          value={{
            calendarRef,
            controller,
            calendarGridSlot: range ? "range-calendar-grid" : "calendar-grid",
            isYearPickerOpen: state.open,
            setIsYearPickerOpen: controller.setOpen,
          }}
        >
          {children}
        </YearPickerContext>
      )}
    </Collapsible>
  );
}
