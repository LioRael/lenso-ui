export interface HeadingTextNode {
  type: string;
  value?: string;
  alt?: string;
  children?: HeadingTextNode[];
}
export function headingText(node: HeadingTextNode): string;
export function isNonRenderingPrefix(node: HeadingTextNode): boolean;
