import {
  Tabs,
  TabBar,
  Switch,
  Slider,
  Glass,
  GlassButton,
  GlassToggleButton,
  GlassContainer,
  Toolbar,
  ThemeScope,
  type TabsRootProps,
} from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const styles = stylex.create({
  page: { display: "grid", gap: 24, padding: 24 },
  tall: { minHeight: 44, width: 112 },
  padded: { padding: 8 },
  customIndicator: { backgroundColor: "rgb(90, 40, 180)" },
  slider: { width: 260 },
  glass: { width: 240, height: 64, borderRadius: 24 },
  overflow: { width: 280, maxWidth: "100%" },
  wide: { width: 1000 },
});
const tabCases: { name: string; props: TabsRootProps; custom?: boolean }[] = [
  { name: "plain-second", props: { defaultValue: "two" } },
  { name: "glass-third-large", props: { defaultValue: "three", glass: true, size: "lg" } },
  { name: "custom-height-padding", props: { defaultValue: "two", glass: true }, custom: true },
  { name: "vertical-third", props: { defaultValue: "three", orientation: "vertical" } },
  { name: "rtl-second", props: { defaultValue: "two", glass: true, dir: "rtl" } },
  { name: "empty-selection", props: { defaultValue: null, glass: true } },
];

const overflowChoices = ["Overview", "Analytics", "Reports", "Disabled", "Billing", "Privacy"];
function OverflowExample({
  direction = "ltr",
  controlled = false,
}: {
  direction?: "ltr" | "rtl";
  controlled?: boolean;
}) {
  const [wide, setWide] = useState(false);
  const [requested, setRequested] = useState("");
  return (
    <section data-overflow-case={controlled ? "controlled" : direction} dir={direction}>
      <Tabs
        defaultValue={direction === "rtl" ? "Privacy" : "Overview"}
        {...(controlled
          ? { value: "Overview", onValueChange: (value) => setRequested(String(value)) }
          : {})}
        xstyle={[styles.overflow, wide && styles.wide]}
      >
        <Tabs.ListContainer>
          <Tabs.List aria-label="Sections">
            {overflowChoices.map((label) => (
              <Tabs.Tab key={label} value={label} disabled={label === "Disabled"}>
                {label}
              </Tabs.Tab>
            ))}
            <Tabs.Indicator />
          </Tabs.List>
        </Tabs.ListContainer>
        {overflowChoices.map((label) => (
          <Tabs.Panel key={label} value={label}>
            {label} content
          </Tabs.Panel>
        ))}
      </Tabs>
      <button type="button" onClick={() => setWide(!wide)}>
        Resize tabs
      </button>
      <output>{requested}</output>
    </section>
  );
}

export function FirstPaintFixture({ theme }: { theme: "light" | "dark" }) {
  return (
    <ThemeScope theme={theme} xstyle={styles.page}>
      <OverflowExample />
      <OverflowExample direction="rtl" />
      <OverflowExample controlled />
      {tabCases.map((entry) => (
        <section key={entry.name} data-case={entry.name}>
          <Tabs {...entry.props}>
            <Tabs.List aria-label={entry.name} xstyle={entry.custom ? styles.padded : undefined}>
              {["one", "two", "three"].map((value) => (
                <Tabs.Tab key={value} value={value} xstyle={entry.custom ? styles.tall : undefined}>
                  {value}
                </Tabs.Tab>
              ))}
              <Tabs.Indicator xstyle={entry.custom ? styles.customIndicator : undefined} />
            </Tabs.List>
          </Tabs>
        </section>
      ))}
      {(["sm", "md", "lg"] as const).flatMap((size) =>
        [false, true].map((checked) => (
          <section key={`${size}-${checked}`} data-case={`switch-${size}-${checked}`}>
            <Switch defaultChecked={checked} size={size}>
              <Switch.Content>
                <Switch.Control data-check-box="track">
                  <Switch.Thumb data-check-box="thumb" />
                </Switch.Control>
                Switch
              </Switch.Content>
            </Switch>
          </section>
        )),
      )}
      <section data-case="slider">
        <Slider defaultValue={35} xstyle={styles.slider}>
          <Slider.Label>Volume</Slider.Label>
          <Slider.Control data-check-box="control">
            <Slider.Track data-check-box="track">
              <Slider.Fill />
            </Slider.Track>
            <Slider.Thumb data-check-box="thumb" aria-label="Volume" />
          </Slider.Control>
        </Slider>
      </section>
      <section data-case="glass">
        <Glass xstyle={styles.glass} data-check-box="surface">
          Glass
        </Glass>
      </section>
      <section data-case="glass-button">
        <GlassButton data-check-box="button">Action</GlassButton>
      </section>
      <section data-case="glass-toggle">
        <GlassToggleButton pressed data-check-box="button">
          Favorite
        </GlassToggleButton>
      </section>
      <section data-case="glass-container">
        <GlassContainer data-check-box="container">
          <GlassButton data-check-box="first">One</GlassButton>
          <GlassButton data-check-box="second">Two</GlassButton>
        </GlassContainer>
      </section>
      <section data-case="toolbar">
        <Toolbar aria-label="Actions" data-check-box="toolbar">
          <Toolbar.Button data-check-box="button">Action</Toolbar.Button>
        </Toolbar>
      </section>
      <section data-case="tab-bar">
        <TabBar>
          <TabBar.Group>
            <TabBar.Link href="#one">One</TabBar.Link>
            <TabBar.Link href="#two">Two</TabBar.Link>
            <TabBar.Link href="#three" isCurrent>
              Three
            </TabBar.Link>
          </TabBar.Group>
        </TabBar>
      </section>
    </ThemeScope>
  );
}
