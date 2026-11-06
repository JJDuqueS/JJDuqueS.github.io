// Writes the stack icons from Simple Icons to public/icons as small static SVG files.
// Run with `npm run icons` after changing the list. The site loads them as cached
// <img> files, so they don't add to the HTML or to the JavaScript.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import * as icons from 'simple-icons';

// Must match the names in content/stack.json. Quiet ink from the palette.
const COLOR = '#9aaba5';
const wanted = {
	python: icons.siPython,
	nodejs: icons.siNodedotjs,
	postgresql: icons.siPostgresql,
	mongodb: icons.siMongodb,
	docker: icons.siDocker,
	githubactions: icons.siGithubactions,
	linux: icons.siLinux,
	git: icons.siGit,
	react: icons.siReact,
	nextjs: icons.siNextdotjs,
	typescript: icons.siTypescript,
	vue: icons.siVuedotjs,
	tailwindcss: icons.siTailwindcss,
	pytest: icons.siPytest,
	jest: icons.siJest,
	vitest: icons.siVitest,
	postman: icons.siPostman,
};

const dir = new URL('../public/icons/', import.meta.url);
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
for (const [file, icon] of Object.entries(wanted)) {
	if (!icon) throw new Error(`Simple Icons has no icon for ${file}`);
	writeFileSync(
		new URL(`${file}.svg`, dir),
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${COLOR}"><path d="${icon.path}"/></svg>\n`,
	);
}
console.log(`Wrote ${Object.keys(wanted).length} icons to public/icons`);
