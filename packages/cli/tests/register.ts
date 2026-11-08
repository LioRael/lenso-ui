import { plugin } from "bun";

plugin({
  name: "lenso-test-inputs",
  setup(build) {
    build.onResolve(
      { filter: /(?:^@lenso\/ui-devtools\/contract$|^\.\/contract\/index\.ts$)/ },
      () => {
        if (process.env["LENSO_TEST_CONTRACT_CORE"])
          return { path: process.env["LENSO_TEST_CONTRACT_CORE"] };
      },
    );
  },
});
