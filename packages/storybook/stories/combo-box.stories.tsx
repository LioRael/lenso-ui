/**
 * HeroUI v3.2.6 combo-box stories, e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
 * Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
 * Modified: native Base UI values, chips, filtering and StyleX layout.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ComboBox } from "@lenso/ui";
import { SearchPicker, SelectionStack, SelectionForm } from "./selection.fixtures";
import {
  animals,
  controlledAnimals,
  groupedCountries,
  disabledAnimals,
  users,
} from "./selection-data.fixtures";

const meta = {
  component: ComboBox,
  title: "Components/Pickers/ComboBox",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ComboBox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { render: () => <SearchPicker items={animals} /> };
export const FullWidth: Story = {
  render: () => (
    <SelectionStack wide>
      <SearchPicker fullWidth items={animals.slice(0, 3)} />
      <SearchPicker fullWidth required items={animals.slice(0, 2)} />
    </SelectionStack>
  ),
};
export const DefaultSelectedKey: Story = {
  render: () => <SearchPicker items={animals} initial="cat" />,
};
export const WithDescription: Story = {
  render: () => (
    <SearchPicker items={animals} description="Search and select your favorite animal" />
  ),
};
export const WithSections: Story = {
  render: () => (
    <SearchPicker items={groupedCountries} label="Country" inputPlaceholder="Search countries..." />
  ),
};
export const WithDisabledOptions: Story = {
  render: () => (
    <SearchPicker items={disabledAnimals} disabledIds={["cat", "kangaroo"]} label="Animal" />
  ),
};
export const CustomIndicator: Story = {
  render: () => <SearchPicker items={animals} customIndicator />,
};
export const Required: Story = {
  render: () => (
    <SelectionForm>
      <SearchPicker fullWidth required items={animals} name="animal" />
    </SelectionForm>
  ),
};
export const CustomValue: Story = {
  render: () => (
    <SearchPicker items={users} label="User" inputPlaceholder="Search users..." customValue />
  ),
};
export const Controlled: Story = {
  render: () => (
    <SearchPicker items={controlledAnimals} label="Animal (controlled)" initial="cat" controlled />
  ),
};
export const ControlledInputValue: Story = {
  render: () => (
    <SearchPicker
      items={animals}
      label="Search (controlled input)"
      inputPlaceholder="Type to search..."
      controlledInput
    />
  ),
};
export const AsynchronousLoading: Story = {
  render: () => (
    <SearchPicker
      asynchronous="characters"
      label="Pick a Character"
      inputPlaceholder="Star Wars characters..."
    />
  ),
};
export const CustomFiltering: Story = {
  render: () => (
    <SearchPicker items={controlledAnimals} label="Animal (custom filter)" customFilter />
  ),
};
export const AllowsCustomValue: Story = {
  render: () => (
    <SearchPicker
      items={animals}
      customValueAllowed
      inputPlaceholder="Search or type an animal..."
      description="You can type any animal name, even if it's not in the list"
    />
  ),
};
export const Disabled: Story = {
  render: () => <SearchPicker items={animals} disabled initial="cat" />,
};
export const MenuTrigger: Story = {
  render: () => (
    <SelectionStack>
      <p>Focus (default)</p>
      <SearchPicker
        items={animals}
        menuTrigger="focus"
        description="Popover opens when the input is focused"
      />
      <p>Input</p>
      <SearchPicker
        items={animals}
        menuTrigger="input"
        description="Popover opens when the user edits the input text"
      />
      <p>Manual</p>
      <SearchPicker
        items={animals}
        menuTrigger="manual"
        description="Popover only opens when the trigger button is pressed or arrow keys are used"
      />
    </SelectionStack>
  ),
};
export const MultipleSelection: Story = {
  render: () => <SearchPicker items={animals} label="Favorite Animals" multiple />,
};
export const MultipleSelectionControlled: Story = {
  render: () => (
    <SearchPicker
      items={controlledAnimals}
      label="Animals (controlled)"
      multiple
      initial={["cat", "dog"]}
      controlled
    />
  ),
};
export const MultipleSelectionWithTags: Story = {
  render: () => (
    <SearchPicker
      items={controlledAnimals}
      label="Favorite Animals"
      multiple
      initial={["cat", "dog"]}
      customValue
    />
  ),
};
