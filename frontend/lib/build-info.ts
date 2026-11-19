import 'server-only';
import { execSync } from 'node:child_process';
import type { Lang } from '@/lib/i18n';

// CI passes the commit through PUBLIC_COMMIT_SHA (see next.config.ts). Local builds ask git.
function localCommit(): string | undefined {
	try {
		return execSync('git rev-parse HEAD', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
	} catch {
		return undefined;
	}
}

const commit = process.env.NEXT_PUBLIC_COMMIT_SHA || localCommit();

const builtAt = new Date();

export const buildInfo = {
	commit: commit?.slice(0, 7),
	builtAt: builtAt.toISOString(),
	// "November 18, 2026" / "18 de noviembre de 2026"
	builtAtLabel: (lang: Lang) =>
		builtAt.toLocaleDateString(lang === 'es' ? 'es-CO' : 'en-US', {
			timeZone: 'UTC',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		}),
};
