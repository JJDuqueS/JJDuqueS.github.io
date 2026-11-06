'use client';

import { useRef, useState } from 'react';
import { ContactForm } from '@/components/contact-form';

// "Email me" opens the contact form in a dialog. The native <dialog> traps focus,
// closes on Escape and returns focus to the button.
export function ContactDialogButton({ className, children }: { className: string; children: React.ReactNode }) {
	const dialog = useRef<HTMLDialogElement>(null);
	// The form mounts each time the dialog opens, so it starts empty and takes focus.
	const [open, setOpen] = useState(false);

	return (
		<>
			<button
				type="button"
				className={className}
				aria-haspopup="dialog"
				onClick={() => {
					setOpen(true);
					dialog.current?.showModal();
				}}
			>
				{children}
			</button>
			<dialog
				ref={dialog}
				aria-labelledby="contact-dialog-title"
				onClose={() => setOpen(false)}
				onClick={(event) => {
					// A click on the backdrop lands on the dialog itself.
					if (event.target === event.currentTarget) dialog.current?.close();
				}}
				className="m-auto w-[min(40rem,calc(100vw-2rem))] rounded-2xl border border-segment bg-panel p-0 text-ink backdrop:bg-paper/80 backdrop:backdrop-blur-sm open:animate-[dialog-in_200ms_var(--ease-out-soft)]"
			>
				<div className="p-6 md:p-8">
					<div className="flex items-start justify-between gap-4">
						<h2 id="contact-dialog-title" className="text-2xl font-semibold md:text-3xl">
							Send me a message
						</h2>
						<button
							type="button"
							onClick={() => dialog.current?.close()}
							className="-mr-2 -mt-1 rounded-full px-3 py-1 text-quiet hover:text-ink"
						>
							Close
						</button>
					</div>
					<div className="mt-6">{open && <ContactForm autoFocus />}</div>
				</div>
			</dialog>
		</>
	);
}
