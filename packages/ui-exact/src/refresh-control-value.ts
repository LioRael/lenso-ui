export type RefreshStatus = "idle" | "refreshing" | "complete" | "error";
export function validateRefresh(
  threshold: number,
  status: string,
): asserts status is RefreshStatus {
  if (!Number.isFinite(threshold) || threshold <= 0)
    throw new RangeError("RefreshControl threshold must be positive and finite");
  if (!["idle", "refreshing", "complete", "error"].includes(status))
    throw new RangeError(`Unknown RefreshControl operation status: ${status}`);
}
export function refreshAxis(dx: number, dy: number): "waiting" | "ignore" | "pull" {
  if (Math.max(Math.abs(dx), Math.abs(dy)) <= 8) return "waiting";
  return dy > 0 && Math.abs(dy) > Math.abs(dx) ? "pull" : "ignore";
}
export function refreshDistance(dy: number, threshold: number) {
  validateRefresh(threshold, "idle");
  return Math.min(threshold + 40, Math.max(0, dy) * 0.5);
}
