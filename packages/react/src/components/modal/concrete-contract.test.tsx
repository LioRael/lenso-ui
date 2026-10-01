import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import type { Dialog } from "@base-ui/react/dialog";
import type { Drawer as NativeDrawer } from "@base-ui/react/drawer";
import { afterEach, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { Modal } from "./modal.js";
import { AlertDialog } from "../alert-dialog/alert-dialog.js";
import { Drawer } from "../drawer/drawer.js";
import { Menu } from "../menu/menu.js";

afterEach(cleanup);

const styles = stylex.create({
  popup: (padding: number) => ({ paddingTop: padding, paddingLeft: 17 }),
  item: (padding: number) => ({ paddingInlineStart: padding }),
});

// Geometry tests do not prove that direct parts retain runtime StyleX variables
// while composing native state callbacks, render functions, refs and caller slots.
it.each([
  { name: "modal", Overlay: Modal },
  { name: "alert-dialog", Overlay: AlertDialog },
  { name: "drawer", Overlay: Drawer },
])("preserves the concrete $name popup contract", async ({ Overlay }) => {
  const popupRef = React.createRef<HTMLDivElement>();
  const triggerRef = React.createRef<HTMLButtonElement>();
  const states: boolean[] = [];
  await render(
    <Overlay.Root>
      <Overlay.Trigger
        ref={triggerRef}
        data-slot="caller-trigger"
        render={(props: React.ComponentPropsWithRef<"button">, state: Dialog.Trigger.State) => (
          <button {...props} data-render-open={state.open} />
        )}
        style={(state: Dialog.Trigger.State) => ({ outlineWidth: state.open ? 3 : 1 })}
      >
        Open contract
      </Overlay.Trigger>
      <Overlay.Portal>
        <Overlay.Backdrop />
        <Overlay.Viewport>
          <Overlay.Popup
            ref={popupRef}
            data-slot="caller-popup"
            xstyle={styles.popup(29)}
            style={(state: Dialog.Popup.State | NativeDrawer.Popup.State) => {
              states.push(state.open);
              return { paddingLeft: 11 };
            }}
            render={(
              props: React.ComponentPropsWithRef<"div">,
              state: Dialog.Popup.State | NativeDrawer.Popup.State,
            ) => <div {...props} data-render-open={state.open} />}
          >
            <Overlay.Title>Contract</Overlay.Title>
            <Overlay.Close>Close contract</Overlay.Close>
          </Overlay.Popup>
        </Overlay.Viewport>
      </Overlay.Portal>
    </Overlay.Root>,
  );
  const trigger = page.getByRole("button", { name: "Open contract" });
  expect(triggerRef.current).toBe(trigger.element());
  expect(triggerRef.current?.getAttribute("data-slot")).toBe("caller-trigger");
  await userEvent.click(trigger);
  await expect.poll(() => popupRef.current?.getAttribute("data-render-open")).toBe("true");
  expect(popupRef.current?.getAttribute("data-slot")).toBe("caller-popup");
  expect(states).toContain(true);
  await expect.poll(() => getComputedStyle(popupRef.current!).paddingTop).toBe("29px");
  expect(getComputedStyle(popupRef.current!).paddingLeft).toBe("11px");
  expect(getComputedStyle(triggerRef.current!).outlineWidth).toBe("3px");
  await userEvent.click(page.getByRole("button", { name: "Close contract" }));
  await expect.poll(() => popupRef.current).toBeNull();
  await expect.element(trigger).toHaveFocus();
});

it("preserves menu checked state, events and render composition with dynamic styles", async () => {
  const itemRef = React.createRef<HTMLElement>();
  const changes: boolean[] = [];
  await render(
    <Menu.Root>
      <Menu.Trigger>Open choices</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Section>
              <Menu.GroupLabel>Choices</Menu.GroupLabel>
              <Menu.CheckboxItem
                ref={itemRef}
                data-slot="caller-choice"
                closeOnClick={false}
                variant="danger"
                xstyle={styles.item(31)}
                onCheckedChange={(checked) => changes.push(checked)}
                style={(state) => ({ outlineWidth: state.checked ? 4 : 2 })}
                render={(props, state) => <div {...props} data-render-checked={state.checked} />}
              >
                Keep choice
                <Menu.CheckboxItemIndicator>Selected</Menu.CheckboxItemIndicator>
              </Menu.CheckboxItem>
            </Menu.Section>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>,
  );
  await userEvent.click(page.getByRole("button", { name: "Open choices" }));
  const item = page.getByRole("menuitemcheckbox");
  await expect.element(item).toHaveAttribute("aria-checked", "false");
  expect(itemRef.current).toBe(item.element());
  expect(itemRef.current?.getAttribute("data-slot")).toBe("caller-choice");
  await expect.poll(() => getComputedStyle(itemRef.current!).paddingInlineStart).toBe("31px");
  expect(getComputedStyle(itemRef.current!).outlineWidth).toBe("2px");
  await userEvent.click(item);
  await expect.element(item).toHaveAttribute("aria-checked", "true");
  expect(changes).toEqual([true]);
  expect(itemRef.current?.getAttribute("data-render-checked")).toBe("true");
  expect(getComputedStyle(itemRef.current!).outlineWidth).toBe("4px");
});
