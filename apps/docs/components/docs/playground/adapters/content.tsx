"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";

import { Avatar } from "@lenso/ui/avatar";
import { Button } from "@lenso/ui/button";
import { Checkbox } from "@lenso/ui/checkbox";
import { ContentState, type ContentStateAlign } from "@lenso/ui/content-state";
import { DescriptionList, type DescriptionListLayout } from "@lenso/ui/description-list";
import { InlineAlert, type InlineAlertTone } from "@lenso/ui/inline-alert";
import { Label, type LabelColor } from "@lenso/ui/label";
import { RadioGroup } from "@lenso/ui/radio";
import { ResizeHandle } from "@lenso/ui/resize-handle";
import { Select } from "@lenso/ui/select";
import { Slider } from "@lenso/ui/slider";
import { ShimmerText } from "@lenso/ui/shimmer-text";
import {
  StatusMarker,
  type StatusMarkerPresentation,
  type StatusMarkerStatus,
} from "@lenso/ui/status-marker";
import { Surface, type SurfaceLevel } from "@lenso/ui/surface";
import { Switch } from "@lenso/ui/switch";
import { TextArea } from "@lenso/ui/text-area";
import { TextField } from "@lenso/ui/text-field";
import { ThemeScope } from "@lenso/ui/theme-scope";

import type { PlaygroundAdapter } from "../types";

function stringValue(
  values: Readonly<Record<string, boolean | number | string>>,
  id: string,
  fallback: string,
) {
  const value = values[id];
  return typeof value === "string" ? value : fallback;
}

export const avatarAdapter: PlaygroundAdapter = ({ theme, values }) => {
  const size = stringValue(values, "size", "default") as "compact" | "default" | "large" | "xlarge";
  const status = stringValue(values, "status", "online") as "away" | "busy" | "offline" | "online";

  return (
    <ThemeScope className="stage-canvas avatar-stage" theme={theme}>
      <Avatar.Root size={size}>
        <Avatar.Fallback>LR</Avatar.Fallback>
        <Avatar.Status
          attached
          size={size === "large" || size === "xlarge" ? "default" : "small"}
          state={status}
        />
      </Avatar.Root>
      <Avatar.Group>
        <Avatar.Root size="default">
          <Avatar.Fallback>L</Avatar.Fallback>
        </Avatar.Root>
        <Avatar.Root size="default">
          <Avatar.Fallback>LR</Avatar.Fallback>
        </Avatar.Root>
        <Avatar.Root size="default">
          <Avatar.Fallback>L</Avatar.Fallback>
        </Avatar.Root>
      </Avatar.Group>
    </ThemeScope>
  );
};

export const checkboxAdapter: PlaygroundAdapter = ({ setValue, theme, values }) => {
  const checkboxValue = stringValue(values, "value", "off");
  const state = stringValue(values, "state", "default");
  const visualState =
    state === "hover" || state === "pressed" || state === "focus-visible" ? state : undefined;

  return (
    <ThemeScope className="stage-canvas" theme={theme}>
      <Checkbox.Root
        checked={checkboxValue === "on"}
        data-visual-state={visualState}
        disabled={state === "disabled"}
        indeterminate={checkboxValue === "indeterminate"}
        onCheckedChange={(checked) => setValue("value", checked ? "on" : "off")}
      >
        <Checkbox.Indicator />
        <Checkbox.Label>Checkbox label</Checkbox.Label>
      </Checkbox.Root>
    </ThemeScope>
  );
};

export const contentStateAdapter: PlaygroundAdapter = ({ theme, values }) => {
  const align = stringValue(values, "align", "center") as ContentStateAlign;

  return (
    <ThemeScope className="stage-canvas" theme={theme}>
      <ContentState.Root align={align} style={{ maxWidth: 520 }}>
        <ContentState.Visual aria-hidden="true">⌕</ContentState.Visual>
        <ContentState.Title as="h2">No matching results</ContentState.Title>
        <ContentState.Description>
          Try a broader search or clear the current filters.
        </ContentState.Description>
        <ContentState.Actions>
          <Button variant="secondary">Clear filters</Button>
        </ContentState.Actions>
      </ContentState.Root>
    </ThemeScope>
  );
};

