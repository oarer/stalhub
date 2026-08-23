import type { ChartOptions } from 'chart.js'
import {
	CategoryScale,
	Chart as ChartJS,
	Tooltip as ChartTooltip,
	Legend,
	LinearScale,
	PointElement,
} from 'chart.js'
import { getChartColors } from '@/lib/chart-theme'

ChartJS.register(CategoryScale, LinearScale, PointElement, ChartTooltip, Legend)

export type BaseChartPoint = {
	x: string
	y: number
	[key: string]: unknown
}

type TooltipCallbacks = NonNullable<
	NonNullable<ChartOptions<'scatter'>['plugins']>['tooltip']
>['callbacks']

type DatasetConfig = {
	label: string
	data: BaseChartPoint[]
	pointColorFn: (point: BaseChartPoint) => string
}

export function useAuctionChartOptions(
	tooltipCallbacks?: TooltipCallbacks
): ChartOptions<'scatter'> {
	const colors = getChartColors()

	return {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			x: {
				reverse: true,
				type: 'category',
				ticks: {
					color: colors.axis,
					font: { weight: 'bold', size: 12 },
				},
				grid: { color: colors.grid },
			},
			y: {
				type: 'linear',
				ticks: {
					color: colors.axis,
					font: { weight: 'bold', size: 12 },
				},
				grid: { color: colors.grid },
			},
		},
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
				callbacks: tooltipCallbacks,
			},
		},
		elements: {
			point: { hoverRadius: 7 },
		},
	}
}

export function createAuctionDataset(
	configs: DatasetConfig[],
	isDark: boolean
) {
	return {
		labels: configs[0]?.data.map((p) => p.x) ?? [],
		datasets: configs.map((cfg) => ({
			label: cfg.label,
			data: cfg.data,
			pointBackgroundColor: cfg.data.map((p) => cfg.pointColorFn(p)),
			pointBorderColor: isDark ? '#fff' : '#000',
			pointRadius: 5,
			showLine: false,
		})),
	}
}

export function formatPrice(value: number): string {
	return Intl.NumberFormat('ru-RU').format(value)
}

export function buildTooltipLines(
	priceLabel: string,
	basePrice: number,
	extra: Record<string, number | string | undefined>
): string[] {
	const lines = [`${priceLabel}: ${formatPrice(basePrice)}`]

	for (const [key, value] of Object.entries(extra)) {
		if (value !== undefined && value !== '' && value !== 0) {
			lines.push(`${key}: ${value}`)
		}
	}

	return lines
}
