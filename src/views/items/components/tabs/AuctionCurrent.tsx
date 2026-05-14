'use client'

import type { TooltipItem } from 'chart.js'
import { useTranslations } from 'next-intl'
import { Scatter } from 'react-chartjs-2'
import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/date'
import type { Lot } from '@/types/item.type'
import { calcArtifactPercent, getArtifactColor } from '@/utils/artUtils'
import {
	type BaseChartPoint,
	createAuctionDataset,
	formatPrice,
	useAuctionChartOptions,
} from './AuctionChart'

type Props = {
	data?: Lot[]
}

type CurrentPoint = BaseChartPoint & {
	time: string
	endTime: string
	amount: number
	artPercent: number
	qlt: number
	ptn: number
	startPrice: number
	currentPrice?: number
	buyoutPrice?: number | null
	isBuyout: boolean
}

export default function AuctionCurrent({ data }: Props) {
	const t = useTranslations()

	const tooltipCallbacks = {
		title: (items: TooltipItem<'scatter'>[]) => {
			const raw = items?.[0]?.raw as CurrentPoint | undefined
			return raw ? `Дата выставления: ${raw.time}` : ''
		},
		label: (context: TooltipItem<'scatter'>) => {
			const raw = context.raw as CurrentPoint
			const lines: string[] = [
				`Окончание торгов: ${raw.endTime}`,
				`Начальная ставка: ${formatPrice(raw.startPrice)}`,
				`Текущая ставка: ${
					raw.currentPrice != null
						? formatPrice(raw.currentPrice)
						: '—'
				}`,
			]

			if (raw.buyoutPrice != null) {
				lines.push(`Выкуп: ${formatPrice(raw.buyoutPrice)}`)
			}

			if (raw.amount > 1) lines.push(`Кол-во: ${raw.amount}`)
			if (raw.artPercent > 0)
				lines.push(`Процент: ${raw.artPercent.toFixed(2)}%`)
			if (raw.ptn > 0) lines.push(`Потенциал: ${raw.ptn}`)

			return lines
		},
	}

	const options = useAuctionChartOptions(tooltipCallbacks)

	const safeData = Array.isArray(data) ? data : []

	const points: CurrentPoint[] = safeData.map((item) => {
		const useBuyout = item.buyoutPrice != null
		const startTime = formatDate(item.startTime)
		const endTime = formatDate(item.endTime)
		return {
			x: startTime,
			y: useBuyout ? (item.buyoutPrice as number) : item.startPrice,
			time: startTime,
			endTime: endTime,
			amount: item.amount,
			artPercent: item.additional
				? calcArtifactPercent(item.additional)
				: 0,
			ptn: item.additional?.ptn ?? 0,
			qlt: item.additional?.qlt ?? 0,
			startPrice: item.startPrice,
			currentPrice: item.currentPrice,
			buyoutPrice: item.buyoutPrice ?? null,
			isBuyout: useBuyout,
		}
	})

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
				label: 'Текущие лоты',
				data: points,
				pointColorFn: (p) => getArtifactColor((p as CurrentPoint).qlt),
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
