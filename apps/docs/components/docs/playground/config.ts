import { z } from "zod";

import type {
  PlaygroundConfig,
  PlaygroundControl,
  PlaygroundExample,
  PlaygroundOption,
} from "./types";

const valueSchema = z.union([z.boolean(), z.number(), z.string()]);

const optionSchema = z.union([
  z.string(),
  z.object({
    label: z.string().min(1),
    value: z.string().min(1),
  }),
]);

const controlSchema = z.discriminatedUnion("type", [
  z.object({
    default: z.boolean(),
    id: z.string().min(1),
    label: z.string().min(1),
    type: z.literal("boolean"),
  }),
  z.object({
    default: z.string(),
    id: z.string().min(1),
    label: z.string().min(1),
    options: z.array(optionSchema).min(1),
    type: z.literal("select"),
  }),
  z.object({
    default: z.string(),
    id: z.string().min(1),
    label: z.string().min(1),
    placeholder: z.string().optional(),
    type: z.literal("text"),
  }),
]);

const exampleSchema = z.object({
  code: z.string().optional(),
  id: z.string().min(1),
  label: z.string().min(1),
  values: z.record(z.string(), valueSchema).optional(),
});

const configSchema = z.object({
  bodyClassName: z.string().optional(),
  codeTemplate: z.string().optional(),
  controls: z.array(controlSchema).min(1),
  defaultExample: z.string().optional(),
  description: z.string().min(1),
  examples: z.array(exampleSchema).min(1),
  id: z.string().min(1),
  name: z.string().min(1),
  sectionClassName: z.string().optional(),
  stageClassName: z.string().optional(),
  themeControl: z.string().optional(),
  title: z.string().optional(),
});

export function parsePlaygroundConfig(value: unknown): PlaygroundConfig {
  const config = configSchema.parse(value);
  const defaultExample = config.defaultExample ?? config.examples[0]?.id;

  if (!defaultExample || !config.examples.some((example) => example.id === defaultExample)) {
    throw new Error(`Playground ${config.id} must point to an existing default example`);
  }

  const controlIds = new Set<string>();
  for (const control of config.controls) {
    if (controlIds.has(control.id)) {
      throw new Error(`Playground ${config.id} has duplicate control ${control.id}`);
    }
    controlIds.add(control.id);
  }

  const exampleIds = new Set<string>();
  for (const example of config.examples) {
    if (exampleIds.has(example.id)) {
      throw new Error(`Playground ${config.id} has duplicate example ${example.id}`);
    }
    exampleIds.add(example.id);
  }

  return {
    defaultExample,
    controls: config.controls as PlaygroundControl[],
    description: config.description,
    examples: config.examples as PlaygroundExample[],
    id: config.id,
    name: config.name,
    ...(config.bodyClassName ? { bodyClassName: config.bodyClassName } : {}),
    ...(config.codeTemplate ? { codeTemplate: config.codeTemplate } : {}),
    ...(config.sectionClassName ? { sectionClassName: config.sectionClassName } : {}),
    ...(config.stageClassName ? { stageClassName: config.stageClassName } : {}),
    ...(config.themeControl ? { themeControl: config.themeControl } : {}),
    ...(config.title ? { title: config.title } : {}),
  };
}

export function optionToPlaygroundOption(option: PlaygroundOption | string): PlaygroundOption {
  return typeof option === "string" ? { label: option, value: option } : option;
}
