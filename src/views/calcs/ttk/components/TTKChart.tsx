'use client'

import { useMemo } from 'react'

import { Line } from 'react-chartjs-2'

import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import {
	type ChartData,
	type ChartOptions,
	type TooltipItem,
	Chart as ChartJS,
	Filler,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Tooltip,
} from 'chart.js'

import { montserrat } from '@/app/fonts'

ChartJS.register(
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Legend,
	Filler
)

export interface TTKSeries {
	label: string
	color: string
	labelColor: string
	points: { x: number; y: number; shots: number }[]
}

function interpolateY(
	points: { x: number; y: number; shots: number }[],
	targetX: number
): number | null {
	if (points.length === 0) return null

	const first = points[0]
	const last = points[points.length - 1]

	if (targetX < first.x || targetX > last.x) {
		return null
	}

	if (first.x === targetX) return first.y
	if (last.x === targetX) return last.y

	for (let i = 0; i < points.length - 1; i++) {
		if (points[i].x <= targetX && points[i + 1].x >= targetX) {
			const lower = points[i]
			const upper = points[i + 1]
			const ratio = (targetX - lower.x) / (upper.x - lower.x)
			return lower.y + ratio * (upper.y - lower.y)
		}
	}

	return null
}

function interpolateShots(
	points: { x: number; y: number; shots: number }[],
	targetX: number
): number | null {
	if (points.length === 0) return null

	const first = points[0]
	const last = points[points.length - 1]

	if (targetX < first.x || targetX > last.x) {
		return null
	}

	if (first.x === targetX) return first.shots
	if (last.x === targetX) return last.shots

	for (let i = 0; i < points.length - 1; i++) {
		if (points[i].x <= targetX && points[i + 1].x >= targetX) {
			const lower = points[i]
			const upper = points[i + 1]
			const ratio = (targetX - lower.x) / (upper.x - lower.x)
			const delta = upper.shots - lower.shots
			return Math.round(lower.shots + ratio * delta)
		}
	}

	return null
}

export function TTKChart({
	series,
	maxDist,
}: {
	series: TTKSeries[]
	maxDist: number
}) {
	const { resolvedTheme } = useTheme()
	const isDark = resolvedTheme === 'dark'
	const t = useTranslations()

	const chartData = useMemo((): ChartData<'line'> => {
		if (!series.length) return { datasets: [] }

		const allXValues = new Set<number>()
		for (const s of series) {
			for (const p of s.points) {
				allXValues.add(p.x)
			}
		}
		const sortedX = Array.from(allXValues).sort((a, b) => a - b)

		const bounds = series.map((s) => {
			const pts = s.points
			return {
				minX: pts.length > 0 ? pts[0].x : 0,
				maxX: pts.length > 0 ? pts[pts.length - 1].x : 0,
			}
		})

		const datasets = series.map((s, i) => {
			const b = bounds[i]
			const data = sortedX
				.filter((x) => x >= b.minX && x <= b.maxX)
				.map((x) => {
					const y = interpolateY(s.points, x)!
					const shots = interpolateShots(s.points, x)!
					return { x, y, shots }
				})

			return {
				label: s.label,
				labelColor: s.labelColor,
				data,
				borderColor: s.color,
				backgroundColor: s.color,
				borderWidth: 2.5,
				pointStyle: 'rectRounded',
				pointRadius: 0,
				pointHitRadius: 5,
				pointHoverRadius: 5,
				parsing: false,
				tension: 0.15,
				fill: false,
			}
		})

		return { datasets } as ChartData<'line'>
	}, [series])

	const options: ChartOptions<'line'> = useMemo(
		() => ({
			maintainAspectRatio: false,
			responsive: true,
			interaction: {
				mode: 'index',
				intersect: false,
			},
			plugins: {
				legend: {
					display: true,
					position: 'bottom',
					labels: {
						usePointStyle: true,
						pointStyle: 'rectRounded',
						boxWidth: 10,
						boxHeight: 10,
						padding: 12,
						color: isDark ? '#c2c2c2' : '#404040',
						font: {
							size: 12,
							weight: 'bold',
							family: montserrat.style.fontFamily,
						},
					},
				},
				tooltip: {
					backgroundColor: isDark ? '#171717' : '#fff',
					titleColor: isDark ? '#fbfbfe' : '#171717',
					borderColor: isDark ? '#3d4a52' : '#e5e7eb',
					usePointStyle: true,
					borderWidth: 2,
					padding: 12,
					titleFont: { size: 15, weight: 'bold' },
					bodyFont: { size: 13, weight: 'bold' },
					callbacks: {
						title: (items: TooltipItem<'line'>[]) => {
							if (!items.length) return ''
							const x = items[0].parsed.x ?? 0
							return `${Math.round(x)} м`
						},
						label: (ctx: TooltipItem<'line'>) => {
							const value = ctx.parsed.y ?? 0
							const shots =
								(ctx.raw as { shots?: number }).shots ?? 0
							return [
								` ${ctx.dataset.label} : ${shots} • ${value.toFixed(2)}с`,
							]
						},
					},
				},
			},
			scales: {
				x: {
					type: 'linear',
					min: 0,
					max: maxDist,
					grid: { display: false },
					border: {
						color: isDark ? '#3d4a52' : '#e5e7eb',
						width: 2,
					},
					ticks: {
						stepSize: 10,
						color: isDark ? '#c2c2c2' : '#404040',
						font: { size: 11, weight: 'bold' },
					},
				},
				y: {
					grid: { display: false },
					border: {
						color: isDark ? '#3d4a52' : '#e5e7eb',
						width: 2,
					},
					ticks: {
						color: isDark ? '#c2c2c2' : '#404040',
						font: { size: 11, weight: 'bold' },
						callback: (value) => {
							if (typeof value !== 'number') return value
							return (value as number).toFixed(2)
						},
					},
				},
			},
		}),
		[isDark, maxDist, t]
	)

	return (
		<div className="h-full w-full">
			<Line data={chartData} options={options} />
		</div>
	)
}
