import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import { SwipeActions } from "@lenso/ui/swipe-actions";
import { WheelPicker } from "@lenso/ui/wheel-picker";
import { List } from "@lenso/ui/list";
import { ThemeScope } from "../../../packages/ui/src/utils/theme-scope";
import * as stylex from "@stylexjs/stylex";

const params = new URLSearchParams(location.search);
const panel = params.get("panel") ?? "both";
const debug = params.has("debug");
const theme = params.get("theme") === "dark" ? "dark" : "light";
const options = Array.from({ length: 60 }, (_, index) => ({
  value: String(index),
  label: String(index),
}));
const rows = ["Design review", "Travel plans", "Weekly notes"];
const styles = stylex.create({
  root: {
    minHeight: "100dvh",
    padding: 16,
    boxSizing: "border-box",
    fontFamily: "var(--lenso-font-body)",
    color: "var(--lenso-label-primary)",
    backgroundColor: "var(--lenso-background-grouped-primary)",
  },
  wheel: { width: 240, maxWidth: "100%", marginInline: "auto", marginBlock: 48 },
  status: { display: "block", fontSize: 15, marginBlock: 16, textAlign: "center" },
  title: { fontSize: 17, fontWeight: 600, marginBlock: "0 16px" },
});
function Fixture() {
  const diagnostics = useRef<HTMLOutputElement>(null);
  useEffect(() => {
    if (!debug) return;
    const counts: Record<string, number> = {};
    const records: string[] = [];
    const report = (event: Event) => {
      counts[event.type] = (counts[event.type] ?? 0) + 1;
      const target = event.target instanceof Element ? event.target : null;
      const pointer = event instanceof PointerEvent ? event : null;
      records.push(
        `${event.type} ${pointer ? `${pointer.clientX.toFixed(0)},${pointer.clientY.toFixed(0)} p=${pointer.isPrimary} b=${pointer.button}` : ""} ${target?.tagName} ${target?.getAttribute("data-lenso-slot") ?? ""}`,
      );
      queueMicrotask(() => {
        if (diagnostics.current)
          diagnostics.current.textContent = `Pointer ${JSON.stringify(counts)} · ${records.slice(-5).join(" | ")} · touch-action ${target ? getComputedStyle(target).touchAction : ""}`;
      });
    };
    const events = [
      "pointerdown",
      "pointermove",
      "pointerup",
      "pointercancel",
      "lostpointercapture",
      "gotpointercapture",
      "touchstart",
      "touchmove",
      "touchend",
      "touchcancel",
    ];
    for (const name of events)
      document.addEventListener(name, report, { capture: true, passive: true });
    return () => {
      for (const name of events) document.removeEventListener(name, report, true);
    };
  }, []);
  const [value, setValue] = useState("15");
  const [actions, setActions] = useState(0);
  const [opened, setOpened] = useState(0);
  return (
    <ThemeScope theme={theme}>
      <main {...stylex.props(styles.root)}>
        {panel === "both" && <h1 {...stylex.props(styles.title)}>iOS controls</h1>}
        {panel !== "wheel" && (
          <>
            <List aria-label="Demo messages">
              {rows.map((row) => (
                <SwipeActions
                  render={<li />}
                  key={row}
                  startActionsLabel={`Leading actions for ${row}`}
                  endActionsLabel={`Trailing actions for ${row}`}
                  startActions={[
                    {
                      id: "archive",
                      label: "Archive",
                      variant: "tint",
                      fullSwipe: true,
                      onAction: () => setActions((count) => count + 1),
                    },
                  ]}
                  endActions={[
                    { id: "more", label: "More", onAction: () => setActions((count) => count + 1) },
                    {
                      id: "delete",
                      label: "Delete",
                      variant: "danger",
                      onAction: () => setActions((count) => count + 1),
                    },
                  ]}
                >
                  <List.Action
                    style={{ minHeight: 68 }}
                    onClick={() => setOpened((count) => count + 1)}
                  >
                    <List.Content>
                      <List.Title>{row}</List.Title>
                      <List.Description>Demo message</List.Description>
                    </List.Content>
                  </List.Action>
                </SwipeActions>
              ))}
            </List>
            <output {...stylex.props(styles.status)}>
              Actions {actions} · Opened {opened}
            </output>
            <SwipeActions
              endActions={[
                { id: "more", label: "More", onAction: () => setActions((count) => count + 1) },
              ]}
            >
              <input
                aria-label="Editable row"
                defaultValue="Select this text"
                style={{ width: "100%", minHeight: 44, fontSize: 17 }}
              />
            </SwipeActions>
          </>
        )}
        {panel !== "swipe" && (
          <>
            <WheelPicker
              aria-label="Minutes"
              options={options}
              value={value}
              onValueChange={(next) => {
                if (next !== null) setValue(next);
              }}
              xstyle={styles.wheel}
            />
            <output {...stylex.props(styles.status)}>Value {value}</output>
          </>
        )}
        {debug && (
          <output
            ref={diagnostics}
            aria-label="Pointer diagnostics"
            style={{ display: "block", fontSize: 11, overflowWrap: "anywhere" }}
          >
            Pointer ready · scrollend {String("onscrollend" in document.documentElement)}
          </output>
        )}
      </main>
    </ThemeScope>
  );
}
document.documentElement.dataset["theme"] = theme;
createRoot(document.getElementById("fixture")!).render(<Fixture />);
