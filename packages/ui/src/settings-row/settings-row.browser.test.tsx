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
  await expect.poll(() => getComputedStyle(rows[2]!).opacity).toBe("0.4");
  await userEvent.hover(rows[2]!);
  await expect.poll(() => getComputedStyle(rows[2]!).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect((await axe.run(board.element())).violations).toEqual([]);
  await expect.element(board).toMatchScreenshot("settings-row-figma-state-board", {
    comparatorName: "pixelmatch",
    comparatorOptions: { allowedMismatchedPixelRatio: 0.035 },
  });
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
