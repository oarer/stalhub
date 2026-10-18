'use client'

import mermaid from 'mermaid'
import { useEffect, useState } from 'react'

let initialized = false

function cssVar(name: string, fallback: string) {
	if (typeof document === 'undefined') return fallback
	const raw = getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim()
	const value = raw || fallback

	try {
		const canvas = document.createElement('canvas')
		canvas.width = 1
		canvas.height = 1
		const ctx = canvas.getContext('2d')
		if (!ctx) return value
		ctx.fillStyle = value
		ctx.fillRect(0, 0, 1, 1)
		const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
		return `rgb(${r}, ${g}, ${b})`
	} catch {
		return value
	}
}

export function MermaidDiagram({ chart }: { chart: string }) {
	const [svg, setSvg] = useState<string>('')
	const [error, setError] = useState<string>('')

	useEffect(() => {
		if (!initialized) {
			mermaid.initialize({
				startOnLoad: false,
				theme: 'base',
				themeVariables: {
					primaryColor: cssVar('--card', '#1e293b'),
					primaryTextColor: cssVar('--foreground', '#e2e8f0'),
					primaryBorderColor: cssVar('--primary', '#38bdf8'),
					lineColor: cssVar('--primary', '#38bdf8'),
					secondaryColor: cssVar('--background', '#0f172a'),
					tertiaryColor: cssVar('--card', '#1e293b'),
					background: 'transparent',
					mainBkg: cssVar('--card', '#1e293b'),
					nodeBorder: cssVar('--primary', '#38bdf8'),
					clusterBkg: cssVar('--background', '#0f172a'),
					titleColor: cssVar('--foreground', '#e2e8f0'),
					edgeLabelBackground: cssVar('--background', '#0f172a'),
					fontFamily: 'inherit',
					borderRadius: '12px',
				},
				securityLevel: 'strict',
			})
			initialized = true
		}
		let cancelled = false
		const id = `mermaid-${Math.random().toString(36).slice(2)}`
		mermaid
			.render(id, chart)
			.then(({ svg }) => {
				if (!cancelled) setSvg(svg)
			})
			.catch((err) => {
				if (!cancelled) setError(String(err))
			})
		return () => {
			cancelled = true
		}
	}, [chart])

	if (error) {
		return (
			<pre className="text-destructive text-sm">
				{error}
				{'\n'}
				{chart}
			</pre>
		)
	}
	return (
		<div
			className="mermaid-wrap my-6 flex justify-center overflow-x-auto rounded-xl border border-primary/30 bg-card/40 p-4"
			dangerouslySetInnerHTML={{ __html: svg }}
			style={{ borderRadius: '12px' }}
		/>
	)
}
