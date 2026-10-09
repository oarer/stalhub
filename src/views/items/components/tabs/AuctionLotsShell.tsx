'use client'

import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { useAuctionControls } from '@/hooks/useAuctionControls'
import { cn } from '@/lib/cn'
import type { ArtifactAdditional } from '@/utils/artUtils'
import { useModulesData } from '@/views/calcs/modules/utils/moduleCalc'
import { AuctionControls } from './AuctionControls'
import type { SortableLot } from './auctionSort'
import LotCardShell from './LotCardShell'
import VirtualizedLotGrid from './VirtualizedLotGrid'

export function LotRow({
	label,
	children,
}: {
	label: ReactNode
	children: ReactNode
}) {
	return (
		<div className="flex justify-between gap-2 text-sm">
			<span className="font-semibold text-foreground">{label}</span>
			<span className={cn('font-semibold', 'font-mono')}>{children}</span>
		</div>
	)
}

interface AuctionLotsShellProps<T> {
	data: T[]
	hasMore?: boolean
	onLoadMore?: () => void
	renderItem: (lot: T) => ReactNode
}

export function AuctionLotsShell<
	T extends SortableLot & { additional?: ArtifactAdditional },
>({ data, hasMore, onLoadMore, renderItem }: AuctionLotsShellProps<T>) {
	const t = useTranslations()
	useModulesData()

	const safeData = Array.isArray(data) ? data : []
	const controls = useAuctionControls(safeData)

	if (safeData.length === 0) {
		return (
			<Card.Root className="py-2">
				<Card.Header>
					<Card.Title className="justify-center text-foreground text-md">
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
						{renderItem(lot)}
					</LotCardShell>
				)}
			/>
		</div>
	)
}
