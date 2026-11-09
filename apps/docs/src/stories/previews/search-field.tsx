"use client";
import { SearchField } from "@lenso/ui";
import { useDataEngine } from "@fumari/stf";
import type { InputStoryProps } from "./input";
import { s } from "./materials.stylex";
export type SearchFieldStoryProps = Omit<InputStoryProps, "elastic" | "glass">;
export function SearchFieldStory({
  value,
  placeholder,
  disabled,
  readOnly,
}: SearchFieldStoryProps) {
  const engine = useDataEngine();
  return (
    <SearchField disabled={disabled} xstyle={s.field}>
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input
          value={value}
          placeholder={placeholder}
          readOnly={readOnly}
          aria-label="Search"
          onValueChange={(next) => engine.update(["value"], next)}
        />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}
