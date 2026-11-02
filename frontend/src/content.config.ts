import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
	loader: glob({ pattern: '*.md', base: './src/content/projects' }),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		order: z.number(),
		stack: z.array(z.string()),
		role: z.string(),
		result: z.string(),
	}),
});

export const collections = { projects };
