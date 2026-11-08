import { expect, test } from "bun:test";
import { act, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { usePhotosDragSelection } from "../src/components/photos-drag-selection";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
function Fixture() {
  const viewport = useRef<HTMLDivElement>(null);
  const [selected, onChange] = useState(new Set<number>());
  const grid = usePhotosDragSelection({
    active: true,
    ids: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    selected,
    onChange,
    viewport,
  });
  return (
    <div ref={viewport}>
      <section ref={grid}>
        {Array.from({ length: 9 }, (_, id) => (
          <button key={id} data-selection-id={id} aria-pressed={selected.has(id)}>
            Photo {id}
          </button>
        ))}
      </section>
    </div>
  );
}
test("drag flushes its last endpoint, suppresses the trailing click and permits vertical scrolling", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(() => root.render(<Fixture />));
    const viewport = host.firstElementChild as HTMLElement;
    viewport.getBoundingClientRect = () =>
      ({ left: 0, top: 0, right: 300, bottom: 600, width: 300, height: 600 }) as DOMRect;
    const grid = viewport.firstElementChild as HTMLElement;
    let captured = -1;
    grid.setPointerCapture = (id) => {
      captured = id;
    };
    grid.hasPointerCapture = (id) => captured === id;
    grid.releasePointerCapture = () => {
      captured = -1;
    };
    const tiles = [...grid.querySelectorAll("button")];
    tiles.forEach((tile, i) => {
      tile.getBoundingClientRect = () =>
        ({
          left: (i % 3) * 100,
          right: ((i % 3) + 1) * 100,
          top: 100 + Math.floor(i / 3) * 100,
          bottom: 200 + Math.floor(i / 3) * 100,
        }) as DOMRect;
    });
    function pointer(target: Element, type: string, x: number, y: number) {
      target.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          pointerId: 1,
          isPrimary: true,
          clientX: x,
          clientY: y,
          button: 0,
        }),
      );
    }
    await act(() => {
      pointer(tiles[0]!, "pointerdown", 20, 150);
      pointer(grid, "pointermove", 280, 150);
      pointer(grid, "pointerup", 280, 150);
    });
    expect(tiles.filter((tile) => tile.getAttribute("aria-pressed") === "true")).toHaveLength(3);
    const click = new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 });
    expect(tiles[0]!.dispatchEvent(click)).toBe(false);
    await act(() => {
      pointer(tiles[0]!, "pointerdown", 20, 150);
      pointer(grid, "pointermove", 21, 200);
      pointer(grid, "pointerup", 21, 200);
    });
    expect(captured).toBe(-1);
    expect(tiles.filter((tile) => tile.getAttribute("aria-pressed") === "true")).toHaveLength(3);
  } finally {
    await act(() => root.unmount());
    host.remove();
  }
});
