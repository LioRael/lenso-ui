import { afterEach, expect, test } from "bun:test";
import { act, createRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { NavigationBar } from "../src/components/navigation-bar/index.js";
import { PageControl } from "../src/components/page-control/index.js";
import { Toolbar } from "../src/components/toolbar/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
let root: Root;
afterEach(async () => {
  if (root) await act(() => root.unmount());
  document.body.replaceChildren();
});
async function mount(element: React.ReactNode) {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(() => root.render(element));
  return host;
}

// These regressions concern controlled state and accessible ownership; browser
// coverage separately verifies real title geometry and compiled presentation.
test("PageControl moves focus across replaced dots and respects controlled rejection and cancellation", async () => {
  function Example() {
    const [page, setPage] = useState(0);
    return (
      <>
        <PageControl
          aria-label="Accepted"
          count={20}
          variant="plain"
          page={page}
          onPageChange={setPage}
        />
        <PageControl aria-label="Rejected" count={20} variant="plain" page={0} />
        <PageControl
          aria-label="Prevented"
          count={20}
          variant="plain"
          onKeyDown={(event) => event.preventDefault()}
        />
      </>
    );
  }
  const host = await mount(<Example />);
  const control = host.querySelector('nav[aria-label="Accepted"]')!;
  const first = control.querySelector<HTMLElement>('[aria-current="page"]')!;
  first.focus();
  await act(() =>
    first.dispatchEvent(
      new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }),
    ),
  );
  const last = control.querySelector<HTMLElement>('[aria-current="page"]')!;
  expect(last.getAttribute("aria-label")).toBe("Page 20 of 20");
  expect(document.activeElement).toBe(last);
  expect(control.querySelectorAll('button[tabindex="0"]').length).toBe(1);
  await act(() =>
    last.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true }),
    ),
  );
  expect(document.activeElement?.getAttribute("aria-label")).toBe("Page 1 of 20");
  for (const name of ["Rejected", "Prevented"]) {
    const button = host.querySelector<HTMLElement>(
      `nav[aria-label="${name}"] [aria-current="page"]`,
    )!;
    button.focus();
    await act(() =>
      button.dispatchEvent(
        new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }),
      ),
    );
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute("aria-current")).toBe("page");
  }
});

test("NavigationBar preserves native toolbar controls, the forwarded ref and a single exposed heading", async () => {
  const ref = createRef<HTMLDivElement>();
  let backs = 0;
  const host = await mount(
    <NavigationBar
      title="Albums"
      ref={ref}
      onBack={() => backs++}
      trailing={
        <Toolbar.Group>
          <Toolbar.Button>Share</Toolbar.Button>
        </Toolbar.Group>
      }
    />,
  );
  expect(ref.current).toBe(host.querySelector('[data-lenso-slot="navigation-bar"]'));
  expect(host.querySelectorAll("h1").length).toBe(1);
  expect(
    host.querySelector('[data-lenso-slot="navigation-bar-title"]')?.getAttribute("aria-hidden"),
  ).toBe("true");
  await act(() => host.querySelector<HTMLButtonElement>('button[aria-label="Back"]')!.click());
  expect(backs).toBe(1);
  await act(() =>
    root.render(
      <NavigationBar
        title="Details"
        ref={ref}
        large={false}
        level={2}
        disabled
        onBack={() => backs++}
      />,
    ),
  );
  expect(host.querySelectorAll("h2").length).toBe(1);
  expect(host.querySelector('[data-lenso-slot="navigation-bar-large-title"]')).toBeNull();
  await act(() => host.querySelector<HTMLButtonElement>('button[aria-label="Back"]')!.click());
  expect(backs).toBe(1);
  await act(() => root.unmount());
  expect(ref.current).toBeNull();
});
