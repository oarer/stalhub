'use client'

import { useTranslations } from 'next-intl'
import { formatDate } from '@/lib/date'
import type { LotHistory } from '@/types/item.type'
import { formatPrice } from './AuctionChart'
import { AuctionLotsShell, LotRow } from './AuctionLotsShell'

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

	return (
		<AuctionLotsShell
			data={data}
			hasMore={hasMore}
			onLoadMore={onLoadMore}
			renderItem={(lot) => (
				<>
					<LotRow label={t('items.auction.date')}>
						{formatDate(lot.time, 'datetime')}
					</LotRow>
					<LotRow label={t('arsenal.table.currentPrice')}>
						{formatPrice(lot.price)}
					</LotRow>
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
