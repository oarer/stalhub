'use client'

import { useMemo, useState } from 'react'
import type { ModuleRarity } from '@/types/module.type'
import {
	type AuctionSortKey,
	filterLots,
	type LotRangeFilter,
	type SortableLot,
	sortLots,
} from '@/views/items/components/tabs/auctionSort'

export function useAuctionControls<T extends SortableLot>(lots: T[]) {
	const [sort, setSort] = useState<AuctionSortKey>('default')
	const [selectedModules, setSelectedModules] = useState<string[]>([])
	const [selectedRarities, setSelectedRarities] = useState<ModuleRarity[]>([])
	const [price, setPrice] = useState<LotRangeFilter>({})
	const [percent, setPercent] = useState<LotRangeFilter>({})

	const selectedSet = useMemo(
		() => new Set(selectedModules),
		[selectedModules]
	)

	const raritySet = useMemo(
		() => new Set(selectedRarities),
		[selectedRarities]
	)

	const filteredSorted = useMemo(() => {
		const filtered = filterLots(lots, {
			price,
			percent,
			selectedModules: selectedSet,
			selectedRarities: raritySet,
		})
		return sortLots(filtered, sort, selectedSet)
	}, [lots, price, percent, selectedSet, raritySet, sort])

	return {
		sort,
		setSort,
		selectedModules,
		setSelectedModules,
		selectedRarities,
		setSelectedRarities,
		price,
		setPrice,
		percent,
		setPercent,
		filteredSorted,
	}
}
