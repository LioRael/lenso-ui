// HeroUI v3.2.6 stories adaptation, Apache-2.0. Native TagGroup selection/removal.
import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Avatar, Description, EmptyState, ErrorMessage, Label, Tag, TagGroup } from "@lenso/ui";
import { collectionStyles as s } from "./collection.stylex";
import { CollectionIcon } from "./collection-icons.fixtures";
import { team } from "./collection-data.fixtures";

const meta = {
  component: TagGroup,
  title: "Components/Collections/TagGroup",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof TagGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
const categories = ["News", "Travel", "Gaming", "Shopping"];
const icons = ["square-article", "planet-earth", "rocket", "shopping-bag"] as const;
function CategoryTags({
  prefix = "",
  count = 4,
  withIcons = false,
}: {
  prefix?: string;
  count?: number;
  withIcons?: boolean;
}) {
  return (
    <TagGroup.List>
      {categories.slice(0, count).map((name, index) => (
        <Tag key={name} itemKey={prefix + name.toLowerCase()} textValue={name}>
          {withIcons && <CollectionIcon name={icons[index]!} />}
          {name}
        </Tag>
      ))}
    </TagGroup.List>
  );
}
export const Default: Story = {
  render: () => (
    <TagGroup aria-label="Tags" selectionMode="single">
      <CategoryTags prefix="default-" withIcons />
    </TagGroup>
  ),
};
export const Sizes: Story = {
  render: () => (
    <div {...stylex.props(s.stack6)}>
      {(["sm", "md", "lg"] as const).map((size, index) => (
        <TagGroup
          key={size}
          aria-label={["Small", "Medium", "Large"][index]}
          selectionMode="single"
          size={size}
        >
          <Label>{["Small", "Medium", "Large"][index]}</Label>
          <CategoryTags count={3} />
        </TagGroup>
      ))}
    </div>
  ),
};
export const Variants: Story = {
  render: () => (
    <div {...stylex.props(s.stack8)}>
      {(["default", "surface"] as const).map((variant) => (
        <TagGroup
          key={variant}
          aria-label={variant === "default" ? "Default" : "Surface"}
          selectionMode="single"
          variant={variant}
        >
          <Label>{variant === "default" ? "Default" : "Surface"}</Label>
          <CategoryTags count={3} />
        </TagGroup>
      ))}
    </div>
  ),
};
export const Disabled: Story = {
  render: () => (
    <div {...stylex.props(s.stack4)}>
      <TagGroup aria-label="Disabled Tags" selectionMode="single">
        <Label>Disabled Tags</Label>
        <TagGroup.List>
          <Tag itemKey="news" textValue="News" disabled>
            News
          </Tag>
          <Tag itemKey="travel" textValue="Travel">
            Travel
          </Tag>
          <Tag itemKey="gaming" textValue="Gaming" disabled>
            Gaming
          </Tag>
        </TagGroup.List>
        <Description>Some tags are disabled</Description>
      </TagGroup>
      <TagGroup
        aria-label="Disabled Keys"
        disabledKeys={new Set(["disabled-travel"])}
        selectionMode="single"
      >
        <Label>Disabled Keys</Label>
        <CategoryTags prefix="disabled-" count={3} />
        <Description>Tags disabled via disabledKeys prop</Description>
      </TagGroup>
    </div>
  ),
};
function SelectionModesDemo() {
  const [singleSelected, setSingleSelected] = useState<Set<React.Key>>(new Set(["news"]));
  const [multipleSelected, setMultipleSelected] = useState<Set<React.Key>>(
    new Set(["news", "travel"]),
  );
  return (
    <div {...stylex.props(s.stack8)}>
      <TagGroup
        aria-label="Single Selection"
        selectedKeys={singleSelected}
        selectionMode="single"
        onSelectionChange={setSingleSelected}
      >
        <Label>Single Selection</Label>
        <CategoryTags />
        <Description>Choose one category</Description>
      </TagGroup>
      <TagGroup
        aria-label="Multiple Selection"
        selectedKeys={multipleSelected}
        selectionMode="multiple"
        onSelectionChange={setMultipleSelected}
      >
        <Label>Multiple Selection</Label>
        <CategoryTags />
        <Description>Choose multiple categories</Description>
      </TagGroup>
    </div>
  );
}
export const SelectionModes: Story = { render: () => <SelectionModesDemo /> };
function ControlledDemo() {
  const [selected, setSelected] = useState<Set<React.Key>>(new Set(["news", "travel"]));
  return (
    <div {...stylex.props(s.stack3)}>
      <TagGroup
        aria-label="Categories (controlled)"
        selectedKeys={selected}
        selectionMode="multiple"
        onSelectionChange={setSelected}
      >
        <Label>Categories (controlled)</Label>
        <CategoryTags />
        <Description>
          Selected: {selected.size > 0 ? Array.from(selected).join(", ") : "None"}
        </Description>
      </TagGroup>
    </div>
  );
}
export const Controlled: Story = { render: () => <ControlledDemo /> };
function ErrorDemo() {
  const [selected, setSelected] = useState<Set<React.Key>>(new Set());
  const invalid = selected.size === 0;
  return (
    <TagGroup
      aria-label="Amenities"
      aria-invalid={invalid || undefined}
      selectedKeys={selected}
      selectionMode="multiple"
      onSelectionChange={setSelected}
    >
      <Label>Amenities</Label>
      <TagGroup.List>
        {[
          ["laundry", "Laundry"],
          ["fitness", "Fitness center"],
          ["parking", "Parking"],
          ["pool", "Swimming pool"],
          ["breakfast", "Breakfast"],
        ].map(([key, name]) => (
          <Tag key={key} itemKey={key!} textValue={name!}>
            {name}
          </Tag>
        ))}
      </TagGroup.List>
      <Description>
        {invalid ? "Select at least one category" : "Selected: " + Array.from(selected).join(", ")}
      </Description>
      {invalid && <ErrorMessage>Please select at least one category</ErrorMessage>}
    </TagGroup>
  );
}
export const WithErrorMessage: Story = { render: () => <ErrorDemo /> };
function UserAvatar({ user, size = "sm" }: { user: (typeof team)[number]; size?: "sm" | "md" }) {
  return (
    <Avatar size={size} xstyle={s.avatar}>
      <Avatar.Image src={user.avatar} />
      <Avatar.Fallback>{user.fallback}</Avatar.Fallback>
    </Avatar>
  );
}
export const WithPrefix: Story = {
  render: () => (
    <div {...stylex.props(s.stack8)}>
      <TagGroup aria-label="With Icons" selectionMode="single">
        <Label>With Icons</Label>
        <CategoryTags withIcons />
        <Description>Tags with icons</Description>
      </TagGroup>
      <TagGroup aria-label="With Avatars" selectionMode="single">
        <Label>With Avatars</Label>
        <TagGroup.List>
          {team.slice(0, 3).map((user) => (
            <Tag key={user.key} itemKey={user.key} textValue={user.textValue}>
              <UserAvatar user={user} size="md" />
              {user.textValue}
            </Tag>
          ))}
        </TagGroup.List>
        <Description>Tags with avatars</Description>
      </TagGroup>
    </div>
  ),
};
function RemoveDemo() {
  const [tags, setTags] = useState(
    categories.map((name) => ({ key: name.toLowerCase(), textValue: name })),
  );
  const [frameworks, setFrameworks] = useState(
    ["React", "Vue", "Angular", "Svelte"].map((name) => ({
      key: name.toLowerCase(),
      textValue: name,
    })),
  );
  return (
    <div {...stylex.props(s.stack8)}>
      <div {...stylex.props(s.small)}>
        <TagGroup
          aria-label="Default Remove Button"
          selectionMode="single"
          onRemove={(keys) => setTags((previous) => previous.filter((tag) => !keys.has(tag.key)))}
        >
          <Label>Default Remove Button</Label>
          <TagGroup.List>
            {tags.map((tag) => (
              <Tag key={tag.key} itemKey={tag.key} textValue={tag.textValue}>
                {tag.textValue}
              </Tag>
            ))}
          </TagGroup.List>
          {!tags.length && <EmptyState xstyle={s.empty}>No categories found</EmptyState>}
          <Description>Click the X to remove tags</Description>
        </TagGroup>
      </div>
      {(["Render Props", "Compound Component"] as const).map((pattern) => (
        <div key={pattern} {...stylex.props(s.medium)}>
          <TagGroup
            aria-label={`Custom Remove Button (${pattern})`}
            selectionMode="single"
            onRemove={(keys) =>
              setFrameworks((previous) => previous.filter((tag) => !keys.has(tag.key)))
            }
          >
            <Label>Custom Remove Button ({pattern})</Label>
            <TagGroup.List>
              {frameworks.map((tag) => (
                <Tag key={tag.key} itemKey={tag.key} textValue={tag.textValue}>
                  {pattern === "Render Props"
                    ? ({ allowsRemoving }) => (
                        <>
                          {tag.textValue}
                          {allowsRemoving && (
                            <Tag.RemoveButton>
                              <CollectionIcon name="circle-xmark-fill" />
                            </Tag.RemoveButton>
                          )}
                        </>
                      )
                    : [
                        tag.textValue,
                        <Tag.RemoveButton key="remove">
                          <CollectionIcon name="circle-xmark-fill" />
                        </Tag.RemoveButton>,
                      ]}
                </Tag>
              ))}
            </TagGroup.List>
            {!frameworks.length && <EmptyState xstyle={s.empty}>No frameworks found</EmptyState>}
            <Description>
              {pattern === "Render Props"
                ? "Custom remove button with icon using render props"
                : "Custom remove button using compound component pattern"}
            </Description>
          </TagGroup>
        </div>
      ))}
    </div>
  );
}
export const WithRemoveButton: Story = { render: () => <RemoveDemo /> };
function ListDataDemo() {
  const [items, setItems] = useState(team);
  const [selectedKeys, setSelectedKeys] = useState<Set<React.Key>>(new Set(["fred", "michael"]));
  const remove = (keys: Set<React.Key>) => {
    setItems((previous) => previous.filter((user) => !keys.has(user.key)));
    setSelectedKeys((previous) => new Set([...previous].filter((key) => !keys.has(key))));
  };
  return (
    <div {...stylex.props(s.small)}>
      <TagGroup
        aria-label="Team Members"
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        onRemove={remove}
        onSelectionChange={setSelectedKeys}
      >
        <Label>Team Members</Label>
        <TagGroup.List>
          {items.map((user) => (
            <Tag key={user.key} itemKey={user.key} textValue={user.textValue}>
              <UserAvatar user={user} />
              {user.textValue}
            </Tag>
          ))}
        </TagGroup.List>
        {!items.length && <EmptyState xstyle={s.empty}>No team members</EmptyState>}
        <Description>Select team members for your project</Description>
      </TagGroup>
      {selectedKeys.size > 0 && (
        <div {...stylex.props(s.selected)}>
          <p {...stylex.props(s.mutedSm, s.weight)}>Selected:</p>
          <div {...stylex.props(s.wrap)}>
            {Array.from(selectedKeys).map((key) => {
              const user = items.find((item) => item.key === key);
              return user ? (
                <div key={`${user.key}-selected`} {...stylex.props(s.selectedUser)}>
                  <UserAvatar user={user} />
                  <span {...stylex.props(s.textSm)}>{user.textValue}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
export const WithListData: Story = { render: () => <ListDataDemo /> };
