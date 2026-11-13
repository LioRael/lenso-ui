"use client";
import { useId, type ComponentProps } from "react";
import { Autocomplete, TextField, FieldError } from "@lenso/ui";
import { styles } from "./_native";
export function TextSuggestions({
  label,
  options,
  placeholder,
  description,
  ...props
}: Omit<ComponentProps<typeof Autocomplete>, "children" | "items"> & {
  label: string;
  options: string[];
  placeholder?: string;
  description?: string;
}) {
  const id = useId();
  return (
    <TextField xstyle={[styles.field, props.fullWidth && styles.wide]}>
      <Autocomplete {...props}>
        <Autocomplete.Label htmlFor={id}>{label}</Autocomplete.Label>
        <Autocomplete.InputGroup>
          <Autocomplete.Input id={id} placeholder={placeholder} />
          <Autocomplete.Clear aria-label={`Clear ${label}`} />
          <Autocomplete.Trigger aria-label={`Show ${label} suggestions`}>
            <Autocomplete.Indicator />
          </Autocomplete.Trigger>
        </Autocomplete.InputGroup>
        <Autocomplete.Content>
          <Autocomplete.Empty>No suggestions</Autocomplete.Empty>
          <Autocomplete.List>
            {options.map((value) => (
              <Autocomplete.Item key={value} value={value}>
                {value}
              </Autocomplete.Item>
            ))}
          </Autocomplete.List>
        </Autocomplete.Content>
      </Autocomplete>
      {description && <TextField.Description>{description}</TextField.Description>}
      <FieldError />
    </TextField>
  );
}
