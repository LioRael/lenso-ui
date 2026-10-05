export interface StoryEntry {
  id: string;
  type: string;
  importPath: string;
  exportName: string;
}
export interface StoryIndex {
  entries: Record<string, StoryEntry>;
}
