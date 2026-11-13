import { Sidebar as PrimitiveSidebar, createSidebarController } from "@lenso/primitives/sidebar";
import { createRoot } from "react-dom/client";
import { useState } from "react";
import {
  ListBox,
  NumberField,
  DateField,
  ColorField,
  ColorArea,
  Button,
  Form,
  Fieldset,
  TextField,
  Label,
  Input,
  FieldError,
  Checkbox,
  Switch,
  RadioGroup,
  Radio,
  Slider,
  InputOTP,
  Menu,
  ContextMenu,
  Select,
  ComboBox,
  Autocomplete,
  Modal,
  AlertDialog,
  Popover,
  ThemeScope,
  Tooltip,
  Drawer,
  Sheet,
  Toast,
  createToaster,
} from "@lenso/ui";
import { createAgent } from "@lenso/ui/agent";
import { Virtualization } from "../src/demos/en/list-box/virtualization";
import { parseDate } from "@internationalized/date";
const toaster = createToaster();
const sidebarController = createSidebarController();
function Fixture() {
  const [disabled, setDisabled] = useState(true);
  return (
    <main style={{ padding: 24, display: "grid", gap: 16 }}>
      <div dir="rtl">
        <PrimitiveSidebar.Root
          aria-label="SDK navigation"
          defaultOpen={false}
          controller={sidebarController}
        >
          <PrimitiveSidebar.Trigger>Toggle SDK navigation</PrimitiveSidebar.Trigger>
          <PrimitiveSidebar.Panel aria-label="SDK navigation panel">
            <PrimitiveSidebar.Item href="#sdk-sidebar" selected>
              Native sidebar link
            </PrimitiveSidebar.Item>
          </PrimitiveSidebar.Panel>
        </PrimitiveSidebar.Root>
        <Button onClick={() => sidebarController.setOpen(true)}>Open sidebar externally</Button>
      </div>
      <Form id="list-preferences">
        <ListBox multiple name="topics" aria-label="Topics" defaultValue={["comments"]}>
          <ListBox.Section>
            <ListBox.SectionLabel>Notifications</ListBox.SectionLabel>
            <ListBox.Item value="comments">
              Comments
              <ListBox.Item.Indicator />
            </ListBox.Item>
            <ListBox.Item value="mentions">
              Mentions
              <ListBox.Item.Indicator />
            </ListBox.Item>
            <ListBox.Item value="blocked" disabled>
              Blocked
            </ListBox.Item>
            <ListBox.Item value="reactions">
              Reactions
              <ListBox.Item.Indicator />
            </ListBox.Item>
          </ListBox.Section>
        </ListBox>
        <Button type="reset">Reset topics</Button>
      </Form>
      <Virtualization />
      <Button onClick={() => new Promise<void>((resolve) => setTimeout(resolve, 300))}>
        Async action
      </Button>
      <Form id="settings">
        <Fieldset disabled={disabled}>
          <Fieldset.Legend>Preferences</Fieldset.Legend>
          <TextField name="nickname">
            <Label>Nickname</Label>
            <Input defaultValue="Leo" required />
            <FieldError />
          </TextField>
          <Checkbox name="updates" defaultChecked>
            Updates
          </Checkbox>
          <Switch name="sync" defaultChecked>
            Sync
          </Switch>
          <RadioGroup name="plan" defaultValue="basic" aria-label="Plan">
            <Radio value="basic">Basic</Radio>
            <Radio value="pro">Pro</Radio>
          </RadioGroup>
        </Fieldset>
        <Button onClick={() => setDisabled(!disabled)}>Enable preferences</Button>
        <Button type="reset">Reset preferences</Button>
      </Form>
      <Form id="values">
        <TextField>
          <NumberField name="quantity" defaultValue={2} min={0} max={5}>
            <Label>Quantity</Label>
            <NumberField.Group>
              <NumberField.DecrementButton />
              <NumberField.Input />
              <NumberField.IncrementButton />
            </NumberField.Group>
          </NumberField>
        </TextField>
        <DateField defaultValue={parseDate("2026-11-13")} name="date">
          <DateField.Label>Date</DateField.Label>
          <DateField.Group>
            <DateField.Input>
              {(segment) => <DateField.Segment segment={segment} />}
            </DateField.Input>
          </DateField.Group>
        </DateField>
        <ColorField defaultValue="#0485F7" name="color">
          <ColorField.Label>Color</ColorField.Label>
          <ColorField.Group>
            <ColorField.Input />
          </ColorField.Group>
        </ColorField>
      </Form>
      <ColorArea aria-label="Pick color" defaultValue="rgb(116,52,255)">
        <ColorArea.Thumb />
      </ColorArea>
      <div
        data-slider-boundary=""
        style={{
          display: "flex",
          justifyContent: "center",
          width: 200,
          paddingInline: 32,
          overflow: "auto",
          borderRadius: 24,
        }}
      >
        <Slider defaultValue={20} name="volume" style={{ width: 280, maxWidth: "100%" }}>
          <Slider.Label>Volume</Slider.Label>
          <Slider.Control>
            <Slider.Track>
              <Slider.Fill />
              <Slider.Thumb aria-label="Volume thumb" />
            </Slider.Track>
          </Slider.Control>
          <Slider.Output />
        </Slider>
      </div>
      <InputOTP maxLength={4} name="code" aria-label="Verification code">
        <InputOTP.Group>
          {[0, 1, 2, 3].map((index) => (
            <InputOTP.Slot key={index} index={index} />
          ))}
        </InputOTP.Group>
      </InputOTP>
      <Menu>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Item onSelect={() => toaster("Copied")}>Copy item</Menu.Item>
          <Menu.Sub>
            <Menu.SubTrigger>Move item</Menu.SubTrigger>
            <Menu.SubContent>
              <Menu.Item>Archive item</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
        </Menu.Content>
      </Menu>
      <ContextMenu>
        <ContextMenu.Trigger>Context target</ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item>Inspect item</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>
      <Select name="fruit" defaultValue="apple">
        <Select.Label>Fruit</Select.Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Content>
          <Select.List>
            <Select.Item value="apple">Apple</Select.Item>
            <Select.Item value="pear">Pear</Select.Item>
          </Select.List>
        </Select.Content>
      </Select>
      <ComboBox>
        <ComboBox.Label>Country</ComboBox.Label>
        <ComboBox.Input />
        <ComboBox.Trigger aria-label="Show countries" />
        <ComboBox.Content>
          <ComboBox.List>
            <ComboBox.Item value="japan">Japan</ComboBox.Item>
            <ComboBox.Item value="china">China</ComboBox.Item>
          </ComboBox.List>
        </ComboBox.Content>
      </ComboBox>
      <Autocomplete>
        <Autocomplete.Label>Search city</Autocomplete.Label>
        <Autocomplete.Input />
        <Autocomplete.Content>
          <Autocomplete.List>
            <Autocomplete.Item value="London">London</Autocomplete.Item>
            <Autocomplete.Item value="Paris">Paris</Autocomplete.Item>
          </Autocomplete.List>
        </Autocomplete.Content>
      </Autocomplete>
      <Modal>
        <Modal.Trigger>Open modal</Modal.Trigger>
        <Modal.Backdrop />
        <Modal.Content>
          <Modal.Title>Edit profile</Modal.Title>
          <Modal.Description>Change your profile</Modal.Description>
          <Input aria-label="Display name" />
          <Modal.Close>Done editing</Modal.Close>
        </Modal.Content>
      </Modal>
      <AlertDialog>
        <AlertDialog.Trigger>Delete file</AlertDialog.Trigger>
        <AlertDialog.Backdrop />
        <AlertDialog.Content>
          <AlertDialog.Title>Delete document?</AlertDialog.Title>
          <AlertDialog.Description>This removes the document</AlertDialog.Description>
          <AlertDialog.Action variant="cancel">Keep document</AlertDialog.Action>
          <AlertDialog.Action>Delete document</AlertDialog.Action>
        </AlertDialog.Content>
      </AlertDialog>
      <ThemeScope theme="dark">
        <Popover>
          <Popover.Trigger>Show details</Popover.Trigger>
          <Popover.Content>
            <Popover.Title>Details</Popover.Title>
            <Popover.Close>Close details</Popover.Close>
          </Popover.Content>
        </Popover>
      </ThemeScope>
      <Tooltip delay={0}>
        <Tooltip.Trigger>Help control</Tooltip.Trigger>
        <Tooltip.Content>Helpful text</Tooltip.Content>
      </Tooltip>
      <Drawer side="right" snapPoints={[0.5, 1]}>
        <Drawer.Trigger>Open drawer</Drawer.Trigger>
        <Drawer.Backdrop />
        <Drawer.Content style={{ width: 300, height: 400 }}>
          <Drawer.Handle />
          <Drawer.Title>Settings drawer</Drawer.Title>
          <Drawer.Close>Close drawer</Drawer.Close>
        </Drawer.Content>
      </Drawer>
      <Sheet
        snapPoints={[0.25, 0.525, 1]}
        edgeAttachedSnapPoints={[0.25, 1]}
        defaultSnapPoint={0.25}
      >
        <Sheet.Trigger>Open sheet</Sheet.Trigger>
        <Sheet.Backdrop />
        <Sheet.Content>
          <Sheet.Handle />
          <Sheet.Title>Review sheet</Sheet.Title>
          <Sheet.Close aria-label="Close sheet" />
        </Sheet.Content>
      </Sheet>
      <Toast.Region toaster={toaster} />
      <Button
        onClick={() =>
          toaster("Saved settings", {
            action: {
              label: "Undo save",
              onAction: () => {
                document.body.dataset.undo = "yes";
              },
            },
          })
        }
      >
        Notify
      </Button>
    </main>
  );
}
createRoot(document.getElementById("fixture")!).render(<Fixture />);
Object.assign(window, { sdkAgent: createAgent() });
declare global {
  interface Window {
    sdkAgent: ReturnType<typeof createAgent>;
  }
}
