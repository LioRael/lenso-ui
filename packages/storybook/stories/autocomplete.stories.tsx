/**
 * HeroUI v3.2.6 autocomplete stories, e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
 * Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
 * Modified: native popup input, values/chips, async cancellation and StyleX.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Autocomplete, Surface } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useMemo, useState } from "react";
import { SearchPicker, SelectionStack, SelectionForm } from "./selection.fixtures";
import {
  autocompleteAnimals,
  states,
  controlledStates,
  countries,
  groupedCountries,
  requiredCountries,
  disabledAnimals,
  options,
  users,
  cities,
  tags,
  recipients,
  generateUsers,
} from "./selection-data.fixtures";
import { selectionStyles as s } from "./selection.stylex";

const meta = {
  component: Autocomplete,
  title: "Components/Pickers/Autocomplete",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Autocomplete>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => (
    <SearchPicker popupSearch items={autocompleteAnimals} placeholder="Select an animal" />
  ),
};
export const WithClearButton: Story = {
  render: () => (
    <SearchPicker popupSearch clear items={autocompleteAnimals} placeholder="Select an animal" />
  ),
};
function ClearCallback() {
  const [count, setCount] = useState(0);
  const [last, setLast] = useState("");
  const [selected, setSelected] = useState("");
  return (
    <SelectionStack>
      <SearchPicker
        popupSearch
        clear
        items={autocompleteAnimals}
        placeholder="Select an animal"
        onSelection={(items) => setSelected(items[0]?.name ?? "")}
        onClear={() => {
          setCount((previous) => previous + 1);
          setLast(new Date().toLocaleTimeString());
        }}
      />
      <div {...stylex.props(s.callback)}>
        <p>onClear Callback Info:</p>
        <p>Clear button clicked: {count} time(s)</p>
        {last && <p>Last cleared at: {last}</p>}
        {selected ? (
          <p>
            Currently selected: <strong>{selected}</strong>
          </p>
        ) : (
          <p>No selection (click clear to see the callback)</p>
        )}
      </div>
    </SelectionStack>
  );
}
export const WithOnClearCallback: Story = { render: () => <ClearCallback /> };
export const Variants: Story = {
  render: () => (
    <SelectionStack>
      <h3 {...stylex.props(s.heading)}>Single Select Variants</h3>
      <SearchPicker
        popupSearch
        clear
        items={options}
        label="Primary variant"
        variant="primary"
        inputPlaceholder="Search..."
      />
      <SearchPicker
        popupSearch
        clear
        items={options}
        label="Secondary variant"
        variant="secondary"
        inputPlaceholder="Search..."
      />
      <h3 {...stylex.props(s.heading)}>Multiple Select Variants</h3>
      <SearchPicker
        popupSearch
        clear
        multiple
        items={options}
        label="Primary variant"
        variant="primary"
        placeholder="Select multiple"
        inputPlaceholder="Search..."
      />
      <SearchPicker
        popupSearch
        clear
        multiple
        items={options}
        label="Secondary variant"
        variant="secondary"
        placeholder="Select multiple"
        inputPlaceholder="Search..."
      />
    </SelectionStack>
  ),
};
export const MultipleSelect: Story = {
  render: () => (
    <SearchPicker
      popupSearch
      clear
      multiple
      items={controlledStates}
      label="States"
      placeholder="Select states"
      inputPlaceholder="Search..."
    />
  ),
};
export const FullWidth: Story = {
  render: () => (
    <Surface xstyle={s.autocompleteSurface}>
      <SearchPicker
        popupSearch
        clear
        fullWidth
        variant="secondary"
        items={states}
        label="State"
        inputPlaceholder="Search states..."
      />
    </Surface>
  ),
};
export const WithDescription: Story = {
  render: () => (
    <SearchPicker
      popupSearch
      clear
      items={states}
      label="State"
      inputPlaceholder="Search states..."
      description="Select your state of residence"
    />
  ),
};
export const WithSections: Story = {
  render: () => (
    <SearchPicker
      popupSearch
      clear
      items={groupedCountries}
      label="Country"
      placeholder="Select a country"
      inputPlaceholder="Search countries..."
    />
  ),
};
export const WithDisabledOptions: Story = {
  render: () => (
    <SearchPicker
      popupSearch
      clear
      items={disabledAnimals}
      disabledIds={["cat", "kangaroo"]}
      label="Animal"
      placeholder="Select an animal"
    />
  ),
};
export const CustomIndicator: Story = {
  render: () => (
    <SearchPicker
      popupSearch
      clear
      items={states}
      label="State"
      inputPlaceholder="Search states..."
      customIndicator
    />
  ),
};
export const Required: Story = {
  render: () => (
    <SelectionForm>
      <SearchPicker
        popupSearch
        clear
        required
        fullWidth
        name="state"
        items={states}
        label="State"
        inputPlaceholder="Search states..."
      />
      <SearchPicker
        popupSearch
        clear
        required
        fullWidth
        name="country"
        items={requiredCountries}
        label="Country"
        placeholder="Select a country"
        inputPlaceholder="Search countries..."
      />
    </SelectionForm>
  ),
};
export const Controlled: Story = {
  render: () => (
    <SearchPicker
      popupSearch
      clear
      items={controlledStates}
      label="State (controlled)"
      placeholder="Select a state"
      inputPlaceholder="Search states..."
      initial="california"
      controlled
    />
  ),
};
export const ControlledOpenState: Story = {
  render: () => (
    <SearchPicker
      popupSearch
      clear
      items={states}
      label="State"
      inputPlaceholder="Search states..."
      controlledOpen
    />
  ),
};
export const AsynchronousFiltering: Story = {
  render: () => (
    <SearchPicker
      popupSearch
      clear
      asynchronous="characters"
      label="Search a Star Wars characters"
      placeholder="Search..."
      inputPlaceholder="Search characters..."
    />
  ),
};
function VirtualUsers() {
  const items = useMemo(() => generateUsers(1000), []);
  return (
    <SearchPicker
      popupSearch
      clear
      items={items}
      label="User"
      placeholder="Select a user"
      inputPlaceholder="Search users..."
      virtualized
    />
  );
}
export const Virtualization: Story = { render: () => <VirtualUsers /> };
export const Disabled: Story = {
  render: () => (
    <SelectionStack>
      <SearchPicker
        popupSearch
        clear
        disabled
        items={states}
        label="State"
        initial="california"
        inputPlaceholder="Search states..."
      />
      <SearchPicker
        popupSearch
        clear
        disabled
        multiple
        items={countries.slice(0, 6)}
        label="Countries to Visit"
        initial={["argentina", "japan", "france"]}
        placeholder="Select countries"
        inputPlaceholder="Search countries..."
      />
    </SelectionStack>
  ),
};
export const UserSelection: Story = {
  render: () => (
    <SearchPicker
      popupSearch
      clear
      items={users}
      label="User"
      placeholder="Select a user"
      inputPlaceholder="Search users..."
      customValue
    />
  ),
};
export const UserSelectionMultiple: Story = {
  render: () => (
    <SearchPicker
      popupSearch
      clear
      multiple
      items={users}
      label="Users"
      placeholder="Select your teammates"
      inputPlaceholder="Search users..."
      customValue
    />
  ),
};
export const LocationSearch: Story = {
  render: () => (
    <SearchPicker
      popupSearch
      clear
      items={cities}
      label="City"
      placeholder="Search for a city"
      inputPlaceholder="Search cities..."
      emptyText="No cities found"
      asynchronous="location"
    />
  ),
};
export const TagGroupSelection: Story = {
  render: () => (
    <SearchPicker
      popupSearch
      clear
      multiple
      items={tags}
      label="Tags"
      placeholder="Select tags"
      inputPlaceholder="Search tags..."
      emptyText="No tags found"
    />
  ),
};
export const EmailRecipients: Story = {
  render: () => (
    <SearchPicker
      popupSearch
      clear
      multiple
      items={recipients}
      label="To"
      placeholder="Add recipients"
      inputPlaceholder="Search emails..."
      emptyText="No recipients found"
      emailValue
    />
  ),
};
