import { expect, test } from "bun:test";
import { act, createRef } from "react";
import { createRoot } from "react-dom/client";
import { Sidebar } from "../src/components/sidebar/sidebar.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

// The former raw panel did not accept StyleX or provide the unscaled inner
// content needed to keep row geometry stable during a clipped-height transition.
test("sidebar disclosure preserves native refs, state styles and retained closed contents", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const ref = createRef<HTMLDivElement>();
  try {
    await act(() =>
      root.render(
        <Sidebar.Disclosure defaultOpen>
          <Sidebar.DisclosureTrigger>Library</Sidebar.DisclosureTrigger>
          <Sidebar.DisclosurePanel
            keepMounted
            ref={ref}
            style={(state) => ({ color: state.open ? "red" : "blue" })}
          >
            <Sidebar.Item href="#recent">Recently Added</Sidebar.Item>
            <Sidebar.Disclosure defaultOpen>
              <Sidebar.DisclosureTrigger>Playlists</Sidebar.DisclosureTrigger>
              <Sidebar.DisclosurePanel>
                <Sidebar.Item href="#favorites">Favorites</Sidebar.Item>
              </Sidebar.DisclosurePanel>
            </Sidebar.Disclosure>
          </Sidebar.DisclosurePanel>
        </Sidebar.Disclosure>,
      ),
    );
    const trigger = host.querySelector<HTMLButtonElement>("button")!;
    const panel = ref.current!;
    expect(panel.dataset["lensoSlot"]).toBe("sidebar-disclosure-panel");
    expect(panel.style.color).toBe("red");
    expect(
      panel.querySelector('[data-lenso-slot="sidebar-disclosure-body"] > a')?.textContent,
    ).toBe("Recently Added");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    await act(() => trigger.click());
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(panel.style.color).toBe("blue");
    expect(ref.current).toBe(panel);
    expect(panel.querySelector('a[href="#recent"]')).not.toBeNull();
    await act(() => trigger.click());
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(panel.style.color).toBe("red");
    expect(panel.querySelector('button[aria-expanded="true"]')?.textContent).toBe("Playlists");
  } finally {
    await act(() => root.unmount());
    host.remove();
  }
});
