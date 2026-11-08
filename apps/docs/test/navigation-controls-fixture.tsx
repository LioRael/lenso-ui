import { useRef, useState } from "react";
import { NavigationBar } from "@lenso/ui/navigation-bar";
import { PageControl } from "@lenso/ui/page-control";
import { Toolbar } from "@lenso/ui/toolbar";
import { I18nProvider } from "../../../packages/ui/src/utils/locale";
import { ThemeScope } from "../../../packages/ui/src/utils/theme-scope";
import { NavigationBarStory } from "../src/stories/navigation-bar";

export function NavigationControlsFixture({ dark = false }: { dark?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inline, setInline] = useState(false);
  const [backs, setBacks] = useState(0);
  const [page, setPage] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [rtl, setRtl] = useState(false);
  return (
    <I18nProvider locale={rtl ? "ar" : "en"}>
      <ThemeScope theme={dark ? "dark" : "light"} dir={rtl ? "rtl" : "ltr"}>
        <main style={{ padding: 16 }}>
          <button onClick={() => setInline(!inline)}>Toggle large title</button>
          <button onClick={() => setDisabled(!disabled)}>Toggle disabled</button>
          <button onClick={() => setRtl(!rtl)}>Toggle direction</button>
          <output aria-label="Back count">{backs}</output>
          <div
            data-case="page-variants"
            style={{
              display: "flex",
              gap: 24,
              padding: 16,
              background: "var(--lenso-background-primary)",
            }}
          >
            <div>
              <p>Prominent</p>
              <PageControl aria-label="Prominent comparison" count={6} variant="prominent" />
            </div>
            <div>
              <p>Plain</p>
              <PageControl aria-label="Plain comparison" count={6} variant="plain" />
            </div>
          </div>
          <div
            data-case="explicit"
            ref={scrollRef}
            style={{
              height: 260,
              overflowY: "auto",
              position: "relative",
              marginBlock: 16,
              background: "var(--lenso-background-grouped-primary)",
            }}
          >
            <NavigationBar
              title="Albums with a long translated screen title"
              large={!inline}
              scrollRef={scrollRef}
              onBack={() => setBacks(backs + 1)}
              trailing={
                <Toolbar.Group>
                  <Toolbar.Button onClick={() => setInline(!inline)}>Title</Toolbar.Button>
                </Toolbar.Group>
              }
            />
            <div style={{ height: 700, padding: 16 }}>
              Scroll this content to collapse the title.
            </div>
          </div>
          <div
            data-case="inferred"
            style={{ height: 180, overflowY: "auto", position: "relative" }}
          >
            <NavigationBar title="Automatic scroll owner" edge="soft" />
            <div style={{ height: 600 }}>Content</div>
          </div>
          <div data-case="ltr">
            <PageControl aria-label="Windowed pages" count={20} disabled={disabled} />
          </div>
          <I18nProvider locale="ar">
            <div dir="rtl" data-case="rtl">
              <PageControl aria-label="RTL pages" count={20} variant="plain" />
            </div>
          </I18nProvider>
          <div data-case="controlled">
            <PageControl
              aria-label="Controlled pages"
              count={20}
              page={page}
              onPageChange={setPage}
            />
          </div>
          <div data-case="rejected">
            <PageControl aria-label="Rejected pages" count={20} page={0} onPageChange={() => {}} />
          </div>
          <div data-case="prevented">
            <PageControl
              aria-label="Prevented pages"
              count={4}
              onKeyDown={(event) => event.preventDefault()}
            />
          </div>
          <div data-case="story">
            <NavigationBarStory large edge="uniform" />
          </div>
          <NavigationBar title="Document scroll owner" edge="soft" />
          <div style={{ height: 1100 }}>Document content</div>
        </main>
      </ThemeScope>
    </I18nProvider>
  );
}
