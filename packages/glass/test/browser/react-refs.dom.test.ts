import { expect, test } from "bun:test";
import { act, createElement, StrictMode, type Ref } from "react";
import { createRoot } from "react-dom/client";
import { useElasticRef } from "../../src/react/elastic.js";
import { useGlassRef } from "../../src/react/refraction.js";

// Removing only the host node must release resources while its hook owner survives.
for (const kind of ["elastic", "glass"] as const) {
  for (const strict of [false, true]) {
    for (const refKind of ["cleanup", "legacy", "object"] as const) {
      test(`${kind} releases removed and replaced nodes (${refKind}, strict=${strict})`, async () => {
        const environment = globalThis as typeof globalThis & {
          IS_REACT_ACT_ENVIRONMENT?: boolean;
        };
        const previousEnvironment = environment.IS_REACT_ACT_ENVIRONMENT;
        environment.IS_REACT_ACT_ENVIRONMENT = true;
        const host = document.createElement("div");
        document.body.append(host);
        const root = createRoot(host);
        const attached = new Set<HTMLButtonElement>();
        const objectRef = { current: null as HTMLButtonElement | null };
        let nullCalls = 0;
        const external: Ref<HTMLButtonElement> =
          refKind === "object"
            ? objectRef
            : (node) => {
                if (!node) {
                  nullCalls++;
                  attached.clear();
                  return;
                }
                attached.add(node);
                if (refKind === "cleanup")
                  return () => {
                    attached.delete(node);
                  };
              };
        function Owner({ id, enabled }: { id: string | null; enabled: boolean }) {
          const elastic = useElasticRef(kind === "elastic" ? external : undefined, {
            enabled: kind === "elastic" && enabled,
          });
          const glass = useGlassRef(
            kind === "glass" ? external : undefined,
            kind === "glass" && enabled,
            false,
            undefined,
            undefined,
            false,
            false,
            true,
          );
          return createElement(
            "div",
            { "data-material-hidden": "" },
            id === null
              ? null
              : createElement("button", { key: id, ref: kind === "elastic" ? elastic : glass }),
          );
        }
        const render = async (id: string | null, enabled = true) => {
          await act(async () => {
            const owner = createElement(Owner, { id, enabled });
            root.render(strict ? createElement(StrictMode, null, owner) : owner);
          });
        };
        const attribute = kind === "elastic" ? "data-lenso-pressed" : "data-lenso-key-pressed";
        const press = (node: HTMLButtonElement) => {
          node.getBoundingClientRect = () => new DOMRect(0, 0, 60, 60);
          node.dispatchEvent(
            kind === "elastic"
              ? new PointerEvent("pointerdown", {
                  pointerId: 1,
                  isPrimary: true,
                  button: 0,
                  clientX: 30,
                  clientY: 30,
                })
              : new KeyboardEvent("keydown", { key: "Enter" }),
          );
        };
        const expectDetached = (node: HTMLButtonElement) => {
          expect(node.hasAttribute(attribute)).toBe(false);
          press(node);
          expect(node.hasAttribute(attribute)).toBe(false);
          expect(attached.has(node)).toBe(false);
        };
        try {
          await render("first");
          const first = host.querySelector("button")!;
          press(first);
          expect(first.hasAttribute(attribute)).toBe(true);
          await render(null);
          expectDetached(first);
          expect(objectRef.current).toBe(null);
          await render("second");
          const second = host.querySelector("button")!;
          press(second);
          expect(second.hasAttribute(attribute)).toBe(true);
          await render("third");
          expectDetached(second);
          const third = host.querySelector("button")!;
          press(third);
          expect(third.hasAttribute(attribute)).toBe(true);
          await render("third", false);
          expect(third.hasAttribute(attribute)).toBe(false);
          press(third);
          expect(third.hasAttribute(attribute)).toBe(false);
          await render("third", true);
          press(third);
          expect(third.hasAttribute(attribute)).toBe(true);
          await render(null);
          expectDetached(third);
          expect(attached.size).toBe(0);
          expect(objectRef.current).toBe(null);
          if (refKind === "cleanup") expect(nullCalls).toBe(0);
          if (refKind === "legacy") expect(nullCalls).toBeGreaterThanOrEqual(3);
        } finally {
          await act(async () => root.unmount());
          host.remove();
          environment.IS_REACT_ACT_ENVIRONMENT = previousEnvironment;
        }
      });
    }
  }
}
