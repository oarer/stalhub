'use client'

import type { TooltipItem } from 'chart.js'
import { useTranslations } from 'next-intl'
import { Scatter } from 'react-chartjs-2'
import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/date'
import type { LotHistory } from '@/types/item.type'
import { calcArtifactPercent, getArtifactColor } from '@/utils/artUtils'
import {
	type BaseChartPoint,
	buildTooltipLines,
	createAuctionDataset,
	useAuctionChartOptions,
} from './AuctionChart'

type Props = {
	data?: LotHistory[]
}

type HistoryPoint = BaseChartPoint & {
	time: string
	amount: number
	artPercent: number
	qlt: number
	ptn: number
}

export default function AuctionHistory({ data }: Props) {
	const t = useTranslations()

	const tooltipCallbacks = {
		title: (items: TooltipItem<'scatter'>[]) => {
			const raw = items?.[0]?.raw as HistoryPoint | undefined
			return raw ? `Дата: ${raw.time}` : ''
		},
		label: (context: TooltipItem<'scatter'>) => {
			const raw = context.raw as HistoryPoint
			return buildTooltipLines(raw.y, {
				...(raw.amount > 1 && { 'Кол-во': raw.amount }),
				...(raw.artPercent > 0 && {
					Процент: `${raw.artPercent.toFixed(2)}%`,
				}),
				...(raw.ptn > 0 && { Потенциал: raw.ptn }),
			})
		},
	}

	const options = useAuctionChartOptions(tooltipCallbacks)

	const safeData = Array.isArray(data) ? data : []

	const points: HistoryPoint[] = safeData.map((item) => ({
		x: formatDate(item.time),
		y: item.price,
		time: formatDate(item.time),
		amount: item.amount,
		artPercent: item.additional ? calcArtifactPercent(item.additional) : 0,
		ptn: item.additional?.ptn ?? 0,
		qlt: item.additional?.qlt ?? 0,
	}))

	if (points.length === 0) {
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

	const dataForChart = createAuctionDataset(
		[
			{
				label: 'История лотов',
				data: points,
				pointColorFn: (p) => getArtifactColor((p as HistoryPoint).qlt),
			},
		],
		options.scales?.x?.ticks?.color === '#aaa'
	)

	return (
		<Card.Root>
			<Card.Content className="h-80 w-full">
				<Scatter data={dataForChart} options={options} />
			</Card.Content>
		</Card.Root>
	)
}
