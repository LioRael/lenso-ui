// Minimal reproductions for the pinned invalid-group outline gap.
// HeroUI v3.2.6 source values/state, Apache-2.0; no compensating xstyle.
import { SearchField, NumberField, TextField, Label, FieldError } from "@lenso/ui";

export function FormWorkflowInvalidFixture() {
  return (
    <>
      <SearchField name="search" invalid>
        <Label>Search</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input value="ab" />
          <SearchField.ClearButton />
        </SearchField.Group>
        <FieldError match>Search query must be at least 3 characters</FieldError>
      </SearchField>
      <TextField name="quantity" invalid>
        <NumberField name="quantity" value={-5} min={0}>
          <Label>Quantity</Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input />
            <NumberField.IncrementButton />
          </NumberField.Group>
          <FieldError match>Quantity must be greater than or equal to 0</FieldError>
        </NumberField>
      </TextField>
    </>
  );
}
