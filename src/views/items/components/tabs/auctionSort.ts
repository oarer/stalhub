import type { ModuleRarity } from '@/types/module.type'
import type { ArtifactAdditional } from '@/utils/artUtils'
import { calcArtifactPercent } from '@/utils/artUtils'
import {
	calcModulePct,
	getRarityByQuality,
	getRarityIndex,
} from '@/views/calcs/modules/utils/moduleCalc'

export type AuctionSortKey = 'default' | 'price' | 'rarity' | `module:${string}`

export const RARITY_ORDER: ModuleRarity[] = [
	'common',
	'uncommon',
	'special',
	'rare',
	'exclusive',
	'legendary',
	'unique',
]

export interface SortableLot {
	additional?: ArtifactAdditional
	startPrice?: number
	currentPrice?: number
	price?: number
}

export interface LotRangeFilter {
	min?: number
	max?: number
}

export interface LotFilters {
	price: LotRangeFilter
	percent: LotRangeFilter
	selectedModules?: Set<string>
	selectedRarities?: Set<ModuleRarity>
}

export function getLotPrice(lot: SortableLot): number {
	if (typeof lot.price === 'number') return lot.price
	return lot.currentPrice ?? lot.startPrice ?? 0
}

export function getLotRarityRank(additional?: ArtifactAdditional): number {
	if (!additional) return 0

	const attributes = additional.attributes ?? []
	if (attributes.length > 0) {
		const maxPct = Math.max(...attributes.map((a) => calcModulePct(a)))
		return getRarityIndex(getRarityByQuality(maxPct))
	}

	if (additional.qlt != null) {
		return additional.qlt + 1
	}

	return 0
}

export function getLotRarityName(
	additional?: ArtifactAdditional
): ModuleRarity | null {
	const rank = getLotRarityRank(additional)
	if (rank === 0) return null
	return RARITY_ORDER[rank - 1] ?? null
}

export function getLotModulePercent(
	additional: ArtifactAdditional | undefined,
	definitionId: string
): number | null {
	if (!additional) return null

	const attr = (additional.attributes ?? []).find(
		(a) => a.definitionId === definitionId
	)
	if (!attr) return null

	return calcModulePct(attr)
}

export function getBestSelectedPercent(
	additional: ArtifactAdditional | undefined,
	selected: Set<string>
): number | null {
	if (!additional) return null

	let best: number | null = null
	for (const attr of additional.attributes ?? []) {
		if (!selected.has(attr.definitionId)) continue
		const pct = calcModulePct(attr)
		if (best === null || pct > best) best = pct
	}

	return best
}

export function getLotPercent(
	lot: SortableLot,
	selectedModules?: Set<string>
): number | null {
	if (!lot.additional) return null

	const attributes = lot.additional.attributes ?? []
	if (attributes.length > 0) {
		if (selectedModules?.size) {
			return getBestSelectedPercent(lot.additional, selectedModules)
		}
		return Math.max(...attributes.map((a) => calcModulePct(a)))
	}

	if (lot.additional.qlt != null) {
		return calcArtifactPercent(lot.additional)
	}

	return null
}

export function filterLots<T extends SortableLot>(
	lots: T[],
	filters: LotFilters
): T[] {
	const { price, percent, selectedModules, selectedRarities } = filters

	return lots.filter((lot) => {
		if (selectedModules?.size) {
			const attributes = lot.additional?.attributes ?? []
			if (!attributes.some((a) => selectedModules.has(a.definitionId))) {
				return false
			}
		}

		if (selectedRarities?.size) {
			const rarity = getLotRarityName(lot.additional)
			if (!rarity || !selectedRarities.has(rarity)) {
				return false
			}
		}

		const lotPrice = getLotPrice(lot)
		if (price.min != null && lotPrice < price.min) return false
		if (price.max != null && lotPrice > price.max) return false

		const lotPercent = getLotPercent(lot, selectedModules)
		if (
			percent.min != null &&
			(lotPercent === null || lotPercent < percent.min)
		) {
			return false
		}
		if (
			percent.max != null &&
			(lotPercent === null || lotPercent > percent.max)
		) {
			return false
		}

		return true
	})
}

export function sortLots<T extends SortableLot>(
	lots: T[],
	key: AuctionSortKey,
	selectedModules?: Set<string>
): T[] {
	if (key === 'price') {
		return [...lots].sort((a, b) => getLotPrice(b) - getLotPrice(a))
	}

	if (key === 'rarity') {
		return [...lots].sort(
			(a, b) =>
				getLotRarityRank(b.additional) - getLotRarityRank(a.additional)
		)
	}

	if (key.startsWith('module:')) {
		const definitionId = key.slice('module:'.length)
		return [...lots].sort((a, b) => {
			const pa = getLotModulePercent(a.additional, definitionId)
			const pb = getLotModulePercent(b.additional, definitionId)

			if (pa === null && pb === null) return 0
			if (pa === null) return 1
			if (pb === null) return -1
			return pb - pa
		})
	}

	if (selectedModules?.size) {
		return [...lots].sort((a, b) => {
			const pa = getBestSelectedPercent(a.additional, selectedModules)
			const pb = getBestSelectedPercent(b.additional, selectedModules)

			if (pa === null && pb === null) return 0
			if (pa === null) return 1
			if (pb === null) return -1
			return pb - pa
		})
	}

	return lots
}
