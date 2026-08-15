'use client'

import { useWindowVirtualizer } from '@tanstack/react-virtual'
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'

type Options = {
	estimateSize?: number
	bottomThreshold?: number
	hasMore?: boolean
	onLoadMore?: () => void
}

export function useVirtualizedRows<T>(
	rows: T[][],
	{
		estimateSize = 180,
		bottomThreshold = 500,
		hasMore = false,
		onLoadMore,
	}: Options = {}
) {
	const containerRef = useRef<HTMLDivElement>(null)
	const [scrollMargin, setScrollMargin] = useState(0)
	const onLoadMoreRef = useRef(onLoadMore)
	onLoadMoreRef.current = onLoadMore

	const virtualizer = useWindowVirtualizer({
		count: rows.length,
		estimateSize: () => estimateSize,
		overscan: 5,
		scrollMargin,
	})

	const loadMore = useCallback(() => {
		onLoadMoreRef.current?.()
	}, [])

	useLayoutEffect(() => {
		const update = () => {
			if (!containerRef.current) return
			const rect = containerRef.current.getBoundingClientRect()
			setScrollMargin(rect.top + window.scrollY)
		}
		update()
		window.addEventListener('resize', update)
		return () => window.removeEventListener('resize', update)
	}, [])

	/* biome-ignore lint/correctness/useExhaustiveDependencies: re-check the bottom after rows grow to auto-fill */
	useEffect(() => {
		if (!hasMore) return
		const doc = document.documentElement
		if (
			doc.scrollHeight - window.scrollY - window.innerHeight <
			bottomThreshold
		) {
			loadMore()
		}
	}, [hasMore, bottomThreshold, rows.length, loadMore])

	useEffect(() => {
		if (!hasMore) return
		const onScroll = () => {
			const doc = document.documentElement
			if (
				doc.scrollHeight - window.scrollY - window.innerHeight <
				bottomThreshold
			) {
				loadMore()
			}
		}
		window.addEventListener('scroll', onScroll, { passive: true })
		return () => window.removeEventListener('scroll', onScroll)
	}, [hasMore, bottomThreshold, loadMore])

	return {
		containerRef,
		virtualizer,
		visibleRows: rows,
	}
}
