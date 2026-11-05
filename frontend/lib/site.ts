import 'server-only';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

// Published at the root of GitHub Pages (ADR 0002). With a custom domain, change this.
export const SITE_URL = 'https://jjduques.github.io';

export const person = {
	name: 'Juan Duque',
	role: 'Software Engineer',
	email: 'jduqueserna@gmail.com',
	linkedin: 'https://www.linkedin.com/in/jduques/',
	location: 'Colombia (UTC−5)',
};

const publicFile = (path: string) => existsSync(join(process.cwd(), 'public', path));

// The résumé link and the portrait only appear once their files exist.
export const resumePath = '/cv/juan-duque-backend-cv.pdf';
export const hasResume = publicFile(resumePath);
export const portraitPath = '/portrait.jpg';
export const hasPortrait = publicFile(portraitPath);
