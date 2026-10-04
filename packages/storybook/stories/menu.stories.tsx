// Adapted from HeroUI e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, Button, Description, Menu, Kbd, Label, MenuSection } from "@lenso/ui";
import { useEffect, useRef, useState, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { menuToast as s } from "./menu-toast.stylex";
import { MenuToastIcon } from "./menu-toast-icons.fixtures";

const meta = {
  component: Menu,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Components/Collections/Menu",
} satisfies Meta<typeof Menu>;
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
    <Menu.Portal>
      <Menu.Positioner side={submenu ? "right" : "bottom"} align="start" sideOffset={4}>
        <Menu.Popup xstyle={wide === 256 ? s.popup256 : wide === 220 ? s.popup220 : undefined}>
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}
function Trigger({ children, iconOnly = false }: { children: ReactNode; iconOnly?: boolean }) {
  return (
    <Menu.Trigger render={<Button aria-label="Menu" variant="secondary" isIconOnly={iconOnly} />}>
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
        <Menu.Section>
          <File item={{ id: "new-file", label: "New file" }} />
          <File item={{ id: "copy-link", label: "Copy link" }} />
          <File item={{ id: "edit-file", label: "Edit file" }} />
        </Menu.Section>
        <Menu.Separator />
        <Menu.Section>
          <File item={files[3]!} />
        </Menu.Section>
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
          <Menu.RadioItemIndicator>{custom ? <CustomCheck /> : undefined}</Menu.RadioItemIndicator>
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
      >
        <Menu.CheckboxItemIndicator />
        <Label>{fruit}</Label>
      </Menu.CheckboxItem>
    );
  }
  const content = (
    <>
      <Menu.Section>
        <MenuSection.Label>Select a fruit</MenuSection.Label>
        {fruits.slice(0, 3).map(fruitItem)}
      </Menu.Section>
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
      >
        {!controlled && <Menu.CheckboxItemIndicator />}
        <Label>{label}</Label>
        {controlled ? <Menu.CheckboxItemIndicator /> : <Shortcut letter={label[0]!} />}
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
              <Menu.Section>
                <MenuSection.Label>Actions</MenuSection.Label>
                {["Cut", "Copy", "Paste"].map((label, index) => (
                  <Menu.Item key={label} label={label}>
                    <Label>{label}</Label>
                    <Shortcut letter={["X", "C", "U"][index]!} />
                  </Menu.Item>
                ))}
              </Menu.Section>
              <Menu.Separator />
              <Menu.Section>
                <MenuSection.Label>Text Style</MenuSection.Label>
                {selection}
              </Menu.Section>
              <Menu.Separator />
              <Menu.Section>
                <MenuSection.Label>Text Alignment</MenuSection.Label>
                <Menu.RadioGroup
                  value={alignment}
                  onValueChange={(next) => setAlignment(String(next))}
                >
                  {["Left", "Center", "Right"].map((label, index) => (
                    <Menu.RadioItem key={label} value={label.toLowerCase()} label={label}>
                      <Menu.RadioItemIndicator />
                      <Label>{label}</Label>
                      <Shortcut alt letter={["A", "H", "D"][index]!} />
                    </Menu.RadioItem>
                  ))}
                </Menu.RadioGroup>
              </Menu.Section>
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
function LongPress({ disabled = false }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const hold = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const origin = useRef<{ x: number; y: number } | undefined>(undefined);
  function cancel() {
    clearTimeout(hold.current);
    hold.current = undefined;
    origin.current = undefined;
  }
  useEffect(() => cancel, []);
  useEffect(() => {
    if (disabled) {
      cancel();
      // oxlint-disable-next-line react/set-state-in-effect -- Disabling cancels the native hold timer and discards open state so reenabling never restores the popup.
      setOpen(false);
    }
  }, [disabled]);
  return (
    <Menu
      disabled={disabled}
      open={open}
      onOpenChange={(next, details) => {
        const keyboardClick =
          details.event.type === "click" && "detail" in details.event && details.event.detail === 0;
        if (
          details.reason === "trigger-press" &&
          details.event.type !== "keydown" &&
          !keyboardClick
        ) {
          details.cancel();
          return;
        }
        setOpen(next);
      }}
    >
      <Menu.Trigger
        disabled={disabled}
        render={<Button aria-label="Menu" variant="secondary" />}
        onMouseDown={(event) => event.preventBaseUIHandler()}
        onPointerDown={(event) => {
          if (disabled || event.button !== 0) return;
          event.preventBaseUIHandler();
          cancel();
          origin.current = { x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
          hold.current = setTimeout(() => {
            setOpen(true);
            hold.current = undefined;
          }, 500);
        }}
        onPointerUp={(event) => {
          event.preventBaseUIHandler();
          cancel();
        }}
        onPointerCancel={cancel}
        onLostPointerCapture={cancel}
        onPointerMove={(event) => {
          if (
            origin.current &&
            Math.hypot(event.clientX - origin.current.x, event.clientY - origin.current.y) > 8
          )
            cancel();
        }}
        onClick={(event) => {
          if (event.detail !== 0) {
            event.preventBaseUIHandler();
            event.preventDefault();
          }
        }}
      >
        Long Press
      </Menu.Trigger>
      <Popup>
        {files.map((item) => (
          <File key={item.id} item={item} action={false} />
        ))}
      </Popup>
    </Menu>
  );
}
export const LongPressTrigger: Story = {
  args: { disabled: false },
  render: (args) => <LongPress disabled={args.disabled} />,
};
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
        <Menu.Section>
          <MenuSection.Label>Actions</MenuSection.Label>
          {[files[0]!, edit].map((item) => (
            <File key={item.id} item={item} icons descriptions shortcuts />
          ))}
        </Menu.Section>
        <Menu.Separator />
        <Menu.Section>
          <MenuSection.Label>Danger zone</MenuSection.Label>
          <File item={{ ...files[3]!, disabled }} icons descriptions shortcuts />
        </Menu.Section>
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
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger label="Share">
            <Label>{custom ? "More options" : "Other"}</Label>
            <span {...stylex.props(s.shortcut)}>
              {custom ? <MenuToastIcon name="arrow-right" small /> : chevron}
            </span>
          </Menu.SubmenuTrigger>
          <Popup submenu>
            <File item={{ id: "whatsapp", label: "WhatsApp" }} action={false} />
            <File item={{ id: "telegram", label: "Telegram" }} action={false} />
            {!custom && <File item={{ id: "discord", label: "Discord" }} action={false} />}
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger label="Email">
                <Label>Email</Label>
                <span {...stylex.props(s.shortcut)}>{chevron}</span>
              </Menu.SubmenuTrigger>
              <Popup submenu>
                <File item={{ id: "work", label: "Work email" }} action={false} />
                <File item={{ id: "personal", label: "Personal email" }} action={false} />
              </Popup>
            </Menu.SubmenuRoot>
            {custom && <File item={{ id: "discord", label: "Discord" }} action={false} />}
          </Popup>
        </Menu.SubmenuRoot>
        {custom && (
          <Menu.SubmenuRoot>
            <Menu.SubmenuTrigger label="Other">
              <Label>Other (default indicator)</Label>
              <span {...stylex.props(s.shortcut)}>{chevron}</span>
            </Menu.SubmenuTrigger>
            <Popup submenu>
              <File item={{ id: "sms", label: "SMS" }} action={false} />
            </Popup>
          </Menu.SubmenuRoot>
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
const orangeAvatar = "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg";
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
