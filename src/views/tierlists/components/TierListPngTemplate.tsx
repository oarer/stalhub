'use client'

import { forwardRef } from 'react'
import { montserrat, unbounded } from '@/app/fonts'
import {
	type InfoColor,
	type Item,
	infoColorMap,
	type Locale,
} from '@/types/item.type'
import {
	ALL_TIER_RANKS,
	TIER_RANK_COLORS,
	type TierItemKind,
	type TierListEntry,
	type TierRank,
} from '@/types/tier-list.type'

interface TierListPngTemplateProps {
	title: string
	entries: TierListEntry[]
	itemKind: TierItemKind
	items: Record<string, Item>
	locale: Locale
}

export const TierListPngTemplate = forwardRef<
	HTMLDivElement,
	TierListPngTemplateProps
>(function TierListPngTemplate(
	{ title, entries, itemKind, items, locale },
	ref
) {
	const grouped = ALL_TIER_RANKS.reduce(
		(acc, rank) => {
			acc[rank] = entries.filter((e) => e.rank === rank)
			return acc
		},
		{} as Record<TierRank, TierListEntry[]>
	)

	const getItemName = (entry: TierListEntry) => {
		const item = items[entry.item_id]
		if (!item) return entry.item_id
		const lines = (item.name as { lines?: Record<string, string> })?.lines
		return lines?.[locale] ?? lines?.en ?? item.id
	}

	const getItemColor = (entry: TierListEntry) => {
		const item = items[entry.item_id]
		if (!item) return entry.item_id
		return infoColorMap[item?.color as InfoColor]
	}

	const getItemIconUrl = (entry: TierListEntry) => {
		const item = items[entry.item_id]
		return item
			? `https://cdn.stalhub.dev/db/icons/${item.category}/${item.id}.png`
			: null
	}

	return (
		<div
			className="flex w-4xl flex-col gap-4 bg-card p-8 text-white"
			ref={ref}
		>
			<h1
				className={`${unbounded.className} font-bold text-2xl text-primary uppercase`}
			>
				stalhub.dev
			</h1>
			<h2 className={`${unbounded.className} text-3xl text-destructive`}>
				{title}
			</h2>
			<div className="flex flex-col gap-2">
				{ALL_TIER_RANKS.map((rank) => {
					const colors = TIER_RANK_COLORS[rank]
					const items = grouped[rank]
					return (
						<div className="flex gap-2" key={rank}>
							<div
								className={`flex size-14 shrink-0 items-center justify-center rounded-lg font-bold text-xl ring-2 ${colors.bg} ${colors.text} ${colors.ring}`}
							>
								{rank}
							</div>
							<div className="flex min-h-14 flex-1 flex-wrap items-center gap-2 rounded-lg border border-muted bg-card/50 p-2">
								{items.map((entry) => (
									<div
										className="flex items-center gap-2 rounded-md border border-muted bg-card px-3 py-1 text-sm"
										key={entry.id}
									>
										{getItemIconUrl(entry) && (
											<img
												alt=""
												className="size-8 object-contain"
												crossOrigin="anonymous"
												height={28}
												src={
													getItemIconUrl(entry) ?? ''
												}
												width={28}
											/>
										)}
										<span
											className={`${montserrat.className} truncate font-semibold`}
											style={{color: getItemColor(entry)}}
										>
											{getItemName(entry)}
										</span>
									</div>
								))}
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
})
