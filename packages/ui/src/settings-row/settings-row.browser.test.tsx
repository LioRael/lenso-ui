import * as React from "react";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { Button } from "../button/index.js";
import { Select } from "../select/index.js";
import { Switch } from "../switch/index.js";
import { ThemeScope } from "../theme-scope/index.js";
import { SettingsRow } from "./index.js";

type Control = "action" | "select" | "toggle";
type State = "default" | "disabled" | "hover";

function TrailingControl({
  control,
  labelId,
  state,
}: {
  control: Control;
  labelId: string;
  state: State;
}) {
  const disabled = state === "disabled";
  if (control === "toggle")
    return (
      <Switch.Root
        aria-labelledby={labelId}
        checked
        data-visual-state={state === "hover" ? "hover" : undefined}
        disabled={disabled}
        layout="control-only"
      >
        <Switch.Thumb />
      </Switch.Root>
    );
  if (control === "action")
    return (
      <Button
        data-visual-state={state === "hover" ? "hover" : undefined}
        disabled={disabled}
        variant="secondary"
      >
        Customize
      </Button>
    );
  return (
    <Select.Root defaultValue="default" disabled={disabled}>
      <Select.Trigger aria-labelledby={labelId}>
        <Select.Value>Default</Select.Value>
        <Select.Icon />
      </Select.Trigger>
    </Select.Root>
  );
}

function Example({ control, state }: { control: Control; state: State }) {
  const labelId = `settings-row-${control}-${state}`;
  return (
    <SettingsRow.Root
      data-visual-state={state === "hover" ? "hover" : undefined}
      disabled={state === "disabled"}
    >
      <SettingsRow.Copy>
        <SettingsRow.Title id={labelId}>Setting title</SettingsRow.Title>
        <SettingsRow.Description>
          Supporting description for this preference.
        </SettingsRow.Description>
      </SettingsRow.Copy>
      <SettingsRow.Control>
        <TrailingControl control={control} labelId={labelId} state={state} />
      </SettingsRow.Control>
    </SettingsRow.Root>
  );
}

