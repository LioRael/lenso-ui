import type { Preview } from "@storybook/react-vite";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { createElement } from "react";
import "@lenso/tokens/styles.css";

const preview: Preview = {
  globalTypes: {
    theme: { toolbar: { icon: "circlehollow", items: ["light", "dark"], dynamicTitle: true } },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (story, context) => {
      document.documentElement.setAttribute("data-theme", context.globals["theme"]);
      return createElement(
        DirectionProvider,
        { direction: document.documentElement.dir === "rtl" ? "rtl" : "ltr" },
        story(),
      );
    },
  ],
  parameters: { layout: "centered", controls: { expanded: true } },
};
export default preview;
