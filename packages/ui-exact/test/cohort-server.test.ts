import { test, expect } from "bun:test";
import { mkdtemp, rm, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { serveCohort } from "./cohort-server";
// Path-prefix fixtures missed Exact's root-relative base, invalidating old/new isolation.
test("comparison origins isolate root-based Exact application resources", async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "exact-cohort-"));
  const servers = [];
  try {
    for (const name of ["before", "after"]) {
      const dir = path.join(temporary, name);
      await mkdir(dir);
      await Bun.write(
        path.join(dir, "index.html"),
        '<base href="/"><script src="./app.js"></script>',
      );
      await Bun.write(path.join(dir, "app.js"), `const cohort = '${name}';`);
      servers.push(serveCohort(dir));
    }
    expect(new URL(servers[0]!.url).origin).not.toBe(new URL(servers[1]!.url).origin);
    for (const [index, name] of ["before", "after"].entries()) {
      const url = servers[index]!.url;
      const html = await (await fetch(url)).text();
      expect(html).toContain('<base href="/">');
      const resource = new URL("./app.js", new URL("/", url));
      expect(await (await fetch(resource)).text()).toBe(`const cohort = '${name}';`);
    }
  } finally {
    for (const server of servers) server.stop();
    await rm(temporary, { recursive: true, force: true });
  }
});
