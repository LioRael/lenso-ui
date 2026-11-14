import { createRoot } from "react-dom/client";
import { ThemeScope } from "@lenso/ui";
import { ActionSheetStory } from "../src/stories/action-sheet-demo";
import { Basic as DatePickerStory } from "../src/demos/stories/date-picker";
import { Basic as DateRangePickerStory } from "../src/demos/stories/date-range-picker";
import "../src/styles/global.css";

const query = new URLSearchParams(location.search);
const component = query.get("component");
createRoot(document.getElementById("fixture")!).render(
  <ThemeScope theme={query.get("theme") === "dark" ? "dark" : "light"}>
    <main style={{ padding: 24 }}>
      {component === "action-sheet" ? (
        <ActionSheetStory />
      ) : component === "date-picker" ? (
        <DatePickerStory />
      ) : (
        <DateRangePickerStory />
      )}
    </main>
  </ThemeScope>,
);
