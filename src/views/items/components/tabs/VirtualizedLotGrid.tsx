'use client'

import { Fragment, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useVirtualizedRows } from '@/hooks/useVirtualizedRows'

type Props<T> = {
	items: T[]
	renderItem: (item: T) => ReactNode
	hasMore?: boolean
	onLoadMore?: () => void
}

export default function VirtualizedLotGrid<T>({
	items,
	renderItem,
	hasMore = false,
	onLoadMore,
}: Props<T>) {
	const rows = useMemo(() => {
		const paired: T[][] = []
		for (let i = 0; i < items.length; i += 2) {
			paired.push(items.slice(i, i + 2))
		}
		return paired
	}, [items])

	const { containerRef, virtualizer, visibleRows } = useVirtualizedRows(rows, {
		hasMore,
		onLoadMore,
	})

	return (
		<div
			className="relative w-full"
			ref={containerRef}
			style={{ height: `${virtualizer.getTotalSize()}px` }}
		>
			{virtualizer.getVirtualItems().map((virtualRow) => {
				const rowItems = visibleRows[virtualRow.index]
				if (!rowItems) return null
				return (
					<div
						className="absolute top-0 left-0 grid w-full grid-cols-1 gap-3 pb-3 sm:grid-cols-2"
						data-index={virtualRow.index}
						key={virtualRow.key}
						ref={virtualizer.measureElement}
						style={{
							transform: `translateY(${
								virtualRow.start - virtualizer.options.scrollMargin
							}px)`,
						}}
					>
						{rowItems.map((item, i) => (
							<Fragment key={i}>{renderItem(item)}</Fragment>
						))}
					</div>
				)
			})}
		</div>
	)
}
