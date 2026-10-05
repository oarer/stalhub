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
import { unbounded } from '@/app/fonts'
import { getChartColors } from '@/lib/chart-theme'
import type { BPSimResult } from '../utils/bp'

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Legend,
	Filler
)

const CHART_FONT = unbounded.style.fontFamily
ChartJS.defaults.font.family = CHART_FONT

const shortDate = (iso: string) =>
	new Date(`${iso}T12:00:00`).toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'short',
	})

export function BPProgressChart({ sim }: { sim: BPSimResult }) {
	const labels = useMemo(() => sim.days.map((d) => d.date), [sim])

	const data = useMemo((): ChartData<'line'> => {
		return {
			labels,
			datasets: [
				{
					label: 'level',
					data: sim.days.map((d) => d.level),
					borderColor: '#fafafa',
					backgroundColor: 'rgba(250,250,250,0.06)',
					borderWidth: 2,
					pointRadius: 0,
					pointHitRadius: 8,
					pointHoverRadius: 4,
					stepped: true,
					fill: true,
					tension: 0,
				},
				{
					label: 'target',
					data: sim.days.map(() => sim.targetLevel),
					borderColor: 'rgba(161,161,170,0.7)',
					borderWidth: 1.5,
					borderDash: [6, 5],
					pointRadius: 0,
					pointHitRadius: 0,
					tension: 0,
				},
			],
		}
	}, [sim, labels])

	const colors = getChartColors()

	const options: ChartOptions<'line'> = {
		maintainAspectRatio: false,
		responsive: true,
		interaction: { mode: 'index', intersect: false },
		plugins: {
			legend: { display: false },
			tooltip: {
				backgroundColor: colors.tooltip.background,
				titleColor: colors.tooltip.titleColor,
				bodyColor: colors.tooltip.bodyColor,
				borderColor: colors.tooltip.borderColor,
				borderWidth: 1,
				padding: 10,
				titleFont: { size: 12, weight: 'bold', family: CHART_FONT },
				bodyFont: { size: 12, family: CHART_FONT },
				callbacks: {
					title: (items: TooltipItem<'line'>[]) => {
						const i = items[0]?.dataIndex ?? 0
						return labels[i] ? shortDate(labels[i]) : ''
					},
					label: (ctx: TooltipItem<'line'>) => {
						const v = ctx.parsed.y ?? 0
						return ` ${Math.round(v).toLocaleString('ru-RU')} ур.`
					},
				},
			},
		},
		scales: {
			x: {
				grid: { display: false },
				border: { color: colors.axis },
				ticks: {
					color: colors.axis,
					maxTicksLimit: 8,
					font: { size: 11, family: CHART_FONT },
					callback: (_, index) => shortDate(labels[index] ?? ''),
				},
			},
			y: {
				beginAtZero: true,
				suggestedMax: sim.targetLevel,
				border: { color: colors.axis },
				grid: { color: colors.grid },
				ticks: {
					color: colors.axis,
					font: { size: 11, family: CHART_FONT },
					maxTicksLimit: 5,
					callback: (v) =>
						typeof v === 'number' ? v.toLocaleString('ru-RU') : v,
				},
			},
		},
	}

	return (
		<div className="relative h-64 w-full md:h-72">
			<Line data={data} options={options} />
		</div>
	)
}
