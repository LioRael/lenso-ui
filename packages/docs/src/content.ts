import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

export const collections: { docs: ReturnType<typeof defineCollection> } = {
  docs: defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./content/docs" }),
    schema: z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      eyebrow: z.string().optional(),
      draft: z.boolean().default(false),
    }),
  }),
};
