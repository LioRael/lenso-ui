export function headingId(value: string) {
  return value
    .toLowerCase()
    .replace(/\[!toc\]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}
