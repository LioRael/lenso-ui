import { Avatar, ContextMenu, Description, GlassButton, Kbd, Label, Menu } from "@lenso/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as stylex from "@stylexjs/stylex";
import { useState, type ReactNode } from "react";
import { MenuToastIcon } from "./menu-toast-icons.fixtures";
import { menuToast as s } from "./menu-toast.stylex";

const meta: Meta<typeof Menu> = {
  component: Menu,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Components/Collections/Menu",
};
export default meta;
type Story = StoryObj<typeof meta>;
function Popup({
  children,
  wide,
  submenu = false,
}: {
  children: ReactNode;
  wide?: 220 | 256;
  submenu?: boolean;
}) {
  return (
    <Menu.Content
      xstyle={wide === 256 ? s.popup256 : wide === 220 ? s.popup220 : undefined}
      side={submenu ? "right" : "bottom"}
      align="start"
      sideOffset={4}
    >
      {children}
    </Menu.Content>
  );
}
function Trigger({ children, iconOnly = false }: { children: ReactNode; iconOnly?: boolean }) {
  return (
    <Menu.Trigger
      render={<GlassButton aria-label="Menu" variant="default" isIconOnly={iconOnly} />}
    >
      {children}
    </Menu.Trigger>
  );
}
function Shortcut({
  letter,
  shift = false,
  alt = false,
}: {
  letter: string;
  shift?: boolean;
  alt?: boolean;
}) {
  return (
    <Kbd xstyle={s.shortcut} variant="light">
      <Kbd.Abbr keyValue={alt ? "alt" : "command"} />
      {shift && <Kbd.Abbr keyValue="shift" />}
      <Kbd.Content>{letter}</Kbd.Content>
    </Kbd>
  );
}
type FileItem = {
  id: string;
  label: string;
  textValue?: string;
  description?: string;
  icon?: Parameters<typeof MenuToastIcon>[0]["name"];
  key?: string;
  danger?: boolean;
  disabled?: boolean;
};
const files: FileItem[] = [
  {
    id: "new-file",
    label: "New file",
    description: "Create a new file",
    icon: "square-plus",
    key: "N",
  },
  {
    id: "open-file",
    label: "Open file",
    description: "Open an existing file",
    icon: "folder-open",
    key: "O",
  },
  {
    id: "save-file",
    label: "Save file",
    description: "Save the current file",
    icon: "floppy-disk",
    key: "S",
  },
  {
    id: "delete-file",
    label: "Delete file",
    description: "Move to trash",
    icon: "trash-bin",
    key: "D",
    danger: true,
  },
];
const edit: FileItem = {
  id: "edit-file",
  label: "Edit file",
  description: "Make changes",
  icon: "pencil",
  key: "E",
};
function File({
  item,
  icons = false,
  descriptions = false,
  shortcuts = false,
  action = true,
}: {
  item: FileItem;
  icons?: boolean;
  descriptions?: boolean;
  shortcuts?: boolean;
  action?: boolean;
}) {
  const icon = icons && item.icon && <MenuToastIcon name={item.icon} danger={item.danger} />;
  return (
    <Menu.Item
      id={item.id}
      label={item.textValue ?? item.label}
      variant={item.danger ? "danger" : "default"}
      disabled={item.disabled}
      onClick={action ? () => alert(`Selected: ${item.id}`) : undefined}
    >
      {descriptions ? (
        <>
          <div {...stylex.props(s.iconBox)}>{icon}</div>
          <div {...stylex.props(s.column)}>
            <Label xstyle={item.danger && s.danger}>{item.label}</Label>
            <Description>{item.description}</Description>
          </div>
        </>
      ) : (
        <>
          {icon}
          <Label xstyle={item.danger && s.danger}>{item.label}</Label>
        </>
      )}
      {shortcuts && item.key && <Shortcut letter={item.key} shift={item.danger} />}
    </Menu.Item>
  );
}
export const Default: Story = {
  render: () => (
    <Menu>
      <Trigger>Actions</Trigger>
      <Popup>
        <Menu.Group>
          <File item={{ id: "new-file", label: "New file" }} />
          <File item={{ id: "copy-link", label: "Copy link" }} />
          <File item={{ id: "edit-file", label: "Edit file" }} />
        </Menu.Group>
        <Menu.Separator />
        <Menu.Group>
          <File item={files[3]!} />
        </Menu.Group>
      </Popup>
    </Menu>
  ),
};
const fruits = ["Apple", "Banana", "Cherry", "Orange", "Pear"];
function CustomCheck() {
  return (
    <svg
      height="16"
      viewBox="0 0 16 16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      {...stylex.props(s.accent)}
    >
      <path
        clipRule="evenodd"
        d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m3.1-8.55a.75.75 0 1 0-1.2-.9L7.419 8.858L6.03 7.47a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.13-.08z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}
function FruitSelection({
  multiple = false,
  custom = false,
}: {
  multiple?: boolean;
  custom?: boolean;
}) {
  const [selected, setSelected] = useState("apple");
  const [checked, setChecked] = useState(new Set(["apple"]));
  function fruitItem(fruit: string) {
    const value = fruit.toLowerCase();
    if (!multiple)
      return (
        <Menu.RadioItem key={value} value={value} label={fruit}>
          <Menu.ItemIndicator>{custom ? <CustomCheck /> : undefined}</Menu.ItemIndicator>
          <Label>{fruit}</Label>
        </Menu.RadioItem>
      );
    return (
      <Menu.CheckboxItem
        key={value}
        label={fruit}
        checked={checked.has(value)}
        onCheckedChange={(next) =>
          setChecked((current) => {
            const copy = new Set(current);
            if (next) copy.add(value);
            else copy.delete(value);
            return copy;
          })
        }
        value={value}
      >
        <Menu.ItemIndicator />
        <Label>{fruit}</Label>
      </Menu.CheckboxItem>
    );
  }
  const content = (
    <>
      <Menu.Group>
        <Menu.Group.Label>Select a fruit</Menu.Group.Label>
        {fruits.slice(0, 3).map(fruitItem)}
      </Menu.Group>
      {fruits.slice(3).map(fruitItem)}
    </>
  );
  return (
    <Menu>
      <Trigger>{multiple ? "Preferred Fruits" : custom ? "Fruits" : "Fruit"}</Trigger>
      <Popup wide={256}>
        {multiple ? (
          content
        ) : (
          <Menu.RadioGroup value={selected} onValueChange={(next) => setSelected(String(next))}>
            {content}
          </Menu.RadioGroup>
        )}
      </Popup>
    </Menu>
  );
}
export const WithSingleSelection: Story = { render: () => <FruitSelection /> };
export const SingleWithCustomIndicator: Story = { render: () => <FruitSelection custom /> };
export const WithMultipleSelection: Story = { render: () => <FruitSelection multiple /> };
function TextStyles({ controlled = false }: { controlled?: boolean }) {
  const [styles, setStyles] = useState(new Set(controlled ? ["bold"] : ["bold", "italic"]));
  const [alignment, setAlignment] = useState("left");
  const selection = ["Bold", "Italic", "Underline"].map((label) => {
    const value = label.toLowerCase();
    return (
      <Menu.CheckboxItem
        key={value}
        label={label}
        checked={styles.has(value)}
        onCheckedChange={(next) =>
          setStyles((current) => {
            const copy = new Set(current);
            if (next) copy.add(value);
            else copy.delete(value);
            return copy;
          })
        }
        value={value}
      >
        {!controlled && <Menu.ItemIndicator />}
        <Label>{label}</Label>
        {controlled ? <Menu.ItemIndicator /> : <Shortcut letter={label[0]!} />}
      </Menu.CheckboxItem>
    );
  });
  return (
    <div {...stylex.props(controlled && s.controlled)}>
      <Menu>
        <Trigger>{controlled ? "Actions" : "Styles"}</Trigger>
        <Popup wide={controlled ? undefined : 256}>
          {controlled ? (
            selection
          ) : (
            <>
              <Menu.Group>
                <Menu.Group.Label>Actions</Menu.Group.Label>
                {["Cut", "Copy", "Paste"].map((label, index) => (
                  <Menu.Item key={label} label={label}>
                    <Label>{label}</Label>
                    <Shortcut letter={["X", "C", "U"][index]!} />
                  </Menu.Item>
                ))}
              </Menu.Group>
              <Menu.Separator />
              <Menu.Group>
                <Menu.Group.Label>Text Style</Menu.Group.Label>
                {selection}
              </Menu.Group>
              <Menu.Separator />
              <Menu.Group>
                <Menu.Group.Label>Text Alignment</Menu.Group.Label>
                <Menu.RadioGroup
                  value={alignment}
                  onValueChange={(next) => setAlignment(String(next))}
                >
                  {["Left", "Center", "Right"].map((label, index) => (
                    <Menu.RadioItem key={label} value={label.toLowerCase()} label={label}>
                      <Menu.ItemIndicator />
                      <Label>{label}</Label>
                      <Shortcut alt letter={["A", "H", "D"][index]!} />
                    </Menu.RadioItem>
                  ))}
                </Menu.RadioGroup>
              </Menu.Group>
            </>
          )}
        </Popup>
      </Menu>
      {controlled && (
        <p {...stylex.props(s.muted)}>
          Selected: {styles.size ? Array.from(styles).join(", ") : "None"}
        </p>
      )}
    </div>
  );
}
export const WithSectionLevelSelection: Story = { render: () => <TextStyles /> };
export const WithKeyboardShortcuts: Story = {
  render: () => (
    <Menu>
      <Trigger>Actions</Trigger>
      <Popup>
        {["New", "Open", "Save", "Delete"].map((label, index) => (
          <File
            key={label}
            item={{
              id: label.toLowerCase(),
              label,
              key: ["N", "O", "S", "D"][index],
              danger: label === "Delete",
            }}
            shortcuts
          />
        ))}
      </Popup>
    </Menu>
  ),
};
export const WithIcons: Story = {
  render: () => (
    <Menu>
      <Trigger>Actions</Trigger>
      <Popup>
        {files.map((item) => (
          <File key={item.id} item={item} icons shortcuts />
        ))}
      </Popup>
    </Menu>
  ),
};
function LongPress() {
  return (
    <ContextMenu>
      <ContextMenu.Trigger render={<GlassButton />}>Long press or right click</ContextMenu.Trigger>
      <ContextMenu.Content>
        {files.map((item) => (
          <ContextMenu.Item key={item.id}>{item.label}</ContextMenu.Item>
        ))}
      </ContextMenu.Content>
    </ContextMenu>
  );
}
export const LongPressTrigger: Story = { render: () => <LongPress /> };
export const WithDescriptions: Story = {
  render: () => (
    <Menu>
      <Trigger>Actions</Trigger>
      <Popup>
        {files.map((item) => (
          <File key={item.id} item={item} icons descriptions shortcuts />
        ))}
      </Popup>
    </Menu>
  ),
};
function Sections({ disabled = false }: { disabled?: boolean }) {
  return (
    <Menu>
      <Trigger iconOnly>
        <MenuToastIcon name={disabled ? "bars" : "ellipsis-vertical"} />
      </Trigger>
      <Popup wide={disabled ? 220 : undefined}>
        <Menu.Group>
          <Menu.Group.Label>Actions</Menu.Group.Label>
          {[files[0]!, edit].map((item) => (
            <File key={item.id} item={item} icons descriptions shortcuts />
          ))}
        </Menu.Group>
        <Menu.Separator />
        <Menu.Group>
          <Menu.Group.Label>Danger zone</Menu.Group.Label>
          <File item={{ ...files[3]!, disabled }} icons descriptions shortcuts />
        </Menu.Group>
      </Popup>
    </Menu>
  );
}
export const WithSections: Story = { render: () => <Sections /> };
export const WithDisabledItems: Story = { render: () => <Sections disabled /> };
function Submenus({ custom = false }: { custom?: boolean }) {
  const chevron = (
    <svg
      {...stylex.props(s.icon, s.mutedIcon, s.smallIcon)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
  return (
    <Menu>
      <Trigger>Share</Trigger>
      <Popup>
        <File item={{ id: "copy-link", label: "Copy Link" }} />
        <File item={{ id: "facebook", label: "Facebook" }} />
        {!custom && <File item={{ id: "twitter", label: "X / Twitter", textValue: "Twitter" }} />}
        <Menu.Sub>
          <Menu.SubTrigger aria-label="Share">
            <Label>{custom ? "More options" : "Other"}</Label>
            <span {...stylex.props(s.shortcut)}>
              {custom ? <MenuToastIcon name="arrow-right" small /> : chevron}
            </span>
          </Menu.SubTrigger>
          <Popup submenu>
            <File item={{ id: "whatsapp", label: "WhatsApp" }} action={false} />
            <File item={{ id: "telegram", label: "Telegram" }} action={false} />
            {!custom && <File item={{ id: "discord", label: "Discord" }} action={false} />}
            <Menu.Sub>
              <Menu.SubTrigger aria-label="Email">
                <Label>Email</Label>
                <span {...stylex.props(s.shortcut)}>{chevron}</span>
              </Menu.SubTrigger>
              <Popup submenu>
                <File item={{ id: "work", label: "Work email" }} action={false} />
                <File item={{ id: "personal", label: "Personal email" }} action={false} />
              </Popup>
            </Menu.Sub>
            {custom && <File item={{ id: "discord", label: "Discord" }} action={false} />}
          </Popup>
        </Menu.Sub>
        {custom && (
          <Menu.Sub>
            <Menu.SubTrigger aria-label="Other">
              <Label>Other (default indicator)</Label>
              <span {...stylex.props(s.shortcut)}>{chevron}</span>
            </Menu.SubTrigger>
            <Popup submenu>
              <File item={{ id: "sms", label: "SMS" }} action={false} />
            </Popup>
          </Menu.Sub>
        )}
      </Popup>
    </Menu>
  );
}
export const WithSubmenus: Story = { render: () => <Submenus /> };
export const WithCustomSubmenuIndicator: Story = { render: () => <Submenus custom /> };
export const Controlled: Story = { render: () => <TextStyles controlled /> };
function OpenState() {
  const [open, setOpen] = useState(false);
  return (
    <div {...stylex.props(s.controlled)}>
      <p {...stylex.props(s.muted)}>
        Menu is: <strong>{open ? "open" : "closed"}</strong>
      </p>
      <Menu open={open} onOpenChange={setOpen}>
        <Trigger>Actions</Trigger>
        <Popup>
          {files.map((item) => (
            <File key={item.id} item={item} action={false} />
          ))}
        </Popup>
      </Menu>
    </div>
  );
}
export const ControlledOpenState: Story = { render: () => <OpenState /> };
const orangeAvatar = "/assets/demo/avatars/orange.svg";
export const CustomTrigger: Story = {
  render: () => (
    <Menu>
      <Menu.Trigger aria-label="Junior Garcia account menu" xstyle={s.rounded}>
        <Avatar>
          <Avatar.Image alt="Junior Garcia" src={orangeAvatar} />
          <Avatar.Fallback delay={600}>JD</Avatar.Fallback>
        </Avatar>
      </Menu.Trigger>
      <Popup>
        <div {...stylex.props(s.profile)}>
          <div {...stylex.props(s.row)}>
            <Avatar size="sm">
              <Avatar.Image alt="Jane" src={orangeAvatar} />
              <Avatar.Fallback delay={600}>JD</Avatar.Fallback>
            </Avatar>
            <div {...stylex.props(s.column)}>
              <p {...stylex.props(s.profileName)}>Jane Doe</p>
              <p {...stylex.props(s.profileEmail)}>jane@example.com</p>
            </div>
          </div>
        </div>
        <Menu.Item label="Dashboard">
          <Label>Dashboard</Label>
        </Menu.Item>
        <Menu.Item label="Profile">
          <Label>Profile</Label>
        </Menu.Item>
        {[
          { label: "Settings", textValue: "Settings", icon: "gear" },
          { label: "Create Team", textValue: "New project", icon: "persons" },
          { label: "Log Out", textValue: "Logout", icon: "arrow-right-from-square" },
        ].map((item) => (
          <Menu.Item
            key={item.label}
            label={item.textValue}
            variant={item.label === "Log Out" ? "danger" : "default"}
          >
            <div {...stylex.props(s.between)}>
              <Label xstyle={item.label === "Log Out" && s.danger}>{item.label}</Label>
              <MenuToastIcon
                name={item.icon as "gear" | "persons" | "arrow-right-from-square"}
                small
                danger={item.label === "Log Out"}
              />
            </div>
          </Menu.Item>
        ))}
      </Popup>
    </Menu>
  ),
};
