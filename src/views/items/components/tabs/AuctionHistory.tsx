'use client'

import type { ChartOptions } from 'chart.js'
import {
	CategoryScale,
	Chart as ChartJS,
	Tooltip as ChartTooltip,
	Legend,
	LinearScale,
	PointElement,
} from 'chart.js'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useMemo } from 'react'
import { Scatter } from 'react-chartjs-2'
import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/date'
import type { LotHistory } from '@/types/item.type'
import { calcArtifactPercent, getArtifactColor } from '@/utils/artUtils'

ChartJS.register(CategoryScale, LinearScale, PointElement, ChartTooltip, Legend)

type Props = {
	data?: LotHistory[]
}

type ChartPoint = {
	x: string
	y: number
	time: string
	amount: number
	artPercent: number
	qlt: number
	ptn: number
}

export default function AuctionHistory({ data }: Props) {
	const t = useTranslations()

	const { resolvedTheme } = useTheme()
	const isDark = resolvedTheme === 'dark'

	const options = useMemo<ChartOptions<'scatter'>>(
		() => ({
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				x: {
					reverse: true,
					type: 'category',
					ticks: {
						color: isDark ? '#aaa' : '#333',
						font: { weight: 'bold', size: 12 },
					},
					grid: { color: isDark ? '#44464c' : '#ccc' },
				},
				y: {
					type: 'linear',
					ticks: {
						color: isDark ? '#aaa' : '#333',
						font: { weight: 'bold', size: 12 },
					},
					grid: { color: isDark ? '#44464c' : '#ccc' },
				},
			},
			plugins: {
				legend: { display: false },
				tooltip: {
					mode: 'nearest',
					intersect: false,
					backgroundColor: isDark ? '#080808' : '#fff',
					titleColor: isDark ? '#fbfbfe' : '#171717',
					bodyColor: isDark ? '#d4d4d4' : '#525252',
					borderColor: isDark ? '#3d4a52' : '#badbeb',
					borderWidth: 2,
					padding: 12,
					displayColors: false,
					titleFont: { size: 13, weight: 'bold' },
					bodyFont: { size: 12, weight: 'bold' },
					callbacks: {
						title: (items) => {
							const raw = items?.[0]?.raw as
								| ChartPoint
								| undefined
							return raw ? `Дата: ${raw.time}` : ''
						},
						label: (context) => {
							const raw = context.raw as ChartPoint
							const lines: string[] = [
								`Цена: ${Intl.NumberFormat('ru-RU').format(raw.y)}`,
							]
							if (raw.amount > 1)
								lines.push(`Кол-во: ${raw.amount}`)
							if (raw.artPercent > 0)
								lines.push(
									`Процент: ${raw.artPercent.toFixed(2)}% `
								)
							if (raw.ptn > 0)
								lines.push(`Потенциал: ${raw.ptn} `)
							return lines
						},
					},
				},
			},
			elements: {
				point: { hoverRadius: 7 },
			},
		}),
		[isDark]
	)

	const safeData = Array.isArray(data) ? data : []

	const chartData = safeData.map((item) => ({
		time: formatDate(item.time),
		amount: item.amount,
		price: item.price,
		artPercent: item.additional ? calcArtifactPercent(item.additional) : 0,
		ptn: item.additional?.ptn ?? 0,
		qlt: item.additional?.qlt ?? 0,
	}))

	if (chartData.length === 0) {
		return (
			<Card.Root>
				<Card.Header>
					<Card.Title className="justify-center">
						{t('modals.builds.no_data')}
					</Card.Title>
				</Card.Header>
			</Card.Root>
		)
	}

	const points: ChartPoint[] = chartData.map((d) => ({
		x: d.time,
		y: d.price,
		time: d.time,
		amount: d.amount,
		artPercent: d.artPercent,
		qlt: d.qlt ?? 0,
		ptn: d.ptn ?? 0,
	}))

	const dataForChart = {
		labels: chartData.map((d) => d.time),
		datasets: [
			{
				label: 'История лотов',
				data: points,
				pointBackgroundColor: points.map((p) =>
					getArtifactColor(p.qlt)
				),
				pointBorderColor: isDark ? '#fff' : '#000',
				pointRadius: 5,
				showLine: false,
			},
		],
	}

	return (
		<Card.Root>
			<Card.Content className="h-80 w-full">
				<Scatter data={dataForChart} options={options} />
			</Card.Content>
		</Card.Root>
	)
}
