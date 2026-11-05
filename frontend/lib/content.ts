import 'server-only';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { z } from 'zod';

const contentDir = join(process.cwd(), 'content');

const projectSchema = z.object({
	title: z.string(),
	summary: z.string(),
	order: z.number(),
	stack: z.array(z.string()),
	role: z.string(),
	result: z.string(),
});

export type Project = z.infer<typeof projectSchema> & { slug: string; html: string };

export function getProjects(): Project[] {
	const dir = join(contentDir, 'projects');
	return readdirSync(dir)
		.filter((file) => file.endsWith('.md'))
		.map((file) => {
			const { data, content } = matter(readFileSync(join(dir, file), 'utf8'));
			const parsed = projectSchema.safeParse(data);
			if (!parsed.success) throw new Error(`content/projects/${file}: ${parsed.error.message}`);
			return {
				...parsed.data,
				slug: file.replace(/\.md$/, ''),
				html: marked.parse(content, { async: false }),
			};
		})
		.sort((a, b) => a.order - b.order);
}

export function getProject(slug: string): Project | undefined {
	return getProjects().find((project) => project.slug === slug);
}

// Work history, taken from the Backend CV. Never add a company, role or date the CV doesn't state.
const experienceSchema = z.array(
	z.object({
		id: z.string(),
		role: z.string(),
		company: z.string(),
		start: z.string(),
		end: z.string(),
		location: z.string(),
		summary: z.string(),
		highlights: z.array(z.string()),
		stack: z.array(z.string()),
	}),
);

export type Job = z.infer<typeof experienceSchema>[number];

export function getExperience(): Job[] {
	return experienceSchema.parse(JSON.parse(readFileSync(join(contentDir, 'experience.json'), 'utf8')));
}

const stackSchema = z.array(z.object({ group: z.string(), items: z.array(z.string()) }));

export type StackGroup = z.infer<typeof stackSchema>[number];

export function getStack(): StackGroup[] {
	return stackSchema.parse(JSON.parse(readFileSync(join(contentDir, 'stack.json'), 'utf8')));
}
