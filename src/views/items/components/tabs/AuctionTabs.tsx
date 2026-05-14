'use client'

import { Icon } from '@iconify/react'

import { Tabs } from '@/components/ui/Tabs'
import { cn } from '@/lib/cn'
import type { BarterResponse } from '@/types/barter.type'
import type { Lot, LotHistory } from '@/types/item.type'
import AuctionCurrent from './AuctionCurrent'
import AuctionHistory from './AuctionHistory'
import Barter from './Barter'

type Props = {
	auctionHistory: LotHistory[]
	auctionCurrent: Lot[]
	barter: BarterResponse | null
}

// исправить невидимый блок (мб компонент аукциона его возвращает)
// а я ебу кто его возвращает
// оно само пофиксилось
// нихуя не пофиксилось
export default function ItemTabs({
	auctionHistory,
	auctionCurrent,
	barter,
}: Props) {
	return (
		<Tabs.Root className="w-full" defaultValue="aucHistory">
			<Tabs.List
				className={cn(
					'grid w-full grid-cols-2 gap-2',
					barter && 'sm:grid-cols-3'
				)}
			>
				<Tabs.Trigger value="aucHistory">
					<Icon className="text-lg" icon="lucide:book-open-text" />
					История продаж
				</Tabs.Trigger>

				<Tabs.Trigger value="aucCurrent">
					<Icon className="text-lg" icon="lucide:landmark" />
					Текущие лоты
				</Tabs.Trigger>

				{barter && (
					<Tabs.Trigger
						className="col-span-2 sm:col-span-1"
						value="barter"
					>
						<Icon className="text-lg" icon="lucide:landmark" />
						Бартер
					</Tabs.Trigger>
				)}
			</Tabs.List>
			<Tabs.Content value="aucHistory">
				<AuctionHistory data={auctionHistory} />
			</Tabs.Content>
			<Tabs.Content value="aucCurrent">
				<AuctionCurrent data={auctionCurrent} />
			</Tabs.Content>
			<Tabs.Content value="barter">
				{barter && <Barter data={barter} />}
			</Tabs.Content>
		</Tabs.Root>
	)
}
