'use client'

import {
	CategoryScale,
	Chart as ChartJS,
	type ChartOptions,
	Filler,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Tooltip,
} from 'chart.js'
import { useLocale, useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import { getBaseLineOptions } from '@/lib/chart-theme'
import { formatStatValue, type SeriesPoint, toDeltaPoints } from './statMeta'

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Legend,
	Filler
)

export type ChartMode = 'absolute' | 'delta'

export function StatChart({
	points,
	label,
	statId,
	mode = 'absolute',
}: {
	points: SeriesPoint[]
	label: string
	statId: string
	mode?: ChartMode
}) {
	const { resolvedTheme } = useTheme()
	const t = useTranslations('personal')
	const locale = useLocale()

	const shown = useMemo(
		() => (mode === 'delta' ? toDeltaPoints(points) : points),
		[points, mode]
	)

	const data = useMemo(() => {
		const labels = shown.map((p) => {
			const d = new Date(p.t)
			return Number.isNaN(d.getTime())
				? p.t
				: d.toLocaleString(locale, {
						day: '2-digit',
						month: '2-digit',
						hour: '2-digit',
						minute: '2-digit',
					})
		})
		const accent = mode === 'delta' ? '#22c55e' : '#0092D1'
		return {
			labels,
			datasets: [
				{
					label:
						mode === 'delta'
							? `${label} — ${t('chartGrowth')}`
							: label,
					data: shown.map((p) => p.v),
					fill: true,
					tension: 0,
					borderWidth: 2.5,
					pointRadius: 4,
					pointHoverRadius: 6,
					borderColor: accent,
					// Градиентная заливка как в демо на лендинге:
					// насыщенно под линией -> почти прозрачно к низу.
					backgroundColor: (context: {
						chart: {
							ctx: CanvasRenderingContext2D
							chartArea?: { top: number; bottom: number }
						}
					}) => {
						const { ctx, chartArea } = context.chart
						if (!chartArea) return `${accent}20`
						const gradient = ctx.createLinearGradient(
							0,
							chartArea.top,
							0,
							chartArea.bottom
						)
						gradient.addColorStop(0, `${accent}59`)
						gradient.addColorStop(1, `${accent}05`)
						return gradient
					},
				},
			],
		}
	}, [shown, label, mode, locale, t])

	const allEqual = shown.length > 1 && shown.every((p) => p.v === shown[0]!.v)

	const base = getBaseLineOptions()

	const options: ChartOptions<'line'> = {
		...base,
		plugins: {
			...base.plugins,
			tooltip: {
				...base.plugins?.tooltip,
				callbacks: {
					label: (ctx) =>
						` ${formatStatValue(statId, Number(ctx.parsed.y), locale)}`,
				},
			},
		},
		scales: {
			...base.scales,
			y: {
				...base.scales?.y,
				beginAtZero: mode === 'delta',
				ticks: {
					...base.scales?.y?.ticks,
					callback: (v) => formatStatValue(statId, Number(v), locale),
				},
			},
		},
	}

	if (points.length === 0) {
		return (
			<div className="py-8 text-center text-muted-foreground text-sm">
				{t('chartNoData')}
			</div>
		)
	}

	return (
		<div>
			{allEqual && (
				<p className="mb-1 text-muted-foreground text-xs">
					{t('chartUnchanged')}:{' '}
					{formatStatValue(statId, shown[0]!.v, locale)}
				</p>
			)}
			<div className="h-64">
				<Line
					data={data}
					key={`${resolvedTheme ?? 'light'}-${mode}`}
					options={options}
				/>
			</div>
			<div className="mt-1 flex justify-between text-muted-foreground text-xs">
				<span>{new Date(points[0]!.t).toLocaleString(locale)}</span>
				<span>
					{new Date(points[points.length - 1]!.t).toLocaleString(
						locale
					)}
				</span>
			</div>
		</div>
	)
}
