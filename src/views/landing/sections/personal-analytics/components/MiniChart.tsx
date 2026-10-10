'use client'

import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PERSONAL_DEMO_SERIES } from '../config'

const W = 320
const H = 96
const PAD = 8

function toPath(series: readonly number[]) {
	const min = Math.min(...series)
	const max = Math.max(...series)
	const span = max - min || 1
	const stepX = (W - PAD * 2) / (series.length - 1)
	const pts = series.map((v, i) => {
		const x = PAD + i * stepX
		const y = H - PAD - ((v - min) / span) * (H - PAD * 2)
		return [x, y] as const
	})
	const line = pts
		.map(
			([x, y], i) =>
				`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
		)
		.join(' ')
	const area = `${line} L${(W - PAD).toFixed(1)},${H - PAD} L${PAD},${H - PAD} Z`
	return { line, area, last: pts[pts.length - 1]! }
}

export function MiniChart() {
	const shouldReduceMotion = useReducedMotion()
	const frozen = shouldReduceMotion ?? false
	const { line, area, last } = useMemo(() => toPath(PERSONAL_DEMO_SERIES), [])

	const wrapRef = useRef<HTMLDivElement>(null)
	const lineRef = useRef<SVGPathElement>(null)
	const inView = useInView(wrapRef, { once: true })
	const [total, setTotal] = useState(0)
	const [progress, setProgress] = useState(frozen ? 1 : 0)

	useEffect(() => {
		if (lineRef.current) setTotal(lineRef.current.getTotalLength())
	}, [])

	useEffect(() => {
		if (frozen || !inView || total === 0) return
		const controls = animate(0, 1, {
			duration: 1.6,
			delay: 0.2,
			ease: 'easeOut',
			onUpdate: (v) => setProgress(v),
		})
		return () => controls.stop()
	}, [frozen, inView, total])

	useEffect(() => {
		if (frozen) setProgress(1)
	}, [frozen])

	const areaOpacity = Math.max(0, Math.min(1, (progress - 0.25) / 0.75))
	const dotOpacity = Math.max(0, Math.min(1, (progress - 0.92) / 0.08))
	// SVG растянут через preserveAspectRatio="none", поэтому точку рисуем
	// HTML-поверх — иначе круг превращается в овал.
	const dotLeft = `${(last[0] / W) * 100}%`
	const dotTop = `${(last[1] / H) * 100}%`

	return (
		<div className="relative" ref={wrapRef}>
			<svg
				aria-hidden="true"
				className="h-24 w-full"
				preserveAspectRatio="none"
				viewBox={`0 0 ${W} ${H}`}
			>
				<defs>
					<linearGradient
						id="personal-demo-fill"
						x1="0"
						x2="0"
						y1="0"
						y2="1"
					>
						<stop
							offset="0%"
							stopColor="var(--primary)"
							stopOpacity="0.35"
						/>
						<stop
							offset="100%"
							stopColor="var(--primary)"
							stopOpacity="0.02"
						/>
					</linearGradient>
				</defs>
				<path
					d={area}
					fill="url(#personal-demo-fill)"
					opacity={areaOpacity}
				/>
				<path
					d={line}
					fill="none"
					ref={lineRef}
					stroke="var(--primary)"
					strokeDasharray={total || undefined}
					strokeDashoffset={
						total ? total * (1 - progress) : undefined
					}
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2.5"
				/>
			</svg>
			<span
				aria-hidden="true"
				className="absolute size-2.5 rounded-full bg-primary"
				style={{
					left: dotLeft,
					top: dotTop,
					opacity: dotOpacity,
					transform: 'translate(-50%, -50%)',
				}}
			/>
		</div>
	)
}
