import {useState} from 'react';
import type {Lab} from '../data/models';
import {useI18n} from '../lib/lang';
import {LabLogo} from './LabLogo';

export type Series = {key: string; label: string; color: string};
export type DotRow = {key: string; label: string; lab?: Lab; values: Record<string, number | null>};

const ticks = [0, 25, 50, 75, 100];
const clamp = (value: number) => Math.min(100, Math.max(0, value));

// One row per model on a fixed 0–100 scale. Dots for two or three series (joined when `connect`), or a bar for one.
// The legend sits directly above the rows, so dots are not labelled one by one.
// Hover a row for its values; the table view under the chart holds every number.
export function DotRows({rows, series, connect = false, caption, unit = ''}: {rows: DotRow[]; series: Series[]; connect?: boolean; caption: string; unit?: string}) {
	const {t, f} = useI18n();
	const [active, setActive] = useState<string | null>(null);
	const [table, setTable] = useState(false);
	const bar = series.length === 1;
	const value = (number: number | null) => (number === null ? '—' : `${f.score(number)}${unit}`);

	return (
		<figure>
			{!bar && (
				<ul className="mb-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-2" aria-label={t.findings.legend}>
					{series.map(item => (
						<li key={item.key} className="flex items-center gap-2">
							<span className="inline-block size-3 rounded-full" style={{background: item.color}} aria-hidden="true" />
							{item.label}
						</li>
					))}
				</ul>
			)}
			<ol className="relative" aria-hidden="true">
				{rows.map(row => {
					const present = series.map(item => row.values[item.key]).filter((v): v is number => v !== null);
					const low = Math.min(...present);
					const high = Math.max(...present);
					const on = active === row.key;
					return (
						<li
							key={row.key}
							onMouseEnter={() => setActive(row.key)}
							onMouseLeave={() => setActive(null)}
							className={`relative grid grid-cols-1 items-center gap-x-4 py-1.5 sm:grid-cols-[10rem_1fr] ${active !== null && !on ? 'opacity-45' : ''} transition-opacity duration-150`}
						>
							<span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-ink">{row.lab && <LabLogo lab={row.lab} className="shrink-0" />}<span className="truncate">{row.label}</span></span>
							<span className="relative block h-7">
								{ticks.map(tick => <span key={tick} className="absolute inset-y-0 w-px bg-rule" style={{left: `${tick}%`}} />)}
								<span className="absolute inset-x-0 top-1/2 h-px bg-rule-strong" />
								{bar ? (
									row.values[series[0]!.key] !== null && (
										<span className="absolute top-1/2 left-0 h-3 -translate-y-1/2 rounded-r-[4px]" style={{width: `${Math.max(0.5, clamp(row.values[series[0]!.key]!))}%`, background: series[0]!.color}} />
									)
								) : (
									<>
										{connect && present.length > 1 && <span className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-ink-3" style={{left: `${clamp(low)}%`, right: `${100 - clamp(high)}%`}} />}
										{series.map(item => {
											const v = row.values[item.key];
											if (v === null || v === undefined) return null;
											return (
												<span key={item.key} className={`absolute top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slip ${on ? 'size-4' : 'size-3.5'}`} style={{left: `${clamp(v)}%`, background: item.color}} />
											);
										})}
									</>
								)}
							</span>
							{on && (
								<span className="pointer-events-none absolute right-0 bottom-full z-10 mb-1 rounded-sm border border-rule-strong bg-slip px-3 py-2 text-xs shadow-none">
									{series.map(item => (
										<span key={item.key} className="flex items-center gap-2 whitespace-nowrap">
											<span className="inline-block h-0.5 w-3" style={{background: item.color}} />
											<span className="num font-semibold text-ink">{value(row.values[item.key] ?? null)}</span>
											<span className="text-ink-2">{item.label}</span>
										</span>
									))}
								</span>
							)}
						</li>
					);
				})}
				<li className="grid grid-cols-1 gap-x-4 sm:grid-cols-[10rem_1fr]">
					<span className="hidden sm:block" />
					<span className="relative mt-1 block h-4">
						{ticks.map(tick => (
							<span key={tick} className={`num absolute text-xs text-ink-3 ${tick === 0 ? '' : tick === 100 ? '-translate-x-full' : '-translate-x-1/2'}`} style={{left: `${tick}%`}}>{tick}</span>
						))}
					</span>
				</li>
			</ol>
			<figcaption className="mt-3 max-w-[62ch] text-sm text-ink-2">{caption}</figcaption>
			{/* The table is always in the accessibility tree; the button shows it on screen too. */}
			<button type="button" onClick={() => setTable(open => !open)} aria-expanded={table} className="mt-4 text-sm font-semibold text-link underline underline-offset-2">
				{table ? t.findings.hideTable : t.findings.table}
			</button>
			<div className={table ? 'mt-3 overflow-x-auto text-sm' : 'sr-only'}>
					<table className="w-full min-w-[22rem]">
						<caption className="sr-only">{caption}</caption>
						<thead>
							<tr className="border-b border-rule-strong">
								<th scope="col" className="label py-2 pr-4 text-left">{t.home.model}</th>
								{series.map(item => <th key={item.key} scope="col" className="label py-2 pl-4 text-right">{item.label}</th>)}
							</tr>
						</thead>
						<tbody>
							{rows.map(row => (
								<tr key={row.key} className="border-b border-rule">
									<th scope="row" className="py-2 pr-4 text-left font-normal">
										<span className="inline-flex items-center gap-2">{row.lab && <LabLogo lab={row.lab} className="shrink-0" />}{row.label}</span>
									</th>
									{series.map(item => <td key={item.key} className="num py-2 pl-4 text-right">{value(row.values[item.key] ?? null)}</td>)}
								</tr>
							))}
						</tbody>
					</table>
			</div>
		</figure>
	);
}
