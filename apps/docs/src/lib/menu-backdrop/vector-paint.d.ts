export interface MenuTexture {
  pixels: HTMLCanvasElement;
  opaque: boolean;
  fontCss: string;
  readonly revision: number;
  dispose(): void;
  mutate(records: readonly MutationRecord[]): boolean;
  relocate(lens: DOMRectReadOnly): { x: number; y: number } | undefined;
}

export function captureMenuTexture(
  scene: HTMLElement,
  texture: DOMRect,
  lens: DOMRect,
  density: number,
  radius: number,
  reach: number,
  blur: number,
  checkpoint: () => Promise<boolean>,
  options?: {
    exclude?(element: Element): boolean;
    base?: MenuTexture & { bounds: DOMRect };
    layers?: readonly {
      pixels: HTMLCanvasElement;
      foreground: HTMLElement;
      element: HTMLElement;
      update(): boolean;
    }[];
  },
): Promise<MenuTexture | undefined>;
