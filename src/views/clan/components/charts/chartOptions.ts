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
import { montserrat } from '@/app/fonts'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const AXIS_LIGHT = '#525252'
const AXIS_DARK = '#a3a3a3'
const GRID_LIGHT = '#e5e5e5'
const GRID_DARK = '#3f3f46'

export function baseBarOptions(
	isDark: boolean,
	title: string
): ChartOptions<'bar'> {
	const axisColor = isDark ? AXIS_DARK : AXIS_LIGHT
	const gridColor = isDark ? GRID_DARK : GRID_LIGHT

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
					color: isDark ? '#c2c2c2' : '#404040',
					font: {
						size: 12,
						weight: 'bold',
						family: montserrat.style.fontFamily,
					},
				},
			},
			title: {
				display: false,
				text: title,
			},
			tooltip: {
				mode: 'nearest',
				intersect: false,
				backgroundColor: isDark ? '#080808' : '#fff',
				titleColor: isDark ? '#fbfbfe' : '#171717',
				bodyColor: isDark ? '#d4d4d4' : '#525252',
				borderColor: isDark ? '#3d4a52' : '#e5e5e5',
				borderWidth: 1,
				titleFont: { size: 13, weight: 'bold' },
				bodyFont: { size: 12, weight: 'bold' },
				padding: 10,
				callbacks: {
					label: (item: TooltipItem<'bar'>) =>
						`${item.dataset.label}: ${Number(item.raw ?? 0).toFixed(2)}`,
				},
			},
		},
		scales: {
			x: {
				ticks: {
					color: axisColor,
					maxRotation: 45,
					font: { size: 11, weight: 'bold' },
				},
				grid: { display: false },
			},
			y: {
				beginAtZero: true,
				ticks: { color: axisColor, font: { size: 11, weight: 'bold' } },
				grid: { color: gridColor },
			},
		},
	}
}

export function resultBarOptions(isDark: boolean): ChartOptions<'bar'> {
	const base = baseBarOptions(isDark, '')
	const axisColor = isDark ? AXIS_DARK : AXIS_LIGHT
	const gridColor = isDark ? GRID_DARK : GRID_LIGHT

	return {
		...base,
		plugins: {
			...base.plugins,
			title: { display: false, text: '' },
		},
		scales: {
			x: {
				ticks: {
					color: axisColor,
					maxRotation: 45,
					font: { size: 11 },
				},
				grid: { display: false },
			},
			y: {
				beginAtZero: true,
				max: 1,
				ticks: { color: axisColor, font: { size: 11 } },
				grid: { color: gridColor },
			},
		},
	}
}

export function squadBarOptions(isDark: boolean): ChartOptions<'bar'> {
	const base = baseBarOptions(isDark, '')

	return {
		...base,
		plugins: {
			...base.plugins,
			title: { display: false, text: '' },
		},
	}
}
