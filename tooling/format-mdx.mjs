import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = join(process.cwd(), "apps/docs/contents");
const checkOnly = process.argv.includes("--check");

async function findMdxFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findMdxFiles(path)));
    } else if (entry.name.endsWith(".mdx")) {
      files.push(path);
    }
  }

  return files;
}

function indentGuidance(lines) {
  let index = 0;

  while (index < lines.length) {
    if (lines[index].trim() !== "<Guidance>" || lines[index].startsWith(" ")) {
      index += 1;
      continue;
    }

    const end = lines.findIndex(
      (line, candidate) => candidate > index && line.trim() === "</Guidance>",
    );
    if (end === -1) break;

    for (let candidate = index; candidate <= end; candidate += 1) {
      if (lines[candidate].trim()) lines[candidate] = `  ${lines[candidate]}`;
    }
    index = end + 1;
  }
}

function indentOverviewSections(lines) {
  const frameStart = lines.indexOf("<OverviewFrame>");
  const frameEnd = lines.indexOf("</OverviewFrame>");
  if (frameStart === -1 || frameEnd === -1) return;

  const body = lines.slice(frameStart + 1, frameEnd);
  let index = 0;

  while (index < body.length) {
    if (!/^\s*<section\s/.test(body[index])) {
      index += 1;
      continue;
    }

    let end = index;
    while (end < body.length && body[end].trim() !== "</section>") end += 1;
    if (end === body.length) break;

    const baseIndent = body[index].length - body[index].trimStart().length;
    for (let candidate = index; candidate <= end; candidate += 1) {
      if (!body[candidate].trim()) {
        body[candidate] = "";
      } else {
        body[candidate] = `  ${body[candidate].slice(baseIndent)}`;
      }
    }
    index = end + 1;
  }

  lines.splice(frameStart + 1, frameEnd - frameStart - 1, ...body);
}

function wrapSingleLineDemo(lines) {
  return lines.flatMap((line) => {
    const match = line.match(
      /^  <([A-Z][A-Za-z0-9]*(?:Demo|Playground)) description="([^"]+)" \/>$/,
    );
    if (!match) return [line];

    return [`  <${match[1]}`, `    description="${match[2]}"`, "  />"];
  });
}

function formatMdx(source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  if (lines.at(-1) === "") lines.pop();

  indentGuidance(lines);
  indentOverviewSections(lines);

  return `${wrapSingleLineDemo(lines).join("\n")}\n`;
}

const files = (await findMdxFiles(root)).sort();
const changed = [];

for (const file of files) {
  const source = await readFile(file, "utf8");
  const formatted = formatMdx(source);
  if (source !== formatted) {
    changed.push(relative(process.cwd(), file));
    if (!checkOnly) await writeFile(file, formatted);
  }
}

if (changed.length > 0) {
  console.error(
    checkOnly
      ? `MDX formatting issues found in:\n${changed.join("\n")}`
      : `Formatted ${changed.length} MDX files.`,
  );
  if (checkOnly) process.exitCode = 1;
} else {
  console.log(
    checkOnly
      ? `All ${files.length} MDX files are formatted.`
      : `Checked ${files.length} MDX files.`,
  );
}
