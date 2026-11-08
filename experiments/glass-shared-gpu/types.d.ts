interface HTMLCanvasElement {
  content: string;
  requestPaint(): void;
}
interface GPUQueue {
  drawElementImageToTexture(
    source: { source: Element },
    destination: {
      texture: GPUTexture;
      size: [number, number];
      colorSpace: string;
      premultipliedAlpha: boolean;
    },
  ): void;
}

declare module "*.css";
