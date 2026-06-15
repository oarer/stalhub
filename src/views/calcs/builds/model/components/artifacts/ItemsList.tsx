'use client'

import { Icon } from '@iconify/react'
import { useVirtualizer } from '@tanstack/react-virtual'
import Image from 'next/image'
import { useMemo, useRef } from 'react'
import { cn } from '@/lib/cn'
import {
	type FavoriteType,
	useFavoritesStore,
} from '@/stores/useFavorites.store'
import type { Item, Locale } from '@/types/item.type'
import { colorPriority, InfoColor, infoColorMap } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'

//! TODO декомпозиция + кинуть в shared

type ItemsListProps = {
	items: Item[]
	locale: Locale
	onSelectItem?: (itemId: string) => void
	selectedItemId?: string | null
	className?: string
	favoriteType?: FavoriteType
	showFavorites?: boolean
}

type RowProps = {
	items: Item[]
	locale: Locale
	onSelectItem?: (itemId: string) => void
	selectedItemId?: string | null
	favoriteType?: FavoriteType
	isFavorite: (type: FavoriteType, id: string) => boolean
	toggleFavorite: (type: FavoriteType, id: string) => void
}

const Row = ({
	item,
	locale,
	onSelectItem,
	selectedItemId,
	favoriteType,
	isFavorite,
	toggleFavorite,
}: {
	item: Item
} & Omit<RowProps, 'items'>) => {
	const isActive = selectedItemId === item.id
	const itemColor = infoColorMap[item.color as InfoColor] || InfoColor.DEFAULT
	const isFav = favoriteType ? isFavorite(favoriteType, item.id) : false

	return (
		<div className="h-14">
			<div
				className="relative m-1 flex cursor-pointer items-center justify-between gap-2 rounded-xl p-2 ring-2 transition-colors"
				onClick={() => onSelectItem?.(item.id)}
				style={
					{
						background: isActive ? `${itemColor}40` : undefined,
						'--tw-ring-color': `${itemColor}80`,
					} as React.CSSProperties
				}
			>
				<div className="flex items-center gap-2">
					<Image
						alt={messageToString(item.name, locale)}
						className="h-8 w-8 object-contain"
						height={32}
						src={`https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/icons/${item.category}/${item.id}.png`}
						width={32}
					/>

					<p
						className="max-w-40 truncate font-semibold"
						style={{ color: itemColor }}
					>
						{messageToString(item.name, locale)}
					</p>
				</div>

				<button
					className={`cursor-pointer items-center justify-center rounded-full p-1 transition-all hover:-rotate-16 hover:bg-yellow-300/20 ${
						isFav ? 'bg-yellow-200/20' : ''
					}`}
					onClick={(e) => {
						e.stopPropagation()
						if (favoriteType) {
							toggleFavorite(favoriteType, item.id)
						}
					}}
					type="button"
				>
					<Icon
						className={`text-xl ${
							isFav ? 'text-yellow-400' : 'text-neutral-100'
						}`}
						icon="lucide:star"
					/>
				</button>
			</div>
		</div>
	)
}
export function ItemsList({
	items,
	locale,
	onSelectItem,
	selectedItemId,
	className,
	favoriteType,
	showFavorites = true,
}: ItemsListProps) {
	const parentRef = useRef<HTMLDivElement>(null)
	const { isFavorite, toggleFavorite, favorites } = useFavoritesStore()

	// biome-ignore lint: useExhaustiveDependencies
	const sortedItems = useMemo(() => {
		return [...items].sort((a, b) => {
			if (showFavorites && favoriteType) {
				const aFav = isFavorite(favoriteType, a.id)
				const bFav = isFavorite(favoriteType, b.id)
				if (aFav && !bFav) return -1
				if (!aFav && bFav) return 1
			}

			const aPriority = colorPriority[a.color as InfoColor] ?? 0
			const bPriority = colorPriority[b.color as InfoColor] ?? 0
			return bPriority - aPriority
		})
	}, [items, showFavorites, favoriteType, isFavorite, favorites])

	const virtualizer = useVirtualizer({
		count: sortedItems.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 56,
		overscan: 6,
	})

	return (
		<div className={cn('h-full min-h-0 w-full', className)}>
			<div
				className={cn(
					'mask-y-from-97% mask-y-to-100% w-full overflow-auto',
					className
				)}
				ref={parentRef}
			>
				<div
					style={{
						height: `${virtualizer.getTotalSize()}px`,
						width: '100%',
						position: 'relative',
					}}
				>
					{virtualizer.getVirtualItems().map((virtualRow) => {
						const item = sortedItems[virtualRow.index]

						return (
							<div
								data-index={virtualRow.index}
								key={item.id}
								ref={virtualizer.measureElement}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									width: '100%',
									transform: `translateY(${virtualRow.start}px)`,
								}}
							>
								<Row
									favoriteType={favoriteType}
									isFavorite={isFavorite}
									item={item}
									locale={locale}
									onSelectItem={onSelectItem}
									selectedItemId={selectedItemId}
									toggleFavorite={toggleFavorite}
								/>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}
