'use client';

import { useId, useState, type FormEvent } from 'react';

// The API's URL comes from the API_URL repository variable at build time (see ci.yml).
// Empty until the FastAPI service on the laptop is live; the form says so and stays disabled.
const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');
const endpoint = apiUrl ? `${apiUrl}/api/contact` : '';

const EMAIL = 'jduqueserna@gmail.com';

type Status =
	| { kind: 'idle' }
	| { kind: 'sending' }
	| { kind: 'sent'; email: string }
	| { kind: 'error'; message: string };

const field =
	'mt-1.5 w-full rounded-xl border border-segment bg-paper px-4 py-3 text-ink placeholder:text-quiet/70 transition-colors focus:border-accent focus:outline-none disabled:opacity-60';

export function ContactForm({ autoFocus = false }: { autoFocus?: boolean }) {
	const id = useId();
	const [status, setStatus] = useState<Status>({ kind: 'idle' });
	const live = endpoint !== '';
	const sending = status.kind === 'sending';

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!live || sending) return;
		const form = event.currentTarget;
		const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
		setStatus({ kind: 'sending' });
		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: data.name.trim(),
					email: data.email.trim(),
					message: data.message.trim(),
					website: data.website ?? '',
				}),
			});
			if (response.ok) {
				form.reset();
				setStatus({ kind: 'sent', email: data.email.trim() });
			} else if (response.status === 429) {
				setStatus({ kind: 'error', message: 'Too many messages from your network. Try again in a few minutes.' });
			} else if (response.status === 422 || response.status === 400) {
				setStatus({ kind: 'error', message: 'Some fields weren’t accepted. Check your email address and message.' });
			} else {
				setStatus({ kind: 'error', message: 'My API couldn’t save the message. Try again in a moment.' });
			}
		} catch {
			setStatus({ kind: 'error', message: 'My API couldn’t be reached, so the message wasn’t sent. Try again in a moment.' });
		}
	}

	if (status.kind === 'sent') {
		return (
			<div role="status" className="rounded-2xl border border-accent/60 bg-panel p-6">
				<p className="font-display text-xl font-semibold">Message sent</p>
				<p className="mt-2 text-quiet">I&apos;ll reply to {status.email}.</p>
				<button
					type="button"
					onClick={() => setStatus({ kind: 'idle' })}
					className="mt-4 text-sm text-accent underline"
				>
					Send another message
				</button>
			</div>
		);
	}

	return (
		<form onSubmit={onSubmit} noValidate={false} className="grid gap-4" aria-describedby={`${id}-note`}>
			<div className="grid gap-4 sm:grid-cols-2">
				<label className="block text-sm font-medium">
					Name
					<input
						name="name"
						required
						maxLength={100}
						autoComplete="name"
						autoFocus={autoFocus}
						disabled={!live || sending}
						className={field}
					/>
				</label>
				<label className="block text-sm font-medium">
					Email
					<input
						name="email"
						type="email"
						required
						maxLength={254}
						autoComplete="email"
						disabled={!live || sending}
						className={field}
					/>
				</label>
			</div>
			<label className="block text-sm font-medium">
				Message
				<textarea
					name="message"
					required
					minLength={10}
					maxLength={5000}
					rows={5}
					disabled={!live || sending}
					className={`${field} resize-y`}
				/>
			</label>

			{/* Honeypot: people never see or fill it; bots that fill every field get dropped by the API. */}
			<div aria-hidden="true" className="absolute -left-[100vw] h-px w-px overflow-hidden">
				<label>
					Website
					<input name="website" tabIndex={-1} autoComplete="off" />
				</label>
			</div>

			<div className="flex flex-wrap items-center gap-x-5 gap-y-3">
				<button
					type="submit"
					disabled={!live || sending}
					className="rounded-full bg-accent px-6 py-2.5 font-semibold text-accent-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
				>
					{sending ? 'Sending…' : 'Send message'}
				</button>
				<p id={`${id}-note`} className="text-sm text-quiet" role={status.kind === 'error' ? 'alert' : undefined}>
					{status.kind === 'error' ? (
						<>
							{status.message} Or email me at{' '}
							<a href={`mailto:${EMAIL}`} className="text-ink underline">
								{EMAIL}
							</a>
							.
						</>
					) : live ? (
						'Your message goes to my API and lands in my inbox.'
					) : (
						<>
							The form goes live with my API, the next thing I&apos;m building. Until then, email me at{' '}
							<a href={`mailto:${EMAIL}`} className="text-ink underline">
								{EMAIL}
							</a>
							.
						</>
					)}
				</p>
			</div>
		</form>
	);
}
