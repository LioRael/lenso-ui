export function captureMenuTexture(
  scene: HTMLElement,
  texture: DOMRect,
  lens: DOMRect,
  density: number,
  radius: number,
  reach: number,
  blur: number,
  checkpoint: () => Promise<boolean>,
): Promise<HTMLCanvasElement | undefined>;
