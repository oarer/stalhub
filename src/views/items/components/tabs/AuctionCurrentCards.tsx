'use client'

import { useTranslations } from 'next-intl'
import { formatDate } from '@/lib/date'
import type { Lot } from '@/types/item.type'
import { formatPrice } from './AuctionChart'
import { AuctionLotsShell, LotRow } from './AuctionLotsShell'

type Props = {
	data: Lot[]
	hasMore?: boolean
	onLoadMore?: () => void
}

export default function AuctionCurrentCards({
	data,
	hasMore,
	onLoadMore,
}: Props) {
	const t = useTranslations()

	return (
		<AuctionLotsShell
			data={data}
			hasMore={hasMore}
			onLoadMore={onLoadMore}
			renderItem={(lot) => (
				<>
					<LotRow label={t('items.auction.listDate')}>
						{formatDate(lot.startTime, 'datetime')}
					</LotRow>
					<LotRow label={t('items.auction.endDate')}>
						{formatDate(lot.endTime, 'datetime')}
					</LotRow>
					{lot.startPrice != 0 && (
						<LotRow label={t('items.auction.startPrice')}>
							{formatPrice(lot.startPrice)}
						</LotRow>
					)}
					{lot.currentPrice != null && (
						<LotRow label={t('items.auction.currentPrice')}>
							{formatPrice(lot.currentPrice)}
						</LotRow>
					)}
					{lot.buyoutPrice != null && (
						<LotRow label={t('items.auction.buyout')}>
							{formatPrice(lot.buyoutPrice)}
						</LotRow>
					)}
					{lot.amount > 1 && (
						<LotRow label={t('items.auction.amount')}>
							{lot.amount}
						</LotRow>
					)}
				</>
			)}
		/>
	)
}
