import { readFile, writeFile } from "node:fs/promises";
import { buildLensoContract, canonicalSerialize } from "../tooling/lenso-contracts/index.mjs";

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  throw new Error(
    "Usage: node scripts/generate-lenso-contracts.mjs <current-source-input.json> <contract-output.json>",
  );
}

const input = JSON.parse(await readFile(inputPath, "utf8"));
const contract = buildLensoContract(input);
await writeFile(outputPath, `${canonicalSerialize(contract)}\n`);
