import { createRoot } from "react-dom/client";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { SegmentedControl } from "@lenso/ui/segmented-control";
import { SectionIndex } from "@lenso/ui/section-index";
import { Tabs } from "@lenso/ui/tabs";
import { I18nProvider } from "../../../packages/ui/src/utils/locale";
import { ThemeScope } from "../../../packages/ui/src/utils/theme-scope";
const s = stylex.create({
  root: {
    padding: 16,
    backgroundColor: "var(--lenso-background-primary)",
    color: "var(--lenso-label-primary)",
    fontFamily: "var(--lenso-font-body)",
  },
  group: { display: "flex", marginBlock: 16 },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 44px",
    gap: 8,
    height: 240,
    overflowY: "auto",
    scrollbarWidth: "none",
    overscrollBehaviorY: "contain",
  },
  index: { position: "sticky", top: 0, alignSelf: "start" },
  section: { minHeight: 200, scrollMarginBlockStart: 0 },
});
const choices = [
  { value: "all", label: "All" },
  { value: "disabled", label: "Disabled", disabled: true },
  { value: "unread", label: "Unread" },
];
const entries = ["A", "B", "C", "D"].map((label) => ({
  value: label,
  label,
  href: `#section-${label}` as const,
  disabled: label === "B",
}));
function Fixture() {
  const [rtl, setRtl] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [cancelReset, setCancelReset] = useState(false);
  const [large, setLarge] = useState(false);
  const [glass, setGlass] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [active, setActive] = useState("A");
  const [count, setCount] = useState(0);
  const dark = new URLSearchParams(location.search).has("dark");
  return (
    <I18nProvider locale={rtl ? "ar" : "en"}>
      <ThemeScope theme={dark ? "dark" : "light"} dir={rtl ? "rtl" : "ltr"}>
        <main {...stylex.props(s.root)}>
          <button onClick={() => setRtl(!rtl)}>Toggle direction</button>
          <button onClick={() => setDisabled(!disabled)}>Toggle disabled</button>
          <button onClick={() => setCancelReset(!cancelReset)}>Toggle reset cancellation</button>
          <button onClick={() => setLarge(!large)}>Toggle size</button>
          <button onClick={() => setGlass(!glass)}>Toggle glass</button>
          <button onClick={() => setEmpty(!empty)}>Toggle options</button>
          <form
            onReset={(event) => {
              if (cancelReset) event.preventDefault();
            }}
          >
            <SegmentedControl
              aria-label="Filter"
              items={empty ? [] : choices}
              name="filter"
              defaultValue="all"
              disabled={disabled}
              size={large ? "lg" : "sm"}
              glass={glass}
              xstyle={s.group}
            />
            <button type="reset">Reset filter</button>
          </form>
          <Tabs defaultValue="all" size={large ? "lg" : "sm"} glass={glass} xstyle={s.group}>
            <Tabs.List aria-label="Filter panels">
              {choices.map((item) => (
                <Tabs.Tab key={item.value} value={item.value} disabled={item.disabled}>
                  {item.label}
                </Tabs.Tab>
              ))}
              <Tabs.Indicator />
            </Tabs.List>
            {choices.map((item) => (
              <Tabs.Panel key={item.value} value={item.value}>
                {item.label} panel
              </Tabs.Panel>
            ))}
          </Tabs>
          <SegmentedControl
            aria-label="Rejected"
            items={choices}
            value="all"
            onValueChange={(_value, details) => details.cancel()}
            xstyle={s.group}
          />
          <SegmentedControl
            aria-label="Read only"
            items={choices}
            defaultValue="all"
            readOnly
            xstyle={s.group}
          />
          <SegmentedControl aria-label="Empty" items={[]} xstyle={s.group} />
          <div {...stylex.props(s.layout)} data-case="sections">
            <div>
              {entries.map((entry) => (
                <section key={entry.value} {...stylex.props(s.section)}>
                  <h2 id={`section-${entry.value}`}>{entry.label}</h2>
                  <p>Section {entry.label}</p>
                </section>
              ))}
            </div>
            <SectionIndex
              aria-label="Letters"
              items={entries}
              value={active}
              onValueChange={(value) => {
                if (value === null) return;
                setActive(value);
                setCount((count) => count + 1);
              }}
              disabled={disabled}
              xstyle={s.index}
            />
          </div>
          <output aria-label="Index activations">{count}</output>
          <button id="after">After index</button>
        </main>
      </ThemeScope>
    </I18nProvider>
  );
}
createRoot(document.getElementById("fixture")!).render(<Fixture />);
