interface CanvasRenderingContext2D {
  drawElementImage(element: Element, dx: number, dy: number, width: number, height: number): void;
}
interface HTMLCanvasElement {
  updateElementGeometry?(element: Element, options: { canvasTransform: DOMMatrix }): void;
}
declare module "*/glass.js" {
  export default function initialize(): Promise<void>;
  export class GlassRenderer {
    constructor(canvas: HTMLCanvasElement, material: Float32Array);
    set_lenses(values: Float32Array): void;
    render_canvas(source: HTMLCanvasElement, revision: number): void;
    render_video(source: HTMLVideoElement, revision: number): void;
    free(): void;
  }
}
