"use client";

import { Component, lazy, Suspense, useContext, useId, useState, type ReactNode } from "react";
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

export {
  StoryLanguage,
  type StoryFile,
  type PlaygroundScenario,
  useStoryLocale,
} from "./story-context";
import { useStoryLocale, Scenarios } from "./story-context";
import { PlaygroundActivity } from "./playground-activity";
import { DeferredExampleSource } from "@/components/deferred-example-source";
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
      <Select.Content xstyle={s.popup} sideOffset={6}>
        <Select.List>
          {values.map((value) => (
            <Select.Item key={value} value={value}>
              <Select.ItemText>{labels?.[value] ?? value}</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
          ))}
        </Select.List>
      </Select.Content>
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

function Argument({
  name,
  node,
  compact = false,
}: {
  name: string;
  node: TypeNode;
  compact?: boolean;
}) {
  const id = useId();
  const [value, update] = useFieldValue([name]);
  const options = literals(node);
  const scalar =
    node.type === "union" ? node.types.find((item) => item.type !== "undefined") : node;
  if (options) {
    return (
      <Fieldset.Row xstyle={s.choiceRow}>
        <Label htmlFor={id} xstyle={s.argumentLabel}>
          {name}
        </Label>
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
        <Label htmlFor={id} xstyle={s.argumentLabel}>
          {name}
        </Label>
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
        <Label htmlFor={id} xstyle={s.argumentLabel}>
          {name}
        </Label>
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
    const input = (
      <Input
        id={id}
        type={numeric ? "number" : "text"}
        xstyle={!numeric && s.textInput}
        fullWidth
        value={
          numeric
            ? typeof value === "number"
              ? String(value)
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
    );
    return compact ? (
      <Fieldset.Row xstyle={s.choiceRow}>
        <Label htmlFor={id} xstyle={s.argumentLabel}>
          {name}
        </Label>
        {input}
      </Fieldset.Row>
    ) : (
      <TextField name={name}>
        <TextField.Label>{name}</TextField.Label>
        {input}
      </TextField>
    );
  }

  return (
    <Fieldset.Row xstyle={s.choiceRow}>
      <Label id={id} xstyle={s.argumentLabel}>
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
  const scenarios = useContext(Scenarios);
  const [example, setExample] = useState<string | undefined>(
    () => scenarios.find((scenario) => scenario.initial)?.id,
  );
  const selected = scenarios.find(({ id }) => id === example);
  const [reset, setReset] = useState(0);
  const choices = [
    ...presets.map((item) => ({
      id: item.variant,
      title:
        displayName === "Menu" && item.variant === "Default"
          ? cn
            ? "参数预览"
            : "Controls"
          : (item.description ?? item.variant),
    })),
    ...scenarios.map(({ id, title }) => ({ id, title })),
  ];
  const current = selected?.id ?? variant;
  const selectExample = (next: string) => {
    if (scenarios.some(({ id }) => id === next)) setExample(next);
    else {
      setExample(undefined);
      setVariant(next);
    }
  };
  const root =
    preset?.controls.type === "intersection" ? preset.controls.intersection : preset?.controls;
  const groups = groupParameters(root?.type === "object" ? root.properties : []);
  const allProperties = Object.values(groups).flat();
  const inline = !selected && allProperties.length > 0;
  const activity =
    displayName !== "Button" &&
    ![
      "Alert",
      "Avatar",
      "AvatarGroup",
      "Badge",
      "Card",
      "Description",
      "ErrorMessage",
      "FieldError",
      "Icon",
      "Kbd",
      "Label",
      "Material",
      "Separator",
      "Skeleton",
      "Spinner",
      "ProgressBar",
      "ProgressCircle",
      "Meter",
      "ColorSwatch",
      "Typography",
      "Glass",
      "GlassMagnifier",
      "Image",
    ].includes(displayName ?? "");
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
          <div>
            <Choice
              label={cn ? "场景" : "Preset"}
              value={current}
              values={choices.map(({ id }) => id)}
              labels={Object.fromEntries(choices.map(({ id, title }) => [id, title]))}
              onChange={selectExample}
              compact
            />
          </div>
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
        <div {...stylex.props(s.body, inline && s.inlineBody)}>
          <PlaygroundActivity enabled={activity} key={`${selected?.id ?? variant}-${reset}`}>
            <ScrollableExampleScene
              data-story-preview
              data-example-scene
              registerMenuBackdrop={displayName === "Menu"}
              aria-label={cn ? "交互预览内容" : "Interactive preview"}
              {...stylex.props(
                s.scene,
                compact && s.compactScene,
                displayName === "Button" && s.inlineScene,
              )}
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
                  key={`${selected?.id ?? variant}-${reset}`}
                  message={
                    cn
                      ? "预览未能渲染，请重置参数后重试。"
                      : "The preview could not render. Reset its arguments to retry."
                  }
                >
                  {selected ? (
                    <ClientPreview>
                      <selected.Preview />
                    </ClientPreview>
                  ) : (
                    <LivePreview />
                  )}
                </PreviewBoundary>
              </div>
            </ScrollableExampleScene>
          </PlaygroundActivity>
          {inline && (
            <section
              {...stylex.props(s.controls)}
              aria-label={cn ? "组件参数" : "Component arguments"}
            >
              <Fieldset aria-label={cn ? "参数" : "Properties"}>
                <Fieldset.Group xstyle={s.inlineControls}>
                  {allProperties.map((property) => (
                    <div key={property.name} {...stylex.props(s.argument)}>
                      <Argument name={property.name} node={property.type} compact />
                    </div>
                  ))}
                </Fieldset.Group>
              </Fieldset>
            </section>
          )}
        </div>
      </Tabs.Panel>
      <Tabs.Panel value="source" data-story-source xstyle={s.panel}>
        <Suspense fallback={null}>
          {selected ? (
            view === "source" && (
              <DeferredExampleSource
                key={selected.id}
                load={selected.loadFiles}
                locale={cn ? "cn" : "en"}
              />
            )
          ) : (
            <StorySource active={view === "source"} />
          )}
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
