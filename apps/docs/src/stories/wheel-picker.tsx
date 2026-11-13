"use client";
import { useState } from "react";
import { WheelPicker } from "@lenso/ui";
export interface WheelPickerStoryProps {
  disabled: boolean;
}
const hours = Array.from({ length: 24 }, (_, value) => ({
  value: String(value),
  label: `${value} ${value === 1 ? "hour" : "hours"}`,
}));
const minutes = Array.from({ length: 12 }, (_, value) => ({
  value: String(value * 5),
  label: `${value * 5} minutes`,
}));
export function WheelPickerStory({ disabled }: WheelPickerStoryProps) {
  const [hour, setHour] = useState("1");
  const [minute, setMinute] = useState("15");
  return (
    <div style={{ width: 360, maxWidth: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <WheelPicker
          aria-label="Hours"
          options={hours}
          value={hour}
          onValueChange={(next) => {
            if (next !== null) setHour(next);
          }}
          disabled={disabled}
        />
        <WheelPicker
          aria-label="Minutes"
          options={minutes}
          value={minute}
          onValueChange={(next) => {
            if (next !== null) setMinute(next);
          }}
          disabled={disabled}
        />
      </div>
      <output>
        Duration: {hour} hours, {minute} minutes
      </output>
    </div>
  );
}
