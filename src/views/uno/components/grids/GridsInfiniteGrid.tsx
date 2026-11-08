'use client'

import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { UnoGridSummary } from '@/types/uno/uno.type'
import { GridCard } from './GridCard'

const PAGE_SIZE = 18
const ESTIMATED_ROW_HEIGHT = 240
const OVERSCAN = 4

function getColumns(width: number) {
	if (width >= 1024) return 3
	if (width >= 640) return 2
	return 1
}

function chunk(items: UnoGridSummary[], size: number) {
	const rows: UnoGridSummary[][] = []
	for (let index = 0; index < items.length; index += size) {
		rows.push(items.slice(index, index + size))
	}
	return rows
}

export function GridsInfiniteGrid({ items }: { items: UnoGridSummary[] }) {
	const containerRef = useRef<HTMLDivElement>(null)
	const [columns, setColumns] = useState(3)
	const [scrollMargin, setScrollMargin] = useState(0)
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

	useLayoutEffect(() => {
		const update = () => {
			setColumns(getColumns(window.innerWidth))
			if (containerRef.current) {
				const rect = containerRef.current.getBoundingClientRect()
				setScrollMargin(rect.top + window.scrollY)
			}
		}
		update()
		window.addEventListener('resize', update)
		return () => window.removeEventListener('resize', update)
	}, [])

	const visibleItems = useMemo(
		() => items.slice(0, visibleCount),
		[items, visibleCount]
	)
	const rows = useMemo(
		() => chunk(visibleItems, columns),
		[visibleItems, columns]
	)
	const hasMore = visibleCount < items.length

	const virtualizer = useWindowVirtualizer({
		count: rows.length,
		estimateSize: () => ESTIMATED_ROW_HEIGHT,
		overscan: OVERSCAN,
		scrollMargin,
	})

	const virtualRows = virtualizer.getVirtualItems()
	const lastIndex = virtualRows[virtualRows.length - 1]?.index ?? -1

	useEffect(() => {
		if (!hasMore || lastIndex < rows.length - 2) return
		setVisibleCount((current) =>
			Math.min(items.length, current + PAGE_SIZE)
		)
	}, [hasMore, lastIndex, rows.length, items.length])

	return (
		<div
			className="relative"
			ref={containerRef}
			style={{ height: virtualizer.getTotalSize() }}
		>
			{virtualRows.map((virtualRow) => {
				const row = rows[virtualRow.index]

				return (
					<div
						className="absolute inset-x-0 top-0 pb-3"
						data-index={virtualRow.index}
						key={virtualRow.key}
						ref={virtualizer.measureElement}
						style={{
							transform: `translateY(${virtualRow.start - scrollMargin}px)`,
						}}
					>
						<div
							className="grid gap-3"
							style={{
								gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
							}}
						>
							{row.map((grid) => (
								<GridCard grid={grid} key={grid.id} />
							))}
						</div>
					</div>
				)
			})}
		</div>
	)
}