export const descriptionListAdapter: PlaygroundAdapter = ({ theme, values }) => {
  const layout = stringValue(values, "layout", "inline") as DescriptionListLayout;

  return (
    <ThemeScope className="stage-canvas" theme={theme}>
      <DescriptionList.Root layout={layout} style={{ maxWidth: 520 }}>
        <DescriptionList.Item>
          <DescriptionList.Term>Status</DescriptionList.Term>
          <DescriptionList.Description>Ready</DescriptionList.Description>
        </DescriptionList.Item>
        <DescriptionList.Item>
          <DescriptionList.Term>Owner</DescriptionList.Term>
          <DescriptionList.Description>Interface systems</DescriptionList.Description>
        </DescriptionList.Item>
        <DescriptionList.Item>
          <DescriptionList.Term>Revision</DescriptionList.Term>
          <DescriptionList.Description>9f3a2d7c1b8e</DescriptionList.Description>
        </DescriptionList.Item>
      </DescriptionList.Root>
    </ThemeScope>
  );
};

export const inlineAlertAdapter: PlaygroundAdapter = ({ theme, values }) => {
  const tone = stringValue(values, "tone", "info") as InlineAlertTone;

  return (
    <ThemeScope className="stage-canvas" theme={theme}>
      <InlineAlert.Root style={{ maxWidth: 560 }} tone={tone}>
        <InlineAlert.Icon />
        <InlineAlert.Content>
          <InlineAlert.Title as="h2">Settings changed elsewhere</InlineAlert.Title>
          <InlineAlert.Description>
            Reload to use the latest values before editing.
          </InlineAlert.Description>
        </InlineAlert.Content>
        <InlineAlert.Actions>
          <Button variant="secondary">Reload</Button>
        </InlineAlert.Actions>
      </InlineAlert.Root>
    </ThemeScope>
  );
};

export const shimmerTextAdapter: PlaygroundAdapter = ({ theme, values }) => (
  <ThemeScope className="stage-canvas" theme={theme}>
    <ShimmerText active={values.active === true}>Preparing response…</ShimmerText>
  </ThemeScope>
);

export const textAreaAdapter: PlaygroundAdapter = ({ theme, values }) => {
  const state = stringValue(values, "state", "default");
  const visualState = state === "hover" || state === "focus-visible" ? state : undefined;
  const invalid = state === "error";

  return (
    <ThemeScope className="stage-canvas" theme={theme}>
      <TextArea.Root disabled={state === "disabled"} invalid={invalid}>
        <TextArea.Label>Workspace guidance</TextArea.Label>
        <TextArea.Control
          data-visual-state={visualState}
          placeholder="Add optional context…"
          readOnly={state === "read-only"}
          rows={5}
        />
        {invalid ? (
          <TextArea.Error match>Resolve this field before continuing.</TextArea.Error>
        ) : (
          <TextArea.Description>Used when preparing new responses.</TextArea.Description>
        )}
      </TextArea.Root>
    </ThemeScope>
  );
};

const labelColor = (marker: string): LabelColor =>
  marker === "purple" ? "violet" : (marker as LabelColor);

export const labelAdapter: PlaygroundAdapter = ({ theme, values }) => {
  const marker = stringValue(values, "marker", "red");
  const state = stringValue(values, "state", "default");
  const visualState = state === "hover" ? "hover" : state === "active" ? "active" : undefined;

  return (
    <ThemeScope className="stage-canvas" theme={theme}>
      <Label color={labelColor(marker)} data-visual-state={visualState} open={state === "open"}>
        Label
      </Label>
    </ThemeScope>
  );
};

export const radioAdapter: PlaygroundAdapter = ({ setValue, theme, values }) => {
  const selected = values.selected === true;
  const state = stringValue(values, "state", "default");
  const visualState = ["hover", "pressed", "focus-visible"].includes(state) ? state : undefined;

  return (
    <ThemeScope className="stage-canvas" theme={theme}>
      <RadioGroup.Root value={selected ? "example" : "other"}>
        <RadioGroup.Item
          data-visual-state={visualState}
          disabled={state === "disabled"}
          onClick={() => setValue("selected", true)}
          value="example"
        >
          <RadioGroup.Indicator />
          Radio label
        </RadioGroup.Item>
      </RadioGroup.Root>
    </ThemeScope>
  );
};

