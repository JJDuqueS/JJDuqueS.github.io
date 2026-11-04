import { execSync } from 'node:child_process';

// CI passes the commit through PUBLIC_COMMIT_SHA. Local builds ask git, and fall back to nothing.
function localCommit(): string | undefined {
	try {
		return execSync('git rev-parse HEAD', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
	} catch {
		return undefined;
	}
}

const commit: string | undefined = import.meta.env.PUBLIC_COMMIT_SHA || localCommit();

export const commitShort = commit?.slice(0, 7);

export const builtAt = new Date();

export const builtAtLabel = builtAt.toLocaleDateString('en-US', {
	timeZone: 'UTC',
	year: 'numeric',
	month: 'long',
	day: 'numeric',
});
