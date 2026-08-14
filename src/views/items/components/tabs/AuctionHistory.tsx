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
			return raw ? `${t('items.auction.date')}: ${raw.time}` : ''
		},
		label: (context: TooltipItem<'scatter'>) => {
			const raw = context.raw as HistoryPoint
			return buildTooltipLines(t('arsenal.table.currentPrice'), raw.y, {
				...(raw.amount > 1 && {
					[t('items.auction.amount')]: raw.amount,
				}),
				...(raw.artPercent > 0 && {
					[t('modals.builds.settings.percent')]: `${raw.artPercent.toFixed(2)}%`,
				}),
				...(raw.ptn > 0 && {
					[t('modals.builds.settings.potential')]: raw.ptn,
				}),
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
			<Card.Root className="py-2">
				<Card.Header>
					<Card.Title className="justify-center text-md text-text-accent">
						{t('modals.builds.no_data')}
					</Card.Title>
				</Card.Header>
			</Card.Root>
		)
	}

	const dataForChart = createAuctionDataset(
		[
			{
				label: t('items.auction.lotHistory'),
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
