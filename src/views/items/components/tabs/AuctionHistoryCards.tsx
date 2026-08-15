'use client'

import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Card } from '@/components/ui/Card'
import { useAuctionControls } from '@/hooks/useAuctionControls'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/date'
import type { LotHistory } from '@/types/item.type'
import { useModulesData } from '@/views/calcs/modules/utils/moduleCalc'
import { formatPrice } from './AuctionChart'
import { AuctionControls } from './AuctionControls'
import LotCardShell from './LotCardShell'
import VirtualizedLotGrid from './VirtualizedLotGrid'

type Props = {
	data: LotHistory[]
	hasMore?: boolean
	onLoadMore?: () => void
}

export default function AuctionHistoryCards({
	data,
	hasMore,
	onLoadMore,
}: Props) {
	const t = useTranslations()
	useModulesData()

	const safeData = Array.isArray(data) ? data : []
	const controls = useAuctionControls(safeData)

	if (safeData.length === 0) {
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

	return (
		<div className="flex flex-col gap-3">
			<AuctionControls
				lots={safeData}
				onPriceChange={controls.setPrice}
				onSelectedModulesChange={controls.setSelectedModules}
				onSelectedRaritiesChange={controls.setSelectedRarities}
				onSortChange={controls.setSort}
				price={controls.price}
				selectedModules={controls.selectedModules}
				selectedRarities={controls.selectedRarities}
				sort={controls.sort}
			/>
			<VirtualizedLotGrid
				hasMore={hasMore}
				items={controls.filteredSorted}
				onLoadMore={onLoadMore}
				renderItem={(lot) => (
					<LotCardShell additional={lot.additional}>
						<div className="flex justify-between gap-2 text-sm">
							<span className="font-semibold text-text-accent">
								{t('items.auction.date')}
							</span>
							<span className={cn('font-semibold', montserrat.className)}>
								{formatDate(lot.time, 'datetime')}
							</span>
						</div>
						<div className="flex justify-between gap-2 text-sm">
							<span className="font-semibold text-text-accent">
								{t('arsenal.table.currentPrice')}
							</span>
							<span className={cn('font-semibold', montserrat.className)}>
								{formatPrice(lot.price)}
							</span>
						</div>
						{lot.amount > 1 && (
							<div className="flex justify-between gap-2 text-sm">
								<span className="font-semibold text-text-accent">
									{t('items.auction.amount')}
								</span>
								<span className={cn('font-semibold', montserrat.className)}>
									{lot.amount}
								</span>
							</div>
						)}
					</LotCardShell>
				)}
			/>
		</div>
	)
}
