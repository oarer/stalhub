'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

import { Tabs } from '@/components/ui/Tabs'
import { cn } from '@/lib/cn'
import type { BarterResponse } from '@/types/barter.type'
import type { Lot, LotHistory } from '@/types/item.type'
import AuctionAutoRefresh from './AuctionAutoRefresh'
import AuctionCurrent from './AuctionCurrent'
import AuctionCurrentCards from './AuctionCurrentCards'
import AuctionHistory from './AuctionHistory'
import AuctionHistoryCards from './AuctionHistoryCards'
import Barter from './Barter'

type Props = {
	auctionHistory: LotHistory[]
	auctionCurrent: Lot[]
	barter: BarterResponse | null
	historyHasMore: boolean
	currentHasMore: boolean
	onHistoryLoadMore: () => void
	onCurrentLoadMore: () => void
	autoRefreshEnabled?: boolean
	onAutoRefreshEnabledChange?: (enabled: boolean) => void
	autoRefreshIntervalSec?: number
	onAutoRefreshIntervalChange?: (sec: number) => void
	onManualRefresh?: () => void
	isRefreshing?: boolean
	lastUpdatedAt?: number
}

export default function ItemTabs({
	auctionHistory,
	auctionCurrent,
	barter,
	historyHasMore,
	currentHasMore,
	onHistoryLoadMore,
	onCurrentLoadMore,
	autoRefreshEnabled = false,
	onAutoRefreshEnabledChange,
	autoRefreshIntervalSec = 30,
	onAutoRefreshIntervalChange,
	onManualRefresh,
	isRefreshing = false,
	lastUpdatedAt,
}: Props) {
	const t = useTranslations()

	return (
		<div className="flex w-full flex-col gap-3">
			{onAutoRefreshEnabledChange &&
				onAutoRefreshIntervalChange &&
				onManualRefresh && (
					<AuctionAutoRefresh
						enabled={autoRefreshEnabled}
						intervalSec={autoRefreshIntervalSec}
						isFetching={isRefreshing}
						lastUpdatedAt={lastUpdatedAt}
						onEnabledChange={onAutoRefreshEnabledChange}
						onIntervalChange={onAutoRefreshIntervalChange}
						onRefresh={onManualRefresh}
					/>
				)}
			<Tabs.Root className="w-full" defaultValue="cards">
				<Tabs.List
					className={cn(
						'grid w-full grid-cols-2 gap-2',
						barter && 'sm:grid-cols-3'
					)}
				>
					<Tabs.Trigger value="cards">
						<Icon className="text-lg" icon="lucide:layout-grid" />
						{t('items.auction.cards')}
					</Tabs.Trigger>

					<Tabs.Trigger value="charts">
						<Icon className="text-lg" icon="lucide:chart-scatter" />
						{t('items.auction.charts')}
					</Tabs.Trigger>

					{barter && (
						<Tabs.Trigger
							className="col-span-2 sm:col-span-1"
							value="barter"
						>
							<Icon className="text-lg" icon="lucide:landmark" />
							{t('barter.currency_options.barter')}
						</Tabs.Trigger>
					)}
				</Tabs.List>

				<Tabs.Content value="cards">
					<AuctionSubTabs
						current={
							<AuctionCurrentCards
								data={auctionCurrent}
								hasMore={currentHasMore}
								onLoadMore={onCurrentLoadMore}
							/>
						}
						history={
							<AuctionHistoryCards
								data={auctionHistory}
								hasMore={historyHasMore}
								onLoadMore={onHistoryLoadMore}
							/>
						}
					/>
				</Tabs.Content>

				<Tabs.Content value="charts">
					<AuctionSubTabs
						current={<AuctionCurrent data={auctionCurrent} />}
						history={<AuctionHistory data={auctionHistory} />}
					/>
				</Tabs.Content>

				<Tabs.Content value="barter">
					{barter && <Barter data={barter} />}
				</Tabs.Content>
			</Tabs.Root>
		</div>
	)
}

function AuctionSubTabs({
	history,
	current,
}: {
	history: ReactNode
	current: ReactNode
}) {
	const t = useTranslations()

	return (
		<Tabs.Root defaultValue="current">
			<Tabs.List className="grid w-full grid-cols-2 gap-2">
				<Tabs.Trigger value="history">
					<Icon className="text-lg" icon="lucide:book-open-text" />
					{t('items.auction.history')}
				</Tabs.Trigger>

				<Tabs.Trigger value="current">
					<Icon className="text-lg" icon="lucide:landmark" />
					{t('items.auction.current')}
				</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="history">{history}</Tabs.Content>
			<Tabs.Content value="current">{current}</Tabs.Content>
		</Tabs.Root>
	)
}
