import { useLayoutEffect, useState, type RefObject } from "react";

interface OverflowTab {
  node: HTMLElement;
  label: string;
  disabled: boolean;
}

export function useTabsOverflow(host: RefObject<HTMLDivElement | null>, enabled: boolean) {
  const [overflow, setOverflow] = useState<OverflowTab[]>([]);
  useLayoutEffect(() => {
    const container = host.current;
    if (!container || !enabled) return;
    const list = container.querySelector<HTMLElement>('[data-slot="tabs-list"]');
    if (!list) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const tabs = [...list.querySelectorAll<HTMLElement>('[data-slot="tabs-tab"]')];
      for (const tab of tabs) tab.removeAttribute("data-tabs-overflow");
      const available = container.clientWidth;
      if (!available) return;
      const style = getComputedStyle(list);
      const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const gap = parseFloat(style.columnGap) || 0;
      const scale = list.getBoundingClientRect().width / list.offsetWidth || 1;
      const items = tabs.filter((tab) => !tab.hidden && getComputedStyle(tab).display !== "none");
      const widths = items.map((tab) => tab.getBoundingClientRect().width / scale);
      const total =
        widths.reduce((sum, width) => sum + width, padding) + gap * Math.max(0, items.length - 1);
      const visible = new Set<HTMLElement>();
      if (total <= available + 0.5) {
        for (const tab of items) visible.add(tab);
      } else {
        // Keep the selected panel's tab on the bar, including after menu selection.
        const active = items.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
        let used = padding + 36 + 4;
        if (active >= 0) {
          visible.add(items[active]!);
          used += widths[active]!;
        }
        for (const [index, tab] of items.entries()) {
          if (visible.has(tab)) continue;
          const next = widths[index]! + (visible.size ? gap : 0);
          if (used + next > available + 0.5) break;
          visible.add(tab);
          used += next;
        }
      }
      const hidden = items.filter((tab) => !visible.has(tab));
      for (const tab of hidden) tab.setAttribute("data-tabs-overflow", "");
      if (hidden.includes(container.ownerDocument.activeElement as HTMLElement)) {
        items
          .find((tab) => visible.has(tab) && tab.getAttribute("aria-selected") === "true")
          ?.focus({ preventScroll: true });
      }
      const next = hidden.map((node) => ({
        node,
        label: node.getAttribute("aria-label") ?? node.textContent?.trim() ?? "",
        disabled: node.matches(":disabled, [data-disabled], [aria-disabled='true']"),
      }));
      setOverflow((previous) =>
        previous.length === next.length &&
        previous.every(
          (item, index) =>
            item.node === next[index]!.node &&
            item.label === next[index]!.label &&
            item.disabled === next[index]!.disabled,
        )
          ? previous
          : next,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const resize = new ResizeObserver(schedule);
    const observe = () => {
      resize.disconnect();
      resize.observe(container);
      resize.observe(list);
      for (const tab of list.querySelectorAll('[data-slot="tabs-tab"]')) resize.observe(tab);
    };
    const mutations = new MutationObserver((records) => {
      if (
        records.every((record) =>
          (record.target instanceof Element ? record.target : record.target.parentElement)?.closest(
            '[data-slot="tabs-row"], [data-slot="tabs-centre-row"]',
          ),
        )
      )
        return;
      observe();
      schedule();
    });
    mutations.observe(list, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["aria-selected", "aria-label", "disabled", "hidden", "class"],
    });
    observe();
    measure();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutations.disconnect();
      for (const tab of list.querySelectorAll("[data-tabs-overflow]"))
        tab.removeAttribute("data-tabs-overflow");
    };
  }, [host, enabled]);
  return overflow;
}
