import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
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

// Work history, taken from the Backend CV. Never add a company, role or date the CV doesn't state.
const experience = defineCollection({
	loader: file('./src/content/experience.json'),
	schema: z.object({
		role: z.string(),
		company: z.string(),
		start: z.string(),
		end: z.string(),
		summary: z.string(),
		stack: z.array(z.string()).default([]),
		order: z.number(),
	}),
});

export const collections = { projects, experience };
