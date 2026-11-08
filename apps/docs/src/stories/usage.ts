export function storyUsage(name: string, args: Record<string, unknown>) {
  const { label, ...props } = args;
  const attributes = (omit: string[] = []) =>
    Object.entries(props)
      .filter(([key, value]) => value !== undefined && !omit.includes(key))
      .map(([key, value]) => `${key}={${JSON.stringify(value)}}`)
      .join(" ");
  const text = `{${JSON.stringify(label ?? name)}}`;
  if (name === "GlassToggleButton")
    return `import { Heart } from "@gravity-ui/icons";\nimport { GlassToggleButton } from "@lenso/ui";\n\n<GlassToggleButton ${attributes()} icon={<Heart />} ${props["isIconOnly"] ? 'aria-label="Like"' : ""}>\n  ${props["isIconOnly"] ? "" : "Like"}\n</GlassToggleButton>`;
  if (name === "GlassContainer")
    return `"use client";

import { useState } from "react";
import { GlassButton, GlassContainer } from "@lenso/ui";

export function Example() {
  const [separated, setSeparated] = useState(false);
  const [count, setCount] = useState(0);
  return (
    <><GlassButton elastic={${JSON.stringify(props["elastic"] ?? true)}} onClick={() => setCount(count + 1)}>Add</GlassButton>
    <GlassContainer spacing={${JSON.stringify(props["spacing"] ?? 18)}} disabled={${JSON.stringify(props["disabled"] ?? false)}} style={{ display: "flex", flexWrap: "wrap", gap: separated ? 48 : ${JSON.stringify(props["gap"] ?? 8)}, padding: 32 }}>
      <GlassButton elastic={${JSON.stringify(props["elastic"] ?? true)}} onClick={() => setSeparated(!separated)}>{separated ? "Connect" : "Separate"}</GlassButton>
      <GlassButton elastic={${JSON.stringify(props["elastic"] ?? true)}} onClick={() => setCount(count + 1)}>Add</GlassButton>
    </GlassContainer><output aria-live="polite">{count} added</output></>
  );
}`;
  if (name === "ColorPicker")
    return `import { ColorPicker, ColorSwatch, ColorSwatchPicker, ColorSlider } from "@lenso/ui";

<ColorPicker defaultValue={${JSON.stringify(props["initialColor"] ?? "#0485f7")}} defaultOpen={${JSON.stringify(props["defaultOpen"] ?? false)}}>
  <ColorPicker.Trigger><ColorSwatch /><span>Pick a color</span></ColorPicker.Trigger>
  <ColorPicker.Popover aria-label="Colors">
    <ColorSwatchPicker aria-label="Saved colors">
      {["#ff3b30", "#34c759", "#007aff"].map(color => <ColorSwatchPicker.Item key={color} color={color}><ColorSwatchPicker.Swatch /></ColorSwatchPicker.Item>)}
    </ColorSwatchPicker>
    <ColorSlider channel="alpha"><ColorSlider.Label>Opacity</ColorSlider.Label><ColorSlider.Output /><ColorSlider.Track><ColorSlider.Thumb /></ColorSlider.Track></ColorSlider>
  </ColorPicker.Popover>
</ColorPicker>`;
  if (name === "Notification")
    return `import { Notification } from "@lenso/ui";

<Notification ${attributes()}>
  <Notification.Trigger><Notification.Content><Notification.Title>Alex</Notification.Title><Notification.Description>Your photos are ready.</Notification.Description></Notification.Content><Notification.Time>now</Notification.Time></Notification.Trigger>
  <Notification.Panel><Notification.Body>The shared album is ready.</Notification.Body></Notification.Panel>
</Notification>`;
  if (name === "ShareSheet")
    return `import { Button, ShareSheet } from "@lenso/ui";

<ShareSheet ${attributes()}>
  <ShareSheet.Trigger render={<Button />}>Share photo</ShareSheet.Trigger>
  <ShareSheet.Portal><ShareSheet.Backdrop /><ShareSheet.Viewport><ShareSheet.Popup>
    <ShareSheet.Handle /><ShareSheet.Header><ShareSheet.Metadata><ShareSheet.Title>Mountain sunrise</ShareSheet.Title><ShareSheet.Description>1 photo</ShareSheet.Description></ShareSheet.Metadata><ShareSheet.Close /></ShareSheet.Header>
    <ShareSheet.Body><ShareSheet.ActionGroup><ShareSheet.Action onClick={() => console.log("Copy requested")}>Copy link</ShareSheet.Action></ShareSheet.ActionGroup></ShareSheet.Body>
  </ShareSheet.Popup></ShareSheet.Viewport></ShareSheet.Portal>
</ShareSheet>`;
  if (name === "Spinner")
    return `import { Spinner } from "@lenso/ui";

<Spinner ${attributes()} aria-label="Loading" />`;
  if (name === "ProgressBar")
    return `import { ProgressBar } from "@lenso/ui";

<ProgressBar ${attributes()} value={60} aria-label="Loading">
  <ProgressBar.Label>Loading</ProgressBar.Label><ProgressBar.Output />
  <ProgressBar.Track><ProgressBar.Fill /></ProgressBar.Track>
</ProgressBar>`;
  if (name === "Sidebar")
    return `import { Sidebar } from "@lenso/ui";

<Sidebar aria-label="Library navigation">
  <Sidebar.Header>Library</Sidebar.Header>
  <Sidebar.Content><Sidebar.Group>
    <Sidebar.Item href="/library" selected>Library</Sidebar.Item>
    <Sidebar.Item href="/favorites" disabled={${JSON.stringify(props["disabled"] ?? false)}}>Favorites</Sidebar.Item>
  </Sidebar.Group></Sidebar.Content>
</Sidebar>`;
  if (name === "Stepper")
    return `import { Stepper } from "@lenso/ui";

<Stepper defaultValue={1} min={0} max={10} ${attributes()}>
  <Stepper.Input aria-label="Quantity" />
  <Stepper.Group><Stepper.DecrementButton /><Stepper.IncrementButton /></Stepper.Group>
</Stepper>`;
  if (name === "PageControl")
    return `import { PageControl } from "@lenso/ui";

<PageControl ${attributes()} defaultPage={0} />`;
  if (name === "List")
    return `import { List } from "@lenso/ui";

<List aria-label="Network settings">
  <List.Item height="${props["tall"] ? "tall" : "regular"}">
    <List.Content><List.Title>Wi-Fi</List.Title>${props["tall"] ? "<List.Description>Connect to nearby networks</List.Description>" : ""}</List.Content>
  </List.Item>
  <List.Separator />
  <List.Item height="tall"><List.Content><List.Title>Current network</List.Title><List.Description>Studio</List.Description></List.Content></List.Item>
</List>`;
  if (name === "EmptyState")
    return `import { EmptyState, GlassButton } from "@lenso/ui";

<EmptyState>
  <EmptyState.Content>
    <EmptyState.Message><EmptyState.Title>${String(props["title"] ?? "No collections")}</EmptyState.Title><EmptyState.Description>${String(props["description"] ?? "Create one to organize your items.")}</EmptyState.Description></EmptyState.Message>
  </EmptyState.Content>
  ${props["withAction"] ? "<EmptyState.Actions><GlassButton fullWidth>Create collection</GlassButton></EmptyState.Actions>" : ""}
</EmptyState>`;
  if (["Button", "GlassButton"].includes(name))
    return `import { ${name} } from "@lenso/ui";\n\n<${name} ${attributes()}>\n  ${text}\n</${name}>`;
  if (name === "Glass" || name === "GlassMagnifier")
    return `import { ${name} } from "@lenso/ui";\n\n<${name} ${attributes(["width", "height", "radius"])} style={{ width: ${JSON.stringify(props["width"])}, height: ${JSON.stringify(props["height"])}, borderRadius: ${JSON.stringify(props["radius"])} }}>\n  ${text}\n</${name}>`;
  if (name === "Switch")
    return `"use client";\n\nimport { useState } from "react";\nimport { Switch } from "@lenso/ui";\n\nexport function Example() {\n  const [checked, setChecked] = useState(${JSON.stringify(props["checked"] ?? false)});\n  return (\n    <Switch ${attributes(["checked"])} checked={checked} onCheckedChange={setChecked}>\n      <Switch.Content>\n        <Switch.Control><Switch.Thumb /></Switch.Control>\n        ${text}\n      </Switch.Content>\n    </Switch>\n  );\n}`;
  let body: string;
  if (name === "Input")
    body = `<Input ${attributes(["value"])} aria-label="Sample input" value={value} onValueChange={setValue} />`;
  else if (name === "SearchField")
    body = `<SearchField disabled={${JSON.stringify(props["disabled"] ?? false)}}>\n      <SearchField.Group>\n        <SearchField.SearchIcon />\n        <SearchField.Input value={value} onValueChange={setValue} placeholder={${JSON.stringify(props["placeholder"] ?? "Search")}} readOnly={${JSON.stringify(props["readOnly"] ?? false)}} aria-label="Search" />\n        <SearchField.ClearButton />\n      </SearchField.Group>\n    </SearchField>`;
  else if (name === "Slider")
    body = `<Slider ${attributes(["value"])} value={value} onValueChange={(next) => setValue(typeof next === "number" ? next : (next[0] ?? 0))}>\n      <Slider.Control>\n        <Slider.Track><Slider.Fill /><Slider.Thumb aria-label="Volume" /></Slider.Track>\n      </Slider.Control>\n    </Slider>`;
  else if (name === "Tabs")
    body = `<Tabs lift={${JSON.stringify(props["lift"] ?? 20)}} orientation={${JSON.stringify(props["orientation"] ?? "horizontal")}} value={value} onValueChange={setValue}>\n      <Tabs.List activateOnFocus={${JSON.stringify(props["activateOnFocus"] ?? true)}} aria-label="Sections">\n        <Tabs.Tab value="overview">Overview</Tabs.Tab>\n        <Tabs.Tab value="activity">Activity</Tabs.Tab>\n        <Tabs.Tab value="settings">Settings</Tabs.Tab>\n        <Tabs.Indicator />\n      </Tabs.List>\n    </Tabs>`;
  else if (name === "Sheet")
    return `"use client";

import { useState } from "react";
import { Button, Sheet } from "@lenso/ui";

export function Example() {
  const [snapPoint, setSnapPoint] = useState<number | string | null>(${props["detent"] === "large" ? 1 : 0.525});
  const expanded = snapPoint === 1;
  return (
    <Sheet dim={${JSON.stringify(props["dim"] ?? true)}} snapPoint={snapPoint} onSnapPointChange={setSnapPoint}>
      <Sheet.Trigger render={<Button />}>Open sheet</Sheet.Trigger>
      <Sheet.Portal>
        <Sheet.Backdrop />
        <Sheet.Viewport>
          <Sheet.Popup>
            ${props["grabber"] !== false ? "<Sheet.Handle />" : ""}
            <Sheet.Header>
              <Sheet.Close />
              <Sheet.Title>Details</Sheet.Title>
              <button onClick={() => setSnapPoint(expanded ? 0.525 : 1)}>
                {expanded ? "Collapse" : "Expand"}
              </button>
            </Sheet.Header>
            <Sheet.Body>
              <Sheet.Description>Review the details before returning to your work.</Sheet.Description>
            </Sheet.Body>
          </Sheet.Popup>
        </Sheet.Viewport>
      </Sheet.Portal>
    </Sheet>
  );
}`;
  else if (name === "ActionSheet")
    return `import { ActionSheet, Button } from "@lenso/ui";

<ActionSheet dim={${JSON.stringify(props["dim"] ?? true)}}>
  <ActionSheet.Trigger render={<Button />}>Photo actions</ActionSheet.Trigger>
  <ActionSheet.Portal>
    <ActionSheet.Backdrop />
    <ActionSheet.Viewport placement={${JSON.stringify(props["placement"] ?? "center")}}>
      <ActionSheet.Popup>
        <ActionSheet.Header>
          <ActionSheet.Title>Manage this photo</ActionSheet.Title>
          ${props["message"] !== false ? "<ActionSheet.Description>Choose what to do with this photo.</ActionSheet.Description>" : ""}
        </ActionSheet.Header>
        <ActionSheet.Actions>
          <ActionSheet.Action destructive={${JSON.stringify(props["destructive"] ?? true)}}>Remove from album</ActionSheet.Action>
          <ActionSheet.Action>Duplicate</ActionSheet.Action>
          <ActionSheet.Close>Cancel</ActionSheet.Close>
        </ActionSheet.Actions>
      </ActionSheet.Popup>
    </ActionSheet.Viewport>
  </ActionSheet.Portal>
</ActionSheet>`;
  else if (name === "ContextMenu")
    return `import { ContextMenu } from "@lenso/ui";

<ContextMenu elastic={${JSON.stringify(props["elastic"] ?? true)}} presentation={${JSON.stringify(props["presentation"] ?? "popup")}}>
  <ContextMenu.Trigger>Project notes</ContextMenu.Trigger>
  <ContextMenu.Portal>
    ${props["dim"] !== false ? "<ContextMenu.Backdrop />" : ""}
    <ContextMenu.Positioner layout={${JSON.stringify(props["layout"] ?? "vertical")}} previewAlign={${JSON.stringify(props["previewAlign"] ?? "leading")}}>
      ${props["preview"] !== false ? "<ContextMenu.Preview>Preview of the selected note</ContextMenu.Preview>" : ""}
      <ContextMenu.Popup bar={<><ContextMenu.BarItem>Cut</ContextMenu.BarItem><ContextMenu.BarItem>Copy</ContextMenu.BarItem><ContextMenu.BarItem>Paste</ContextMenu.BarItem></>}>
        <ContextMenu.Item>Open</ContextMenu.Item>
        <ContextMenu.Item>Duplicate</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item variant="danger">Delete</ContextMenu.Item>
      </ContextMenu.Popup>
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu>`;
  else if (name === "Menu")
    return `"use client";\n\nimport { useId, useState } from "react";\nimport { Menu } from "@lenso/ui";\n\nexport function Example() {\n  const id = useId();\n  const [open, setOpen] = useState(${JSON.stringify(props["open"] ?? false)});\n  return (\n    <Menu open={open} onOpenChange={setOpen} triggerId={id} disabled={${JSON.stringify(props["disabled"] ?? false)}}>\n      <Menu.Trigger id={id} aria-label={${JSON.stringify(label ?? "Actions")}} />\n      <Menu.Portal>\n        <Menu.Positioner align={${JSON.stringify(props["align"] ?? "end")}}>\n          <Menu.Popup>\n            <Menu.Item>Edit</Menu.Item>\n            <Menu.Item>Duplicate</Menu.Item>\n            <Menu.Separator />\n            <Menu.Item variant="danger">Delete</Menu.Item>\n          </Menu.Popup>\n        </Menu.Positioner>\n      </Menu.Portal>\n    </Menu>\n  );\n}`;
  else throw new Error(`Missing maintained usage: ${name}`);
  return `"use client";\n\nimport { useState } from "react";\nimport { ${name} } from "@lenso/ui";\n\nexport function Example() {\n  const [value, setValue] = useState(${JSON.stringify(props["value"] ?? "")});\n  return (\n    ${body}\n  );\n}`;
}
