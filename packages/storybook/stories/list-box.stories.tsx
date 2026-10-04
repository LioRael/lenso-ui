/**
 * HeroUI v3.2.6 list-box stories, e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
 * Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
 * Modified: public native collection parts, selection sets and windowing.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ListBox } from "@lenso/ui";
import { useMemo } from "react";
import { CollectionStory } from "./selection.fixtures";
import { users, fileActions, generateUsers } from "./selection-data.fixtures";

const meta = {
  component: ListBox,
  title: "Components/Collections/ListBox",
  parameters: { layout: "centered" },
} satisfies Meta<typeof ListBox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { render: () => <CollectionStory items={users.slice(0, 3)} bare /> };
export const WithSections: Story = {
  render: () => <CollectionStory items={fileActions} actions />,
};
export const WithDisabledItems: Story = {
  render: () => <CollectionStory items={fileActions} actions disabledIds={["delete-file"]} />,
};
export const MultiSelect: Story = {
  render: () => <CollectionStory items={users.slice(0, 3)} multiple />,
};
export const CustomCheckIcon: Story = {
  render: () => <CollectionStory items={users.slice(0, 3)} multiple customCheck />,
};
export const Controlled: Story = {
  render: () => <CollectionStory items={users.slice(0, 3)} multiple controlled customCheck />,
};
function VirtualUsers() {
  const items = useMemo(() => generateUsers(1000), []);
  return <CollectionStory items={items} virtualized />;
}
export const Virtualization: Story = { render: () => <VirtualUsers /> };
