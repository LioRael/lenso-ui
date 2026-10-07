export function normalizeMetadata(input) {
  const ancestors = new Set();
  function copy(value) {
    if (value === null || ["string", "boolean"].includes(typeof value)) return value;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (!value || typeof value !== "object")
      throw new Error("Documentation metadata must contain only JSON data.");
    if (ancestors.has(value)) throw new Error("Documentation metadata must not contain cycles.");
    if (!Array.isArray(value) && ![Object.prototype, null].includes(Object.getPrototypeOf(value)))
      throw new Error("Documentation metadata must contain plain records and arrays.");
    ancestors.add(value);
    const result = Array.isArray(value)
      ? value.map(copy)
      : Object.fromEntries(Object.entries(value).map(([key, child]) => [key, copy(child)]));
    ancestors.delete(value);
    return Object.freeze(result);
  }
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Documentation metadata must be a JSON record.");
  return copy(input);
}
