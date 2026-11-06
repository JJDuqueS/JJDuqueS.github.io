// Icon files in public/icons, written by `npm run icons` (scripts/stack-icons.mjs).
// Skills without a brand mark (REST APIs, Microservices...) and brands Simple Icons
// no longer ships (AWS, SQL Server) show as text only.
const icons: Record<string, string> = {
	Python: 'python',
	'Node.js': 'nodejs',
	PostgreSQL: 'postgresql',
	MongoDB: 'mongodb',
	Docker: 'docker',
	'CI/CD': 'githubactions',
	Linux: 'linux',
	Git: 'git',
	React: 'react',
	'Next.js': 'nextjs',
	TypeScript: 'typescript',
	'Vue 3': 'vue',
	'Tailwind CSS': 'tailwindcss',
	Pytest: 'pytest',
	Jest: 'jest',
	Vitest: 'vitest',
	Postman: 'postman',
};

export const stackIcon = (name: string): string | undefined => (icons[name] ? `/icons/${icons[name]}.svg` : undefined);
