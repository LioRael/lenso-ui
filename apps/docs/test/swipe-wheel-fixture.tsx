import { useState } from "react";
import { SwipeActions } from "@lenso/ui/swipe-actions";
import { WheelPicker } from "@lenso/ui/wheel-picker";
import { I18nProvider } from "../../../packages/ui/src/utils/locale";
import { ThemeScope } from "../../../packages/ui/src/utils/theme-scope";
import { SwipeActionsStory } from "../src/stories/swipe-actions";
import { WheelPickerStory } from "../src/stories/wheel-picker";
const options = Array.from({ length: 12 }, (_, index) => ({
  value: String(index),
  label: `${index} minutes`,
  disabled: index === 3,
}));
export function SwipeWheelFixture({ dark = false }: { dark?: boolean }) {
  const [rtl, setRtl] = useState(false);
  const [count, setCount] = useState(0);
  const [opened, setOpened] = useState(0);
  const [disabled, setDisabled] = useState(false);
  return (
    <I18nProvider locale={rtl ? "ar" : "en"}>
      <ThemeScope theme={dark ? "dark" : "light"} dir={rtl ? "rtl" : "ltr"}>
        <main style={{ padding: 16 }}>
          <button onClick={() => setRtl(!rtl)}>Toggle direction</button>
          <button onClick={() => setDisabled(!disabled)}>Toggle disabled</button>
          <output aria-label="Actions executed">{count}</output>
          <output aria-label="Rows opened">{opened}</output>
          <div data-case="scroll" style={{ height: 180, overflowY: "auto", marginBlock: 16 }}>
            <SwipeActions
              data-case="row"
              disabled={disabled}
              startActions={[
                {
                  id: "archive",
                  label: "Archive",
                  variant: "tint",
                  fullSwipe: true,
                  onAction: () => setCount(count + 1),
                },
              ]}
              endActions={[
                {
                  id: "delete",
                  label: "Delete",
                  variant: "danger",
                  onAction: () => setCount(count + 1),
                },
              ]}
            >
              <button onClick={() => setOpened(opened + 1)}>Open message</button>
            </SwipeActions>
            <div style={{ height: 500 }}>Scrollable content</div>
          </div>
          <form data-case="wheel-form">
            <WheelPicker
              aria-label="Minutes"
              name="minutes"
              options={options}
              defaultValue="2"
              disabled={disabled}
            />
            <button type="reset">Reset</button>
          </form>
          <WheelPicker
            data-case="rejected"
            aria-label="Rejected minutes"
            options={options}
            value="2"
          />
          <div data-case="swipe-story">
            <SwipeActionsStory disabled={false} fullSwipe />
          </div>
          <div data-case="wheel-story">
            <WheelPickerStory disabled={false} />
          </div>
          <WheelPicker aria-label="Empty wheel" options={[]} />
        </main>
      </ThemeScope>
    </I18nProvider>
  );
}
