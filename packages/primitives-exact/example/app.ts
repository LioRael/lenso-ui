import type { Answer } from "./app.contract.d.ts";

export const grants = "";

// The generated native shell requires a data module; this fixture has no data sources.
export const answer: Answer = () => {
  throw new Error("The primitive fixture declares no data sources");
};