test("Settings Row matches the approved Figma control and state matrix", async () => {
  const screen = await render(
    <div
      data-testid="settings-row-figma-state-board"
      style={{
        background: "#f9f9fa",
        boxSizing: "border-box",
        display: "grid",
        gap: "31px 34px",
        gridTemplateColumns: "repeat(3, 640px)",
        gridTemplateRows: "repeat(3, 65px)",
        height: 337,
        padding: 40,
        width: 2068,
        zoom: 0.6,
      }}
    >
      {(["select", "toggle", "action"] as const).flatMap((control) =>
        (["default", "hover", "disabled"] as const).map((state) => (
          <Example control={control} key={`${control}-${state}`} state={state} />
        )),
      )}
    </div>,
  );
  await document.fonts.load('500 13px "Inter"', "Setting title");
  const board = screen.getByTestId("settings-row-figma-state-board");
  const rows = board.element().querySelectorAll<HTMLElement>('[data-slot="settings-row"]');
  await expect.poll(() => getComputedStyle(rows[1]!).backgroundColor).toBe("rgb(245, 245, 245)");
  expect(rows).toHaveLength(9);
  expect(rows[0]!.getBoundingClientRect().width / 0.6).toBeCloseTo(640, 1);
  expect(rows[0]!.getBoundingClientRect().height / 0.6).toBeCloseTo(65, 1);
  const toggle = rows[3]!.querySelector<HTMLElement>('[data-slot="switch"]');
  const toggleTrack = rows[3]!.querySelector<HTMLElement>('[data-slot="switch-track"]');
  expect(toggle).not.toBeNull();
  expect(toggleTrack).not.toBeNull();
  expect(
    (rows[3]!.getBoundingClientRect().right - toggle!.getBoundingClientRect().right) / 0.6,
  ).toBeCloseTo(16, 1);
  expect(
    (rows[3]!.getBoundingClientRect().right - toggleTrack!.getBoundingClientRect().right) / 0.6,
  ).toBeCloseTo(22, 1);
  await expect.poll(() => getComputedStyle(rows[2]!).opacity).toBe("0.4");
  await userEvent.hover(rows[2]!);
  await expect.poll(() => getComputedStyle(rows[2]!).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect((await axe.run(board.element())).violations).toEqual([]);
});

test("Settings Row preserves dark hover semantics and consumer-owned controls", async () => {
  const screen = await render(
    <ThemeScope theme="dark">
      <div style={{ width: 480 }}>
        <SettingsRow.Root data-testid="custom-row" data-visual-state="hover">
          <SettingsRow.Copy>
            <SettingsRow.Title id="retention-title">Retention period</SettingsRow.Title>
            <SettingsRow.Description id="retention-description">
              Number of days before archived records are removed.
            </SettingsRow.Description>
          </SettingsRow.Copy>
          <SettingsRow.Control>
            <input
              aria-describedby="retention-description"
              aria-labelledby="retention-title"
              defaultValue="30"
              type="number"
            />
          </SettingsRow.Control>
        </SettingsRow.Root>
      </div>
    </ThemeScope>,
  );
  const row = screen.getByTestId("custom-row");
  await expect.poll(() => getComputedStyle(row.element()).backgroundColor).toBe("rgb(31, 31, 31)");
  expect(row.element().getBoundingClientRect().height).toBe(65);
  expect(
    (screen.getByRole("spinbutton", { name: "Retention period" }).element() as HTMLInputElement)
      .value,
  ).toBe("30");
  expect(
    (await axe.run(document.body, { rules: { region: { enabled: false } } })).violations,
  ).toEqual([]);
});

test("Settings Row links native controls and coordinates label hover", async () => {
  const screen = await render(
    <SettingsRow.Root>
      <SettingsRow.Copy>
        <SettingsRow.Label>Archive completed sessions</SettingsRow.Label>
        <SettingsRow.Description>Keep the active session list focused.</SettingsRow.Description>
      </SettingsRow.Copy>
      <SettingsRow.Control>
        {({ controlId, disabled, labelId, visualState }) => (
          <input
            aria-labelledby={labelId}
            data-visual-state={visualState}
            disabled={disabled}
            id={controlId}
            type="checkbox"
          />
        )}
      </SettingsRow.Control>
    </SettingsRow.Root>,
  );
  const label = screen.getByText("Archive completed sessions");
  const checkbox = screen.getByRole("checkbox", { name: "Archive completed sessions" });

  expect(label.element().getAttribute("for")).toBe(checkbox.element().id);
  expect(checkbox.element().getAttribute("aria-labelledby")).toBe(label.element().id);
  expect((checkbox.element() as HTMLInputElement).checked).toBe(false);
  await userEvent.click(label);
  expect((checkbox.element() as HTMLInputElement).checked).toBe(true);

  await userEvent.hover(label);
  expect(checkbox.element().getAttribute("data-visual-state")).toBe("hover");
  await userEvent.unhover(label);
  expect(checkbox.element().hasAttribute("data-visual-state")).toBe(false);
  expect(
    (await axe.run(document.body, { rules: { region: { enabled: false } } })).violations,
  ).toEqual([]);
});

test("Settings Row activates labelable custom controls without DOM lookup", async () => {
  function CustomControlRow({ disabled = false }: { disabled?: boolean }) {
    const [checked, setChecked] = React.useState(false);

    return (
      <SettingsRow.Root disabled={disabled}>
        <SettingsRow.Copy>
          <SettingsRow.Label>Allow background tasks</SettingsRow.Label>
          <SettingsRow.Description>Continue work after closing this view.</SettingsRow.Description>
        </SettingsRow.Copy>
        <SettingsRow.Control>
          {({ controlId, disabled: controlDisabled, labelId, visualState }) => (
            <Switch.Root
              aria-labelledby={labelId}
              checked={checked}
              data-testid={disabled ? "disabled-switch" : "custom-switch"}
              data-visual-state={visualState}
              disabled={controlDisabled}
              id={controlId}
              layout="control-only"
              onCheckedChange={setChecked}
            >
              <Switch.Thumb />
            </Switch.Root>
          )}
        </SettingsRow.Control>
      </SettingsRow.Root>
    );
  }

  const screen = await render(
    <div>
      <CustomControlRow />
      <CustomControlRow disabled />
    </div>,
  );
  const labels = screen.getByText("Allow background tasks").all();
  const enabledSwitch = screen.getByTestId("custom-switch");
  const disabledSwitch = screen.getByTestId("disabled-switch");

  expect(enabledSwitch.element().getAttribute("aria-checked")).toBe("false");
  await userEvent.hover(labels[0]!);
  expect(enabledSwitch.element().getAttribute("data-visual-state")).toBe("hover");
  await userEvent.click(labels[0]!);
  expect(enabledSwitch.element().getAttribute("aria-checked")).toBe("true");

  expect(disabledSwitch.element().getAttribute("aria-checked")).toBe("false");
  expect(disabledSwitch.element()).toBeDisabled();
  expect(
    (await axe.run(document.body, { rules: { region: { enabled: false } } })).violations,
  ).toEqual([]);
});

test("Settings Row pins control-only switches to the logical trailing edge", async () => {
  const screen = await render(
    <div dir="rtl" style={{ width: 320 }}>
      <SettingsRow.Root data-testid="rtl-row">
        <SettingsRow.Copy>
          <SettingsRow.Label>Keep generated summaries</SettingsRow.Label>
          <SettingsRow.Description>
            Preserve a long description without moving the trailing control.
          </SettingsRow.Description>
        </SettingsRow.Copy>
        <SettingsRow.Control>
          {({ controlId, labelId }) => (
            <Switch.Root aria-labelledby={labelId} id={controlId} layout="control-only">
              <Switch.Thumb />
            </Switch.Root>
          )}
        </SettingsRow.Control>
      </SettingsRow.Root>
    </div>,
  );
  const row = screen.getByTestId("rtl-row").element();
  const control = row.querySelector<HTMLElement>('[data-slot="switch"]');
  const track = row.querySelector<HTMLElement>('[data-slot="switch-track"]');

  expect(control).not.toBeNull();
  expect(track).not.toBeNull();
  expect(control!.getBoundingClientRect().width).toBe(42);
  expect(control!.getBoundingClientRect().left - row.getBoundingClientRect().left).toBeCloseTo(
    16,
    4,
  );
  expect(track!.getBoundingClientRect().left - row.getBoundingClientRect().left).toBeCloseTo(22, 4);
});
