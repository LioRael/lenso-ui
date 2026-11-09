"use client";

import { Component, lazy, Suspense, useId, useState, type ReactNode } from "react";
import { StoryProvider, useStory, type WithControlProps } from "@fumadocs/story";
import type { TypeNode } from "@fumadocs/story/type-tree";
import { useFieldValue } from "@fumari/stf";
import { Button, Fieldset, Input, Label, Select, Switch, Tabs, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { panel as s } from "./story-panel.stylex";
import { ScrollableExampleScene } from "@/components/component-example-frame";
import { ClientPreview } from "@/components/client-preview";
import { useLiveArgs } from "./use-live-args";
import { groupParameters } from "./parameter-groups";

export { StoryLanguage, type StoryFile, useStoryLocale } from "./story-context";
import { useStoryLocale } from "./story-context";
const StorySource = lazy(() => import("./story-source"));

function Choice({
  label,
  value,
  values,
  onChange,
  id,
  labels,
  compact = false,
}: {
  label: string;
  value: string;
  values: string[];
  onChange: (value: string) => void;
  id?: string;
  labels?: Record<string, string>;
  compact?: boolean;
}) {
  return (
    <Select.Root
      variant="secondary"
      items={values.map((value) => ({ label: labels?.[value] ?? value, value }))}
      value={value}
      onValueChange={(next) => {
        if (next !== null) onChange(next);
      }}
    >
      <Select.Trigger id={id} aria-label={label} xstyle={[s.trigger, compact && s.compactTrigger]}>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={6} xstyle={s.positioner}>
          <Select.Popover xstyle={s.popup}>
            <Select.List>
              {values.map((value) => (
                <Select.Item key={value} value={value}>
                  <Select.ItemText>{labels?.[value] ?? value}</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popover>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

function literals(node: TypeNode): string[] | undefined {
  if (node.type === "enum" && node.members.every((item) => typeof item.value === "string"))
    return node.members.map((item) => String(item.value));
  if (node.type === "literal" && typeof node.value === "string") return [node.value];
  if (node.type === "union") {
    const members = node.types.filter((item) => item.type !== "undefined").map(literals);
    if (members.every((item) => item !== undefined)) return members.flatMap((item) => item ?? []);
  }
}

function isBoolean(node: TypeNode): boolean {
  return (
    node.type === "boolean" ||
    (node.type === "enum" &&
      node.members.length === 2 &&
      node.members.some((member) => member.value === true) &&
      node.members.some((member) => member.value === false))
  );
}

function Argument({ name, node }: { name: string; node: TypeNode }) {
  const id = useId();
  const [value, update] = useFieldValue([name]);
  const options = literals(node);
  const scalar =
    node.type === "union" ? node.types.find((item) => item.type !== "undefined") : node;
  if (options) {
    return (
      <Fieldset.Row xstyle={s.choiceRow}>
        <Label htmlFor={id}>{name}</Label>
        <Choice
          id={id}
          label={name}
          value={typeof value === "string" ? value : (options[0] ?? "")}
          values={options}
          onChange={update}
        />
      </Fieldset.Row>
    );
  }
  if (scalar && isBoolean(scalar)) {
    return (
      <Fieldset.Row>
        <Label htmlFor={id}>{name}</Label>
        <Switch id={id} aria-label={name} checked={value === true} onCheckedChange={update}>
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Content>
        </Switch>
      </Fieldset.Row>
    );
  }
  if (scalar?.type === "string" && (name === "initialColor" || name === "color")) {
    return (
      <Fieldset.Row>
        <Label htmlFor={id}>{name}</Label>
        <Input
          id={id}
          type="color"
          xstyle={s.colorInput}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => update(event.target.value)}
        />
      </Fieldset.Row>
    );
  }
  if (scalar?.type === "string" || scalar?.type === "number") {
    const numeric = scalar.type === "number";
    return (
      <TextField name={name}>
        <TextField.Label>{name}</TextField.Label>
        <Input
          id={id}
          type={numeric ? "number" : "text"}
          xstyle={!numeric && s.textInput}
          fullWidth
          value={
            numeric
              ? typeof value === "number"
                ? value
                : ""
              : typeof value === "string"
                ? value
                : ""
          }
          onValueChange={(next) => {
            if (!numeric) update(next);
            else if (next !== "" && Number.isFinite(Number(next))) update(Number(next));
          }}
        />
      </TextField>
    );
  }
  return (
    <Fieldset.Row xstyle={s.choiceRow}>
      <Label nativeLabel={false} id={id}>
        {name}
      </Label>
      <code aria-labelledby={id} {...stylex.props(s.readonlyValue)}>
        {String(value ?? "undefined")}
      </code>
    </Fieldset.Row>
  );
}

class PreviewBoundary extends Component<
  { children: ReactNode; message: string },
  { failed: boolean }
> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? (
      <p role="alert" {...stylex.props(s.note)}>
        {this.props.message}
      </p>
    ) : (
      this.props.children
    );
  }
}

function LivePreview() {
  const { Component: Preview, displayName } = useStory();
  const args = useLiveArgs();
  return [
    "Calendar",
    "CalendarYearPicker",
    "RangeCalendar",
    "DateField",
    "DatePicker",
    "DateRangePicker",
    "TimeField",
  ].includes(displayName ?? "") ? (
    <ClientPreview>
      <Preview {...args} />
    </ClientPreview>
  ) : (
    <Preview {...args} />
  );
}

function Content() {
  const cn = useStoryLocale() === "cn";
  const { presets, preset, variant, setVariant, displayName } = useStory();
  const [view, setView] = useState("preview");
  const [parameterGroup, setParameterGroup] = useState("all");
  const [reset, setReset] = useState(0);
  const root =
    preset?.controls.type === "intersection" ? preset.controls.intersection : preset?.controls;
  const groups = groupParameters(root?.type === "object" ? root.properties : []);
  const groupLabels = cn
    ? { content: "内容", appearance: "外观", state: "状态", more: "更多参数" }
    : { content: "Content", appearance: "Appearance", state: "State", more: "More" };
  const availableGroups = Object.entries(groups).filter(([, properties]) => properties.length);
  const activeGroup = availableGroups.some(([key]) => key === parameterGroup)
    ? parameterGroup
    : "all";
  const allProperties = availableGroups.flatMap(([, properties]) => properties);
  const parameterPanels = [["all", allProperties] as const, ...availableGroups];
  const compact = [
    "Button",
    "GlassButton",
    "ToggleButton",
    "GlassToggleButton",
    "CloseButton",
    "PopupButton",
    "Switch",
    "Checkbox",
    "Radio",
    "Badge",
    "Chip",
    "Tag",
    "Avatar",
    "Kbd",
    "Spinner",
    "ProgressBar",
    "ProgressCircle",
    "Meter",
    "Slider",
    "Stepper",
    "PageControl",
    "ColorSwatch",
    "Separator",
    "Link",
    "Label",
    "Description",
  ].includes(displayName ?? "");
  const material = [
    "Input",
    "TextArea",
    "SearchField",
    "Tabs",
    "Menu",
    "Toolbar",
    "Glass",
    "GlassContainer",
    "GlassMagnifier",
    "GlassButton",
  ].includes(displayName ?? "");
  return (
    <Tabs
      value={view}
      onValueChange={(value) => {
        if (typeof value === "string") setView(value);
      }}
      lift={0}
      data-component-story={displayName}
      xstyle={s.root}
      aria-label={cn ? `${displayName} 交互预览` : `${displayName} playground`}
    >
      <div {...stylex.props(s.toolbar)}>
        <Tabs.ListContainer xstyle={s.listContainer}>
          <Tabs.List aria-label={cn ? "交互示例视图" : "Playground view"} xstyle={s.list}>
            <Tabs.Tab value="preview" xstyle={s.tab}>
              {cn ? "实时预览" : "Live preview"}
            </Tabs.Tab>
            <Tabs.Tab value="source" xstyle={s.tab}>
              {cn ? "代码" : "Code"}
            </Tabs.Tab>
            <Tabs.Indicator />
          </Tabs.List>
        </Tabs.ListContainer>
        <div {...stylex.props(s.actions)}>
          <Choice
            label={cn ? "场景" : "Preset"}
            value={variant}
            values={presets.map((item) => item.variant)}
            labels={Object.fromEntries(
              presets.map((item) => [item.variant, item.description ?? item.variant]),
            )}
            onChange={setVariant}
            compact
          />
          <Button
            variant="borderless"
            xstyle={s.button}
            onClick={() => {
              setVariant(variant);
              setReset((value) => value + 1);
            }}
          >
            {cn ? "重置" : "Reset"}
          </Button>
        </div>
      </div>
      <Tabs.Panel value="preview" keepMounted xstyle={s.panel}>
        <div {...stylex.props(s.body)}>
          <ScrollableExampleScene
            data-story-preview
            registerMenuBackdrop={displayName === "Menu"}
            aria-label={cn ? "交互预览内容" : "Interactive preview"}
            {...stylex.props(s.scene, compact && s.compactScene)}
          >
            {material && (
              <div
                data-lenso-backdrop
                aria-hidden="true"
                {...stylex.props(s.glassScene, s.backdrop)}
              />
            )}
            <div {...stylex.props(s.previewContent)}>
              <PreviewBoundary
                key={`${variant}-${reset}`}
                message={
                  cn
                    ? "预览未能渲染，请重置参数后重试。"
                    : "The preview could not render. Reset its arguments to retry."
                }
              >
                <LivePreview />
              </PreviewBoundary>
            </div>
          </ScrollableExampleScene>
          <section
            {...stylex.props(s.controls)}
            aria-label={cn ? "组件参数" : "Component arguments"}
          >
            {allProperties.length > 0 && (
              <Tabs
                value={activeGroup}
                onValueChange={(value) => {
                  if (typeof value === "string") setParameterGroup(value);
                }}
                lift={0}
                xstyle={s.parameterTabs}
              >
                <Tabs.ListContainer xstyle={s.listContainer}>
                  <Tabs.List
                    aria-label={cn ? "参数分类" : "Parameter categories"}
                    xstyle={s.parameterList}
                    onFocusCapture={(event) => {
                      const target = event.target;
                      if (target instanceof HTMLElement && target.getAttribute("role") === "tab")
                        target.scrollIntoView({ block: "nearest", inline: "nearest" });
                    }}
                  >
                    <Tabs.Tab value="all" xstyle={s.tab}>
                      {cn ? "全部" : "All"}
                    </Tabs.Tab>
                    {availableGroups.map(([key]) => (
                      <Tabs.Tab key={key} value={key} xstyle={s.tab}>
                        {groupLabels[key as keyof typeof groups]}
                      </Tabs.Tab>
                    ))}
                    <Tabs.Indicator />
                  </Tabs.List>
                </Tabs.ListContainer>
                {parameterPanels.map(([key, properties]) => (
                  <Tabs.Panel key={key} value={key} xstyle={s.panel}>
                    <Fieldset aria-label={cn ? "参数" : "Properties"}>
                      <Fieldset.Group xstyle={s.controlGroup}>
                        {properties.map((property) => (
                          <div key={property.name} {...stylex.props(s.argument)}>
                            <Argument name={property.name} node={property.type} />
                          </div>
                        ))}
                      </Fieldset.Group>
                    </Fieldset>
                  </Tabs.Panel>
                ))}
              </Tabs>
            )}
            {root?.type !== "object" || !root.properties.length ? (
              <p {...stylex.props(s.note)}>
                {cn ? "此示例没有可编辑参数。" : "This example has no editable parameters."}
              </p>
            ) : null}
          </section>
        </div>
      </Tabs.Panel>
      <Tabs.Panel value="source" data-story-source xstyle={s.panel}>
        <Suspense fallback={null}>
          <StorySource active={view === "source"} />
        </Suspense>
      </Tabs.Panel>
    </Tabs>
  );
}

export function StoryPanel(props: WithControlProps) {
  return (
    <StoryProvider {...props}>
      <Content />
    </StoryProvider>
  );
}
