import { defineConfig } from "vite";
import storybook from "../../../storybook/.storybook/main";

export default defineConfig(async () => ({
  // The current callback only reads its first argument; use the actual consumer compiler config.
  ...(await Reflect.apply(storybook.viteFinal!, storybook, [{}])),
  build: { minify: false },
}));
