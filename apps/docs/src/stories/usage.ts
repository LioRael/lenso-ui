export function storyUsage(name: string, args: Record<string, unknown>) {
  const { label, ...props } = args;
  const attributes = (omit: string[] = []) =>
    Object.entries(props)
      .filter(([key, value]) => value !== undefined && !omit.includes(key))
      .map(([key, value]) => `${key}={${JSON.stringify(value)}}`)
      .join(" ");
  const text = `{${JSON.stringify(label ?? name)}}`;
  if (name === "ColorPicker")
    return `import { ColorArea, ColorPicker, ColorSlider, ColorSwatch } from "@lenso/ui";

<ColorPicker defaultValue={${JSON.stringify(props["initialColor"])}}>
  <ColorPicker.Trigger><ColorSwatch size="lg" />Pick a color</ColorPicker.Trigger>
  <ColorPicker.Popover>
    <ColorArea aria-label="Color area" colorSpace="hsb" xChannel="saturation" yChannel="brightness"><ColorArea.Thumb /></ColorArea>
    <ColorSlider aria-label="Hue" channel="hue" colorSpace="hsb">
      <ColorSlider.Output /><ColorSlider.Track><ColorSlider.Thumb /></ColorSlider.Track>
    </ColorSlider>
  </ColorPicker.Popover>
</ColorPicker>`;
  if (name === "EmptyState")
    return `"use client";

import { useState } from "react";
import { Button, Description, EmptyState } from "@lenso/ui";
import { Tray } from "@gravity-ui/icons";

export function Example() {
  const [created, setCreated] = useState(false);
  return <EmptyState>
    ${props["variant"] !== "text" ? '<Tray width="1em" height="1em" aria-hidden="true" />' : ""}
    <h3>{created ? "Collection created" : ${JSON.stringify(props["title"])}}</h3>
    <Description>{created ? "Your new collection is ready." : ${JSON.stringify(props["description"])}}</Description>
    ${props["withAction"] ? '<Button fullWidth onClick={() => setCreated(!created)}>{created ? "Reset example" : "Create collection"}</Button>' : ""}
  </EmptyState>;
}`;
  if (name === "Button")
    return `import { ${name} } from "@lenso/ui";\n\n<${name} ${attributes()}>\n  ${text}\n</${name}>`;
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
    body = `<Tabs orientation={${JSON.stringify(props["orientation"] ?? "horizontal")}} value={value} onValueChange={setValue}>\n      <Tabs.List activateOnFocus={${JSON.stringify(props["activateOnFocus"] ?? true)}} aria-label="Sections">\n        <Tabs.Tab value="overview">Overview</Tabs.Tab>\n        <Tabs.Tab value="activity">Activity</Tabs.Tab>\n        <Tabs.Tab value="settings">Settings</Tabs.Tab>\n        <Tabs.Indicator />\n      </Tabs.List>\n    </Tabs>`;
  else if (name === "Menu")
    return `"use client";

import { useId, useState } from "react";
import { Menu } from "@lenso/ui";

export function Example() {
  const id = useId();
  const [open, setOpen] = useState(${JSON.stringify(props["open"] ?? false)});
  const [action, setAction] = useState("");
  return <>
    <Menu open={open} onOpenChange={setOpen} triggerId={id} ${attributes(["open", "align", "submenuPresentation"])}>
      <Menu.Trigger id={id} aria-label={${JSON.stringify(label ?? "Actions")}} />
      <Menu.Portal><Menu.Positioner align={${JSON.stringify(props["align"] ?? "end")}}><Menu.Popup>
        <Menu.Item onClick={() => setAction("Edit")}>Edit</Menu.Item>
        <Menu.Item onClick={() => setAction("Duplicate")}>Duplicate</Menu.Item>
        <Menu.SubmenuRoot presentation={${JSON.stringify(props["submenuPresentation"] ?? "auto")}}>
          <Menu.SubmenuTrigger>Sort by</Menu.SubmenuTrigger>
          <Menu.Portal><Menu.Positioner><Menu.Popup>
            <Menu.Item onClick={() => setAction("Sort by name")}>Name</Menu.Item>
            <Menu.Item onClick={() => setAction("Sort by date")}>Date modified</Menu.Item>
          </Menu.Popup></Menu.Positioner></Menu.Portal>
        </Menu.SubmenuRoot>
        <Menu.Separator />
        <Menu.Item variant="danger" onClick={() => setAction("Delete")}>Delete</Menu.Item>
      </Menu.Popup></Menu.Positioner></Menu.Portal>
    </Menu>
    <output>{action}</output>
  </>;
}`;
  else throw new Error(`Missing maintained usage: ${name}`);
  return `"use client";\n\nimport { useState } from "react";\nimport { ${name} } from "@lenso/ui";\n\nexport function Example() {\n  const [value, setValue] = useState(${JSON.stringify(props["value"] ?? "")});\n  return (\n    ${body}\n  );\n}`;
}
