#!/usr/bin/env node
import { run } from "./runtime.mjs";

const help = `Usage: lenso-docs <dev|build|preview> [--port <number>] [--host <host>]

Run from the directory containing docs.config.ts and content/.
dev      Compile content and start a live documentation server (localhost:3000).
build    Export a static site to out/.
preview  Serve the built out/ directory (localhost:4173).

Options:
  --port     Server port (1–65535).
  --host     Bind address; defaults to 127.0.0.1.
  --help     Show this help.
  --version  Show the framework version.`;

try {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.length === 0) {
    console.log(help);
  } else if (args.length === 1 && args[0] === "--version") {
    console.log("0.1.0");
  } else {
    const command = args.shift();
    if (!["dev", "build", "preview"].includes(command))
      throw new Error(`Unknown command "${command}". Use lenso-docs --help.`);
    const options = {};
    while (args.length) {
      const flag = args.shift();
      if (!["--port", "--host"].includes(flag) || !args.length)
        throw new Error(`Invalid option "${flag}". Use lenso-docs --help.`);
      const value = args.shift();
      if (flag === "--port") {
        const port = Number(value);
        if (!/^\d+$/.test(value) || !Number.isInteger(port) || port < 1 || port > 65535)
          throw new Error("--port must be an integer between 1 and 65535.");
        options.port = port;
      } else {
        if (!value || value.startsWith("-")) throw new Error("--host requires a bind address.");
        options.host = value;
      }
    }
    if (command === "build" && Object.keys(options).length)
      throw new Error("build does not accept server options.");
    await run(command, process.cwd(), options);
  }
} catch (error) {
  console.error(`lenso-docs: ${error.message}`);
  process.exitCode = 1;
}
