"use client";
import { Input, type InputProps } from "@lenso/ui";
import { useDataEngine } from "@fumari/stf";
import { s } from "./materials.stylex";
export interface InputStoryProps {
  value: string;
  placeholder?: InputProps["placeholder"];
  disabled?: InputProps["disabled"];
  readOnly?: InputProps["readOnly"];
  elastic?: InputProps["elastic"];
  glass?: InputProps["glass"];
}
export function InputStory({ value, ...props }: InputStoryProps) {
  const engine = useDataEngine();
  return (
    <Input
      {...props}
      value={value}
      aria-label="Sample input"
      xstyle={s.field}
      onValueChange={(next) => engine.update(["value"], next)}
    />
  );
}
