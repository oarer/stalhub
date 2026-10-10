import type { ChartOptions } from 'chart.js'
import { unbounded } from '@/app/fonts'

function token(name: string): string {
	if (typeof document === 'undefined') return ''

	return getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim()
}

export function getChartColors() {
	return {
		tooltip: {
			background: token('--card'),
			titleColor: token('--card-foreground'),
			bodyColor: token('--card-foreground'),
			borderColor: token('--primary'),
		},
		axis: token('--muted-foreground'),
		grid: token('--muted'),
	}
}

const lineTickFont = { size: 11, weight: 'bold' } as const

/** Общая база для линейных графиков в стиле DamageChart: тултип из токенов, без сетки и легенды */
export function getBaseLineOptions(): ChartOptions<'line'> {
	const colors = getChartColors()

	return {
		maintainAspectRatio: false,
		responsive: true,
		interaction: { intersect: false, mode: 'index' },
		plugins: {
			legend: { display: false },
			tooltip: {
				mode: 'nearest',
				intersect: false,
				backgroundColor: colors.tooltip.background,
				titleColor: colors.tooltip.titleColor,
				bodyColor: colors.tooltip.bodyColor,
				borderColor: colors.tooltip.borderColor,
				borderWidth: 2,
				padding: 12,
				displayColors: false,
				titleFont: { size: 13, weight: 'bold' },
				bodyFont: { size: 12, weight: 'bold' },
			},
		},
		scales: {
			x: {
				ticks: {
					color: colors.axis,
					maxTicksLimit: 6,
					maxRotation: 0,
					font: lineTickFont,
				},
				grid: { display: false },
			},
			y: {
				beginAtZero: true,
				ticks: {
					color: colors.axis,
					maxTicksLimit: 6,
					font: lineTickFont,
				},
				grid: { display: false },
			},
		},
	}
}

export function getBaseBarOptions(title: string): ChartOptions<'bar'> {
	const colors = getChartColors()

	return {
		maintainAspectRatio: false,
		responsive: true,
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
						family: unbounded.style.fontFamily,
					},
				},
			},
			title: { display: false, text: title },
			tooltip: {
				mode: 'nearest',
				intersect: false,
				backgroundColor: colors.tooltip.background,
				titleColor: colors.tooltip.titleColor,
				bodyColor: colors.tooltip.bodyColor,
				borderColor: colors.tooltip.borderColor,
				borderWidth: 1,
				titleFont: { size: 13, weight: 'bold' },
				bodyFont: { size: 12, weight: 'bold' },
				padding: 10,
			},
		},
		scales: {
			x: {
				ticks: {
					color: colors.axis,
					maxRotation: 45,
					font: { size: 11, weight: 'bold' },
				},
				grid: { display: false },
			},
			y: {
				beginAtZero: true,
				ticks: {
					color: colors.axis,
					font: { size: 11, weight: 'bold' },
				},
				grid: { color: colors.grid },
			},
		},
	}
}
