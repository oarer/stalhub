import type { ChartOptions } from 'chart.js'
import { montserrat } from '@/app/fonts'

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
						family: montserrat.style.fontFamily,
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
				ticks: { color: colors.axis, font: { size: 11, weight: 'bold' } },
				grid: { color: colors.grid },
			},
		},
	}
}
