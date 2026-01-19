'use client'

import { Icon } from '@iconify/react'

import { Tabs } from '@/components/ui/Tabs'
import type { Lot, LotHistory } from '@/types/item.type'
import AuctionHistory from './AuctionHistory'
import AuctionCurrent from './AuctionCurrent'

type Props = {
	auctionHistory: LotHistory[]
	auctionCurrent: Lot[]
}

export default function AuctionTabs({ auctionHistory, auctionCurrent }: Props) {
	return (
		<Tabs.Root className="w-full" defaultValue="aucHistory">
			<Tabs.List className="grid w-full grid-cols-2">
				<Tabs.Trigger value="aucHistory">
					<Icon className="text-lg" icon="lucide:book-open-text" />
					История продаж
				</Tabs.Trigger>
				<Tabs.Trigger value="aucCurrent">
					<Icon className="text-lg" icon="lucide:landmark" />
					Текущие лоты
				</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="aucHistory">
				<AuctionHistory data={auctionHistory} />
			</Tabs.Content>
			<Tabs.Content value="aucCurrent">
				<AuctionCurrent data={auctionCurrent} />
			</Tabs.Content>
		</Tabs.Root>
	)
}
