import type { Preview } from "@storybook/react-vite";
import "@lenso/tokens/styles.css";

const preview: Preview = {
  globalTypes: {
    theme: { toolbar: { icon: "circlehollow", items: ["light", "dark"], dynamicTitle: true } },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (story, context) => {
      document.documentElement.setAttribute("data-theme", context.globals["theme"]);
      return story();
    },
  ],
  parameters: { layout: "centered", controls: { expanded: true } },
};
export default preview;
