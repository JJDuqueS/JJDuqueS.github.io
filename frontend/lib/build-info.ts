import 'server-only';
import { execSync } from 'node:child_process';

// CI passes the commit through PUBLIC_COMMIT_SHA (see next.config.ts). Local builds ask git.
function localCommit(): string | undefined {
	try {
		return execSync('git rev-parse HEAD', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
	} catch {
		return undefined;
	}
}

const commit = process.env.NEXT_PUBLIC_COMMIT_SHA || localCommit();

export const buildInfo = {
	commit: commit?.slice(0, 7),
	builtAt: new Date().toISOString(),
	builtAtLabel: new Date().toLocaleDateString('en-US', {
		timeZone: 'UTC',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}),
};
