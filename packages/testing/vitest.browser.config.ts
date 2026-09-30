import { browserConfig } from "./src/browser.js";

export default browserConfig({
  test: { include: ["tests/**/*.browser.test.tsx"] },
});
