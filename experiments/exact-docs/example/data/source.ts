export const grants = "";
let value = 7;

export async function answer(source: string, args: unknown[]) {
  switch (source) {
    case "readCounter":
      if (args[0] === true) throw new Error("Counter read failed");
      return { value };
    case "incrementCounter":
      value += 1;
      return { value };
    case "rejectCounter":
      throw new Error("Counter update refused");
    default:
      throw new Error(`Unknown source: ${source}`);
  }
}
