'use client'

import { Icon } from '@iconify/react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import type { Lot, LotHistory } from '@/types/item.type'
import AuctionHistory from './AuctionHistory'
import AuctionCurrent from './AuctionCurrent'

type Props = {
    auctionHistory: LotHistory[]
    auctionCurrent: Lot[]
}

export default function AuctionTabs({ auctionHistory, auctionCurrent }: Props) {
    return (
        <Tabs className="w-full" defaultValue="aucHistory">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="aucHistory">
                    <Icon className="text-lg" icon="lucide:book-open-text" />
                    История продаж
                </TabsTrigger>
                <TabsTrigger value="aucCurrent">
                    <Icon className="text-lg" icon="lucide:landmark" />
                    Текущие лоты
                </TabsTrigger>
            </TabsList>
            <TabsContent value="aucHistory">
                <AuctionHistory data={auctionHistory} />
            </TabsContent>
            <TabsContent value="aucCurrent">
                <AuctionCurrent data={auctionCurrent} />
            </TabsContent>
        </Tabs>
    )
}
