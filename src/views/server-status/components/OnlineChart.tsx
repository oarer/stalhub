'use client'

import {
	CategoryScale,
	type ChartData,
	Chart as ChartJS,
	type ChartOptions,
	Filler,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Tooltip,
	type TooltipItem,
} from 'chart.js'
import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import { montserrat } from '@/app/fonts'
import { getChartColors } from '@/lib/chart-theme'
import type { ServerOnlineHistoryPoint } from '@/types/server-online.type'

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Legend,
	Filler
)

const REGION_LABELS: Record<string, string> = {
	RU: 'RU',
	OFT: 'OFT',
	EU: 'EU',
	NA: 'NA',
	NEA: 'NEA',
	SEA: 'SEA',
	GLOBAL: 'GLOBAL',
}

const REGION_COLORS: Record<string, string> = {
	RU: '#8b5cf6',
	OFT: '#f59e0b',
	EU: '#38bdf8',
	NA: '#34d399',
	NEA: '#fbbf24',
	SEA: '#fb7185',
	GLOBAL: '#a78bfa',
}

function formatTime(iso: string): string {
	const date = new Date(iso)
	const hh = String(date.getHours()).padStart(2, '0')
	const mm = String(date.getMinutes()).padStart(2, '0')
	return `${hh}:${mm}`
}

export function OnlineChart({
	history,
}: {
	history: ServerOnlineHistoryPoint[]
}) {
	const chartData = useMemo((): ChartData<'line'> => {
		const labels = Array.from(
			new Set(history.map((p) => p.createdAt))
		).sort()

		const series = new Map<
			string,
			{ label: string; color: string; data: (number | null)[] }
		>()
		for (const region of Object.keys(REGION_LABELS)) {
			series.set(region, {
				label: REGION_LABELS[region],
				color: REGION_COLORS[region],
				data: labels.map(() => null),
			})
		}

		for (const p of history) {
			const entry = series.get(p.region)
			if (!entry) continue
			const index = labels.indexOf(p.createdAt)
			if (index === -1) continue
			entry.data[index] = (entry.data[index] ?? 0) + p.online
		}

		return {
			labels,
			datasets: Array.from(series.values())
				.filter((s) => s.data.some((v) => v !== null))
				.map((s) => ({
					label: s.label,
					data: s.data,
					borderColor: s.color,
					backgroundColor: s.color,
					borderWidth: 2.5,
					pointStyle: 'rectRounded',
					pointRadius: 2,
					pointHitRadius: 6,
					pointHoverRadius: 5,
					tension: 0.25,
					fill: false,
				})),
		}
	}, [history])

	const colors = getChartColors()

	const options: ChartOptions<'line'> = {
		maintainAspectRatio: false,
		responsive: true,
		interaction: {
			mode: 'index',
			intersect: false,
		},
		plugins: {
			legend: {
				display: true,
				position: 'top',
				labels: {
					usePointStyle: true,
					pointStyle: 'rectRounded',
					boxWidth: 10,
					boxHeight: 10,
					padding: 12,
					color: colors.axis,
					font: {
						size: 12,
						weight: 'bold',
						family: montserrat.style.fontFamily,
					},
				},
			},
			tooltip: {
				backgroundColor: colors.tooltip.background,
				titleColor: colors.tooltip.titleColor,
				bodyColor: colors.tooltip.bodyColor,
				borderColor: colors.tooltip.borderColor,
				borderWidth: 1,
				usePointStyle: true,
				padding: 12,
				titleFont: { size: 13, weight: 'bold' },
				bodyFont: { size: 12, weight: 'bold' },
				callbacks: {
					title: (items: TooltipItem<'line'>[]) => {
						if (!items.length) return ''
						const label =
							(items[0].chart.data.labels as string[])[
								items[0].dataIndex
							] ?? ''
						return formatTime(label)
					},
					label: (ctx: TooltipItem<'line'>) => {
						const value = ctx.parsed.y ?? 0
						return ` ${ctx.dataset.label} : ${Math.round(value).toLocaleString()}`
					},
				},
			},
		},
		scales: {
			x: {
				grid: { display: false },
				border: {
					color: colors.axis,
				},
				ticks: {
					color: colors.axis,
					maxTicksLimit: 10,
					font: { size: 11, weight: 'bold' },
				},
			},
			y: {
				beginAtZero: true,
				border: {
					color: colors.axis,
				},
				grid: {
					color: colors.grid,
				},
				ticks: {
					color: colors.axis,
					font: { size: 11, weight: 'bold' },
					callback: (value) => {
						if (typeof value !== 'number') return value
						return Math.round(value).toLocaleString()
					},
				},
			},
		},
	}

	return (
		<div className="relative h-72 w-full">
			<Line data={chartData} options={options} />
		</div>
	)
}
