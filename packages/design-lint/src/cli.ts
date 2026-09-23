#!/usr/bin/env node

import { dirname, resolve } from "node:path";

import {
  loadConfig,
  lintFiles,
  resolveFilePatterns,
  type DesignLintConfig,
  type LintResult,
} from "./index.js";

interface CliOptions {
  configPath: string;
  format: "compact" | "json";
  patterns: string[];
  help: boolean;
}

const printUsage = (): void => {
  console.log(`Usage: design-lint [--config path] [--format compact|json] [files...]

When no files are supplied, config.files is used. File patterns in config.files
are resolved relative to the config file; command-line paths are resolved
relative to the current working directory.`);
};

const parseArgs = (args: string[]): CliOptions => {
  let configPath = "design-lint.config.json";
  let format: CliOptions["format"] = "compact";
  const patterns: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]!;
    if (argument === "--help" || argument === "-h") {
      printUsage();
      return { configPath, format, patterns, help: true };
    }
    if (argument === "--json") {
      format = "json";
      continue;
    }
    if (argument === "--format") {
      const next = args[index + 1];
      if (next !== "compact" && next !== "json")
        throw new Error('Expected "compact" or "json" after --format.');
      format = next;
      index += 1;
      continue;
    }
    if (argument.startsWith("--format=")) {
      const value = argument.slice("--format=".length);
      if (value !== "compact" && value !== "json")
        throw new Error('Expected "compact" or "json" after --format=');
      format = value;
      continue;
    }
    if (argument === "--config") {
      const next = args[index + 1];
      if (!next) throw new Error("Expected a path after --config.");
      configPath = next;
      index += 1;
      continue;
    }
    if (argument.startsWith("--config=")) {
      configPath = argument.slice("--config=".length);
      if (!configPath) throw new Error("Expected a path after --config=.");
      continue;
    }
    if (argument.startsWith("-")) throw new Error(`Unknown option "${argument}".`);
    patterns.push(argument);
  }
  return { configPath, format, patterns, help: false };
};

const printResult = (result: LintResult, format: CliOptions["format"]): void => {
  if (format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else {
    for (const diagnostic of result.diagnostics) {
      console.log(
        `${diagnostic.path}:${diagnostic.line}:${diagnostic.column} [${diagnostic.ruleId}] ${diagnostic.message}`,
      );
    }
  }
  if (result.skipped.length > 0) {
    console.error(
      `design-lint: skipped ${result.skipped.length} unresolved or dynamic composition(s); v1 does not claim coverage for them`,
    );
  }
};

const main = async (): Promise<void> => {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) return;
  const configPath = resolve(options.configPath);
  const config: DesignLintConfig = await loadConfig(configPath);
  const configDir = dirname(configPath);
  const patterns = options.patterns.length > 0 ? options.patterns : (config.files ?? []);
  if (patterns.length === 0) throw new Error("No files were provided and config.files is empty.");
  const files = await resolveFilePatterns(
    patterns,
    options.patterns.length > 0 ? process.cwd() : configDir,
  );
  if (files.length === 0) {
    throw new Error(
      `No source files matched ${patterns.map((pattern) => `"${pattern}"`).join(", ")}.`,
    );
  }
  const result = await lintFiles(files, config, { configDir });
  printResult(result, options.format);
  if (result.diagnostics.some((diagnostic) => diagnostic.severity === "error"))
    process.exitCode = 1;
};

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 2;
}
