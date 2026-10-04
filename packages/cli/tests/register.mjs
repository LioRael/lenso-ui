import { registerHooks } from "node:module";

// Isolated clones may not have root workspace installs. Redirect only the shared parser's test import.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier.endsWith("/tooling/lenso-contracts/index.mjs") &&
      process.env.LENSO_TEST_CONTRACT_CORE
    )
      return nextResolve(new URL(`file://${process.env.LENSO_TEST_CONTRACT_CORE}`).href, context);
    if (specifier === "@babel/parser")
      return nextResolve(
        new URL("../node_modules/@babel/parser/lib/index.js", import.meta.url).href,
        context,
      );
    return nextResolve(specifier, context);
  },
});
