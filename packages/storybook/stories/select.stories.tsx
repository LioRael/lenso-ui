/**
 * HeroUI v3.2.6 select stories, e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
 * Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
 * Modified: native Base UI values, popup anatomy and StyleX layout.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "@lenso/ui";
import { SelectField, SelectionStack, SelectionForm, PokemonSelect } from "./selection.fixtures";
import {
  states,
  controlledStates,
  countries,
  groupedCountries,
  requiredCountries,
  disabledAnimals,
  options,
  users,
} from "./selection-data.fixtures";

const meta = {
  component: Select,
  title: "Components/Pickers/Select",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { render: () => <SelectField /> };
export const Variants: Story = {
  render: () => (
    <SelectionStack>
      <SelectField label="Primary variant" variant="primary" items={options.slice(0, 2)} />
      <SelectField label="Secondary variant" variant="secondary" items={options.slice(0, 2)} />
    </SelectionStack>
  ),
};
export const FullWidth: Story = {
  render: () => (
    <SelectionStack wide>
      <SelectField fullWidth items={states.slice(0, 3)} />
    </SelectionStack>
  ),
};
export const WithDescription: Story = {
  render: () => <SelectField description="Select your state of residence" />,
};
export const MultipleSelect: Story = {
  render: () => (
    <SelectField
      multiple
      items={countries}
      label="Countries to Visit"
      placeholder="Select countries"
    />
  ),
};
export const WithSections: Story = {
  render: () => (
    <SelectField items={groupedCountries} label="Country" placeholder="Select a country" />
  ),
};
export const WithDisabledOptions: Story = {
  render: () => (
    <SelectField
      items={disabledAnimals}
      disabledIds={["cat", "kangaroo"]}
      label="Animal"
      placeholder="Select an animal"
    />
  ),
};
export const WithClearButton: Story = { render: () => <SelectField initial="california" clear /> };
export const CustomIndicator: Story = { render: () => <SelectField customIndicator /> };
export const Required: Story = {
  render: () => (
    <SelectionForm>
      <SelectField required fullWidth name="state" />
      <SelectField
        required
        fullWidth
        name="country"
        label="Country"
        placeholder="Select a country"
        items={requiredCountries}
      />
    </SelectionForm>
  ),
};
export const CustomValue: Story = {
  render: () => <SelectField items={users} label="User" placeholder="Select a user" customValue />,
};
export const CustomValueMultiple: Story = {
  render: () => (
    <SelectField
      items={users}
      label="Users"
      placeholder="Select your teammates"
      multiple
      initial={["1", "2"]}
      customValue
    />
  ),
};
export const Controlled: Story = {
  render: () => (
    <SelectField
      items={controlledStates}
      label="State (controlled)"
      placeholder="Select a state"
      initial="california"
      controlled
    />
  ),
};
export const ControlledMultiple: Story = {
  render: () => (
    <SelectField
      items={controlledStates}
      label="States (controlled multiple)"
      placeholder="Select states"
      initial={["california", "texas"]}
      multiple
      controlled
    />
  ),
};
export const ControlledOpenState: Story = { render: () => <SelectField controlledOpen /> };
export const AsynchronousLoading: Story = { render: () => <PokemonSelect /> };
export const Disabled: Story = {
  render: () => (
    <SelectionStack>
      <SelectField disabled initial="california" />
      <SelectField
        disabled
        initial={["argentina", "japan", "france"]}
        items={countries.slice(0, 6)}
        label="Countries to Visit"
        placeholder="Select countries"
        multiple
      />
    </SelectionStack>
  ),
};
