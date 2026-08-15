import type { ReactNode } from "react";

export type PlaygroundValue = boolean | number | string;
export type PlaygroundTheme = "dark" | "light" | "system";

export interface PlaygroundOption {
  label: string;
  value: string;
}

export type PlaygroundControl =
  | {
      default: boolean;
      id: string;
      label: string;
      type: "boolean";
    }
  | {
      default: string;
      id: string;
      label: string;
      options: readonly (PlaygroundOption | string)[];
      type: "select";
    }
  | {
      default: string;
      id: string;
      label: string;
      placeholder?: string;
      type: "text";
    };

export interface PlaygroundExample {
  code?: string;
  id: string;
  label: string;
  values?: Record<string, PlaygroundValue>;
}

export interface PlaygroundConfig {
  bodyClassName?: string;
  codeTemplate?: string;
  controls: readonly PlaygroundControl[];
  defaultExample?: string;
  description: string;
  examples: readonly PlaygroundExample[];
  id: string;
  name: string;
  sectionClassName?: string;
  stageClassName?: string;
  themeControl?: string;
  title?: string;
}

export interface PlaygroundRenderContext {
  example: string;
  pageTheme: "dark" | "light";
  setValue: (id: string, value: PlaygroundValue) => void;
  theme: PlaygroundTheme;
  values: Readonly<Record<string, PlaygroundValue>>;
}

export type PlaygroundAdapter = (context: PlaygroundRenderContext) => ReactNode;

export interface PlaygroundDefinition {
  adapter: PlaygroundAdapter;
  config: PlaygroundConfig;
}
