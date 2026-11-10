export function sliderValue(value: number, min: number, max: number, step: number) {
  if (![value, min, max, step].every(Number.isFinite) || max <= min || step < 0) {
    throw new Error("Slider requires finite values, min < max and step >= 0.");
  }
  const snapped = step > 0 ? min + Math.round((value - min) / step) * step : value;
  return Math.max(min, Math.min(max, snapped));
}