const selectValues = ["Smaller", "Small", "Default", "Large", "Larger"] as const;
const selectSelections = ["First", "Second", "Third", "Fourth", "Fifth"] as const;

export const selectAdapter: PlaygroundAdapter = ({ setValue, theme, values }) => {
  const open = values.open === true;
  const selected = stringValue(values, "selected", "First");
  const selectedIndex = Math.max(
    0,
    selectSelections.indexOf(selected as (typeof selectSelections)[number]),
  );
  const position = stringValue(values, "position", "Popper");

  return (
    <ThemeScope className="stage-canvas" theme={theme}>
      <Select.Root
        onOpenChange={(nextOpen) => setValue("open", nextOpen)}
        onValueChange={(value) => {
          const nextIndex = selectValues.indexOf(value as (typeof selectValues)[number]);
          setValue("selected", selectSelections[Math.max(0, nextIndex)] ?? "First");
        }}
        open={open}
        value={selectValues[selectedIndex]}
      >
        <Select.Trigger>
          <Select.Value />
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner position={position === "Item aligned" ? "item-aligned" : "popper"}>
            <Select.Popup>
              <Select.List>
                {selectValues.map((value) => (
                  <Select.Item key={value} value={value}>
                    <Select.ItemText>{value}</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </ThemeScope>
  );
};

export const statusMarkerAdapter: PlaygroundAdapter = ({ theme, values }) => {
  const presentation = stringValue(values, "presentation", "dot") as StatusMarkerPresentation;
  const status = stringValue(values, "status", "neutral") as StatusMarkerStatus;

  return (
    <ThemeScope className="stage-canvas" theme={theme}>
      <StatusMarker presentation={presentation} status={status} />
    </ThemeScope>
  );
};

export const sliderAdapter: PlaygroundAdapter = ({ setValue, theme, values }) => {
  const value = Number(stringValue(values, "value", "25"));
  const state = stringValue(values, "state", "default");
  const visualState =
    state === "hover" || state === "pressed" || state === "focus-visible" ? state : undefined;

  return (
    <ThemeScope className="stage-canvas" theme={theme}>
      <div style={{ width: 240 }}>
        <Slider.Root
          data-visual-state={visualState}
          disabled={state === "disabled"}
          onValueChange={(nextValue) =>
            setValue("value", String(Array.isArray(nextValue) ? nextValue[0] : nextValue))
          }
          value={value}
        >
          <Slider.Control>
            <Slider.Track>
              <Slider.Indicator />
              <Slider.Thumb aria-label="Contrast" />
            </Slider.Track>
          </Slider.Control>
        </Slider.Root>
      </div>
    </ThemeScope>
  );
};

export const surfaceAdapter: PlaygroundAdapter = ({ theme, values }) => {
  const level = stringValue(values, "level", "embedded") as SurfaceLevel;

  return (
    <ThemeScope className="stage-canvas surface-stage" theme={theme}>
      <Surface className="surface-demo" level={level}>
        <h3>Panel title</h3>
        <p>Use this region for product content assembled from existing components.</p>
      </Surface>
    </ThemeScope>
  );
};

export const switchAdapter: PlaygroundAdapter = ({ setValue, theme, values }) => {
  const checked = values.checked === true;
  const size = stringValue(values, "size", "default") as "compact" | "default";
  const state = stringValue(values, "state", "default");
  const visualState =
    state === "hover" || state === "pressed" || state === "focus-visible" ? state : undefined;

  return (
    <ThemeScope className="stage-canvas" theme={theme}>
      <Switch.Root
        aria-label="Switch label"
        checked={checked}
        data-visual-state={visualState}
        disabled={state === "disabled"}
        onCheckedChange={(nextChecked) => setValue("checked", nextChecked)}
        size={size}
      >
        <Switch.Thumb />
        {size === "default" && "Switch label"}
      </Switch.Root>
    </ThemeScope>
  );
};

function ResizeHandlePreview({
  orientation,
  state,
}: {
  orientation: "horizontal" | "vertical";
  state: string;
}) {
  const range =
    orientation === "vertical"
      ? { initial: 240, max: 340, min: 160 }
      : { initial: 96, max: 136, min: 64 };
  const [value, setValue] = React.useState(range.initial);
  const previousValue = React.useRef(range.initial);
  const collapsed = value === range.min;
  const visualState =
    state === "hover" || state === "focus-visible" || state === "dragging" ? state : undefined;

  return (
    <div className={`resize-handle-demo resize-handle-demo-${orientation}`}>
      <section
        aria-label="Resizable inspector"
        className="resize-handle-demo-pane"
        id="resize-handle-inspector"
        style={orientation === "vertical" ? { width: value } : { height: value }}
      >
        <strong>Inspector</strong>
        <span>{Math.round(value)} px</span>
      </section>
      <ResizeHandle
        aria-controls="resize-handle-inspector"
        aria-label="Resize inspector"
        {...(visualState ? { "data-visual-state": visualState } : {})}
        disabled={state === "disabled"}
        key={orientation}
        max={range.max}
        min={range.min}
        onCollapseToggle={() => {
          if (collapsed) {
            setValue(previousValue.current);
          } else {
            previousValue.current = value;
            setValue(range.min);
          }
        }}
        onValueChange={setValue}
        orientation={orientation}
        style={
          orientation === "vertical"
            ? {
                bottom: 0,
                height: "auto",
                left: `calc(${value}px - 2px)`,
                position: "absolute",
                top: 0,
              }
            : {
                left: 0,
                position: "absolute",
                right: 0,
                top: `calc(${value}px - 2px)`,
                width: "auto",
              }
        }
        value={value}
      />
      <div aria-hidden="true" className="resize-handle-demo-content">
        <span>Workspace</span>
        <span>Drag the edge or use arrow keys</span>
      </div>
    </div>
  );
}

export const resizeHandleAdapter: PlaygroundAdapter = ({ theme, values }) => {
  const orientation = stringValue(values, "orientation", "vertical") as "horizontal" | "vertical";
  const state = stringValue(values, "state", "hover");

  return (
    <ThemeScope className="stage-canvas resize-handle-stage" theme={theme}>
      <ResizeHandlePreview key={orientation} orientation={orientation} state={state} />
    </ThemeScope>
  );
};

export const textFieldAdapter: PlaygroundAdapter = ({ theme, values }) => {
  const [query, setQuery] = React.useState("runtime");
  const pattern = stringValue(values, "pattern", "search");
  const size = stringValue(values, "size", "default") as "compact" | "default";
  const state = stringValue(values, "state", "default");
  const visualState = ["hover", "active", "focus-visible"].includes(state) ? state : undefined;
  const invalid = state === "error";

  return (
    <ThemeScope className="stage-canvas" theme={theme}>
      <TextField.Root disabled={state === "disabled"} invalid={invalid} size={size}>
        <TextField.Label>
          {pattern === "search" ? "Search components" : "Repository"}
        </TextField.Label>
        <TextField.InputGroup>
          <TextField.Leading>
            <SearchIcon aria-hidden="true" size={14} />
          </TextField.Leading>
          <TextField.Control
            data-visual-state={visualState}
            onValueChange={setQuery}
            placeholder={pattern === "search" ? "Search…" : "owner/project"}
            readOnly={state === "read-only"}
            type={pattern === "search" ? "search" : "text"}
            value={query}
          />
          {pattern === "search" && query ? (
            <TextField.Trailing>
              <TextField.Clear aria-label="Clear component search" onClear={() => setQuery("")} />
            </TextField.Trailing>
          ) : null}
        </TextField.InputGroup>
        {invalid ? (
          <TextField.Error match>Resolve this field before continuing.</TextField.Error>
        ) : (
          <TextField.Description>
            {state === "active" || state === "focus-visible"
              ? "Ready for input."
              : "Optional supporting text."}
          </TextField.Description>
        )}
      </TextField.Root>
    </ThemeScope>
  );
};
