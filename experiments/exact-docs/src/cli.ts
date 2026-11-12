#!/usr/bin/env bun
import { cp, mkdir, readdir, realpath } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { buildNative, buildSite, loadSite } from "./index.ts";
import { startDev } from "./server.ts";

const help = `exact-docs <command> [directory] [options]

  new <directory>   Create Markdown and interactive Exact example pages
  dev [directory]   Preview locally, rebuild and reload on edits
  build [directory] Export a website or build a native Apple app
  validate [dir]    Check configuration, page sources, links and heading targets

Options: --port 3000 (dev), --out dist (web build), --platform web|macos|ios,
         --run (native build), --sim <name|udid> (iOS), --help
Build and dev require EXACT_ROOT pointing to an initialized expo/exact checkout.
This is a local prototype; validate does not replace Exact compilation.`;

export async function main(args = process.argv.slice(2)) {
  const { positionals, values } = parseArgs({
    args,
    allowPositionals: true,
    strict: true,
    options: {
      port: { type: "string" },
      out: { type: "string" },
      help: { type: "boolean", short: "h" },
      platform: { type: "string" },
      run: { type: "boolean" },
      sim: { type: "string" },
    },
  });
  const [command, directory] = positionals;
  if (values.help || !command) {
    console.log(help);
    return;
  }
  if (positionals.length > 2) throw new Error("Too many arguments");
  if (command !== "build" && (values.platform || values.run || values.sim))
    throw new Error("--platform, --run and --sim are build options");
  if (command === "new") {
    if (!directory) throw new Error("Usage: exact-docs new <directory>");
    const root = path.resolve(directory);
    await mkdir(root);
    const example = path.resolve(import.meta.dirname, "../example");
    for (const file of await readdir(example)) {
      if (file.startsWith(".") || file === "dist") continue;
      await cp(path.join(example, file), path.join(root, file), { recursive: true });
    }
    const configFile = Bun.file(path.join(root, "docs.json"));
    await Bun.write(
      configFile,
      JSON.stringify({ ...(await configFile.json()), theme: "lenso" }, null, 2) + "\n",
    );
    await Bun.write(
      path.join(root, "docs.ts"),
      `import { main } from ${JSON.stringify(path.resolve(import.meta.dirname, "cli.ts"))};\nawait main();\n`,
    );
    await Bun.write(
      path.join(root, "package.json"),
      JSON.stringify(
        {
          private: true,
          type: "module",
          scripts: {
            dev: "bun docs.ts dev",
            build: "bun docs.ts build",
            macos: "bun docs.ts build --platform macos",
            ios: "bun docs.ts build --platform ios",
            validate: "bun docs.ts validate",
          },
        },
        null,
        2,
      ),
    );
    await Bun.write(path.join(root, ".gitignore"), ".exact-docs/\ndist/\n");
    console.log(`Created ${root}\n\ncd ${JSON.stringify(root)}\nbun run dev`);
    return;
  }
  const root = await realpath(directory ?? ".");
  if (command === "validate") {
    const site = await loadSite(root);
    console.log(`Validated ${site.documents.length} pages and their Markdown links`);
  } else if (command === "build") {
    const platform = values.platform ?? "web";
    if (platform !== "web" && platform !== "macos" && platform !== "ios")
      throw new Error("Platform must be web, macos or ios");
    if (platform !== "web") {
      if (values.out)
        throw new Error("--out is for Web exports; Exact manages native bundle paths");
      const result = await buildNative(root, { platform, run: values.run, sim: values.sim });
      console.log(`Built ${platform} application → ${result.out}`);
      return;
    }
    if (values.run || values.sim) throw new Error("--run and --sim require a native platform");
    const result = await buildSite(root, {
      out: values.out ? path.resolve(root, values.out) : undefined,
    });
    console.log(`Built ${result.site.documents.length} pages → ${result.out}`);
  } else if (command === "dev") {
    const port = Number(values.port ?? 3000);
    if (!Number.isInteger(port) || port < 0 || port > 65535)
      throw new Error("Port must be an integer from 0 to 65535");
    const dev = await startDev(root, port);
    console.log(`Exact Docs preview: ${dev.url}`);
    for (const signal of ["SIGINT", "SIGTERM"] as const)
      process.once(signal, () => {
        void dev.stop().then(() => process.exit(0));
      });
  } else throw new Error(`Unknown command: ${command}\n${help}`);
}

if (import.meta.main)
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
