'use client'

import type { TooltipItem } from 'chart.js'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { Scatter } from 'react-chartjs-2'
import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/date'
import type { Lot } from '@/types/item.type'
import type { ModuleAttribute } from '@/types/module.type'
import { calcArtifactPercent, getArtifactColor } from '@/utils/artUtils'
import { useModulesData } from '@/views/calcs/modules/utils/moduleCalc'
import {
	type BaseChartPoint,
	createAuctionDataset,
	formatPrice,
	useAuctionChartOptions,
} from './AuctionChart'
import { buildModuleAttributeLines } from './LotDetails'

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
	attributes: ModuleAttribute[]
}

export default function AuctionCurrent({ data }: Props) {
	const t = useTranslations()
	const { resolvedTheme } = useTheme()
	useModulesData()

	const tooltipCallbacks = {
		title: (items: TooltipItem<'scatter'>[]) => {
			const raw = items?.[0]?.raw as CurrentPoint | undefined
			return raw ? `${t('items.auction.listDate')}: ${raw.time}` : ''
		},
		label: (context: TooltipItem<'scatter'>) => {
			const raw = context.raw as CurrentPoint
			const lines: string[] = [
				`${t('items.auction.endDate')}: ${raw.endTime}`,
				`${t('items.auction.startPrice')}: ${formatPrice(raw.startPrice)}`,
				`${t('items.auction.currentPrice')}: ${
					raw.currentPrice != null
						? formatPrice(raw.currentPrice)
						: '—'
				}`,
			]

			if (raw.buyoutPrice != null) {
				lines.push(
					`${t('items.auction.buyout')}: ${formatPrice(raw.buyoutPrice)}`
				)
			}

			if (raw.amount > 1)
				lines.push(`${t('items.auction.amount')}: ${raw.amount}`)

			if (raw.attributes.length > 0) {
				lines.push(...buildModuleAttributeLines(raw.attributes))
			} else {
				if (raw.artPercent > 0)
					lines.push(
						`${t('modals.builds.settings.percent')}: ${raw.artPercent.toFixed(2)}%`
					)
				if (raw.ptn > 0)
					lines.push(
						`${t('modals.builds.settings.potential')}: ${raw.ptn}`
					)
			}

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
			attributes: item.additional?.attributes ?? [],
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
				label: t('items.auction.current'),
				data: points,
				pointColorFn: (p) => getArtifactColor((p as CurrentPoint).qlt),
			},
		],
		resolvedTheme === 'dark'
	)

	return (
		<Card.Root>
			<Card.Content className="h-80 w-full">
				<Scatter data={dataForChart} options={options} />
			</Card.Content>
		</Card.Root>
	)
}
