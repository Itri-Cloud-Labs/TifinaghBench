import {useEffect, useRef, useState} from 'react';

// The SVG is drawn at the container's real width, so text keeps its size from phones to desktops.
export function useWidth(initial: number) {
	const ref = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(initial);
	useEffect(() => {
		const element = ref.current;
		if (!element) return;
		const observer = new ResizeObserver(([entry]) => entry && setWidth(Math.round(entry.contentRect.width)));
		observer.observe(element);
		return () => observer.disconnect();
	}, []);
	return [ref, width] as const;
}
