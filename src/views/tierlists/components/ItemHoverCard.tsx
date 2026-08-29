'use client'

import Image from 'next/image'
import { useLocale } from 'next-intl'
import type React from 'react'
import { montserrat } from '@/app/fonts'
import { HoverCard } from '@/components/ui/HoverCard'
import type {
	AddStatBlock,
	ElementListBlock,
	Item,
	Locale,
} from '@/types/item.type'
import { type InfoColor, infoColorMap } from '@/types/item.type'
import { TIER_RANK_COLORS, type TierRank } from '@/types/tier-list.type'
import { messageToString } from '@/utils/itemUtils'
import { ListBlock } from '@/views/items/components/blocks'
import { formatTierTtk } from '../utils/tier-ttk'

function getIconUrl(item: Item) {
	return `https://cdn.stalhub.dev/db/icons/${item.category}/${item.id}.png`
}

const isStatList = (b: unknown): b is AddStatBlock | ElementListBlock => {
	if (!b || typeof b !== 'object') return false
	const block = b as { type?: string; elements?: unknown[] }
	return (
		(block.type === 'list' || block.type === 'addStat') &&
		Array.isArray(block.elements) &&
		(block.elements?.length ?? 0) > 0
	)
}

function ItemStats({ item, locale }: { item: Item; locale: Locale }) {
	const statBlocks = item.infoBlocks.filter(isStatList)

	return (
		<div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
			{statBlocks.map((block, i) => (
				<ListBlock
					block={block}
					className="text-xs"
					key={i}
					locale={locale}
					numericVariants={15}
					withCard={false}
				/>
			))}
		</div>
	)
}

export function ItemHoverCard({
	item,
	children,
	side = 'right',
	ttk,
	ammoName,
	rankChange,
}: {
	item: Item
	children: React.ReactNode
	side?: 'top' | 'bottom' | 'left' | 'right'
	ttk?: number
	ammoName?: string | null
	rankChange?: { prev: TierRank; curr: TierRank } | null
}) {
	const locale = useLocale() as Locale
	const name = messageToString(item.name, locale) || item.id
	const ttkText = formatTierTtk(ttk ?? 0)

	return (
		<HoverCard.Root>
			<HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
			<HoverCard.Content
				align="start"
				className="flex w-72 flex-col gap-2 p-3"
				side={side}
			>
				<div className="flex items-center gap-2">
					<Image
						alt={name}
						className="size-8 shrink-0 object-contain"
						height={32}
						src={getIconUrl(item)}
						width={32}
					/>
					<span
						className={`${montserrat.className} truncate font-semibold text-sm`}
						style={{ color: infoColorMap[item.color as InfoColor] }}
					>
						{name}
					</span>
				</div>

				{ttk !== undefined && (
					<div className="flex items-center justify-between rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-xs">
						<span className="font-semibold text-text-accent">
							TTK
						</span>
						<span className="font-bold font-mono text-primary">
							{ttkText} с
						</span>
					</div>
				)}

				{ammoName && (
					<p className="mb-1 text-text-accent text-xs">{ammoName}</p>
				)}

				{rankChange && rankChange.prev !== rankChange.curr && (
					<div className="flex items-center gap-2 rounded-md border border-muted bg-card/60 px-2 py-1 text-xs">
						<span className="text-text-accent">Tier</span>
						<span
							className={`inline-flex h-5 w-7 items-center justify-center rounded font-bold ${TIER_RANK_COLORS[rankChange.prev].bg} ${TIER_RANK_COLORS[rankChange.prev].text}`}
						>
							{rankChange.prev}
						</span>
						<span className="text-text-accent/60">→</span>
						<span
							className={`inline-flex h-5 w-7 items-center justify-center rounded font-bold ${TIER_RANK_COLORS[rankChange.curr].bg} ${TIER_RANK_COLORS[rankChange.curr].text}`}
						>
							{rankChange.curr}
						</span>
					</div>
				)}

				<ItemStats item={item} locale={locale} />
			</HoverCard.Content>
		</HoverCard.Root>
	)
}
