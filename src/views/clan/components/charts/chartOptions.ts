import type { ChartOptions, TooltipItem } from 'chart.js'
import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	Title,
	Tooltip,
} from 'chart.js'
import { getBaseBarOptions, getChartColors } from '@/lib/chart-theme'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export function baseBarOptions(title: string): ChartOptions<'bar'> {
	const base = getBaseBarOptions(title)

	return {
		...base,
		plugins: {
			...base.plugins,
			tooltip: {
				...base.plugins!.tooltip,
				callbacks: {
					label: (item: TooltipItem<'bar'>) =>
						`${item.dataset.label}: ${Number(item.raw ?? 0).toFixed(2)}`,
				},
			},
		},
	}
}

export function resultBarOptions(): ChartOptions<'bar'> {
	const colors = getChartColors()
	const base = baseBarOptions('')

	return {
		...base,
		plugins: {
			...base.plugins,
			title: { display: false, text: '' },
		},
		scales: {
			x: {
				ticks: {
					color: colors.axis,
					maxRotation: 45,
					font: { size: 11 },
				},
				grid: { display: false },
			},
			y: {
				beginAtZero: true,
				max: 1,
				ticks: { color: colors.axis, font: { size: 11 } },
				grid: { color: colors.grid },
			},
		},
	}
}

export function squadBarOptions(): ChartOptions<'bar'> {
	const base = baseBarOptions('')

	return {
		...base,
		plugins: {
			...base.plugins,
			title: { display: false, text: '' },
		},
	}
}
