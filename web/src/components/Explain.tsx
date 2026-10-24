import {useEffect, useId, useRef} from 'react';

// A small "?" button that opens a plain-language note in the top layer (native popover: Esc and
// outside clicks close it). Placed next to the button by hand, so it never clips inside tables.
export function Explain({label, text, wide = false, children, className = ''}: {label: string; text?: string; wide?: boolean; children: React.ReactNode; className?: string}) {
	const id = `explain-${useId().replace(/:/g, '')}`;
	const button = useRef<HTMLButtonElement>(null);
	const panel = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const element = panel.current;
		if (!element) return;
		const place = (event: Event) => {
			if ((event as ToggleEvent).newState !== 'open' || !button.current) return;
			const anchor = button.current.getBoundingClientRect();
			const width = Math.min(wide ? 384 : 288, window.innerWidth - 24);
			const left = Math.max(12, Math.min(anchor.left + anchor.width / 2 - width / 2, window.innerWidth - width - 12));
			element.style.width = `${width}px`;
			element.style.left = `${left}px`;
			// Below the button when it fits; long notes scroll inside the panel.
			const top = anchor.bottom + 8;
			element.style.top = `${top}px`;
			element.style.maxHeight = `${Math.max(160, window.innerHeight - top - 12)}px`;
		};
		const close = () => element.hidePopover?.();
		element.addEventListener('beforetoggle', place);
		window.addEventListener('scroll', close, {passive: true});
		return () => {
			element.removeEventListener('beforetoggle', place);
			window.removeEventListener('scroll', close);
		};
	}, [wide]);
	return (
		<>
			<button
				ref={button}
				type="button"
				popoverTarget={id}
				aria-label={text ? undefined : label}
				className={text
					? `inline-flex items-center gap-1.5 rounded-sm py-1 text-sm text-ink-2 underline decoration-rule-strong underline-offset-4 hover:text-ink hover:decoration-current ${className}`
					: `inline-flex size-6 shrink-0 items-center justify-center rounded-full text-ink-3 hover:bg-slip-2 hover:text-ink ${className}`}
			>
				<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
					<circle cx="10" cy="10" r="7.5" />
					<path d="M8 8.1a2.1 2.1 0 1 1 3 1.9c-.6.3-1 .8-1 1.5v.3" />
					<circle cx="10" cy="14.3" r="0.4" fill="currentColor" />
				</svg>
				{text}
			</button>
			<div
				ref={panel}
				id={id}
				popover="auto"
				role="note"
				className="explain m-0 overflow-y-auto overscroll-contain rounded-sm border border-rule-strong bg-slip p-3.5 text-left text-sm leading-relaxed font-normal tracking-normal normal-case text-ink [font-variation-settings:'wdth'_100]"
			>
				{children}
			</div>
		</>
	);
}
