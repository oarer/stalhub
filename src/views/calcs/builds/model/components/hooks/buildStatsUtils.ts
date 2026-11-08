'use client'

import type { Art, Build } from '@/types/build.type'
import type { Item, Locale } from '@/types/item.type'
import { computeArtifactStatsFromParsed } from '@/views/calcs/builds/utils/computeArtifactStats'
import { parseItemStats } from '@/views/calcs/builds/utils/parseArtifact'
import {
	getDisplayName,
	getItemKeys,
	getNumericValue,
	HIDDEN_STAT_KEYS,
} from './itemStatsUtils'

export type BuildStats = Record<string, number>

export function computeArtifactStats(
	art: Art,
	itemsById: Map<string, Item>,
	locale: Locale
): BuildStats {
	const item = itemsById.get(art.item_id)
	if (!item) return {}

	const parsed = parseItemStats(item, locale)
	const stats = computeArtifactStatsFromParsed(
		art,
		parsed,
		art.selected_stats
	)

	const result: BuildStats = {}

	for (const [key, stat] of Object.entries(stats)) {
		const cleanKey = key.startsWith('add:') ? key.slice(4) : key
		result[cleanKey] = (result[cleanKey] ?? 0) + stat.final
	}

	return result
}

export function computeIsPercentMap(
	arts: Art[],
	artefactsById: Map<string, Item>,
	locale: Locale
): Record<string, boolean> {
	const map: Record<string, boolean> = {}
	for (const art of arts) {
		const item = artefactsById.get(art.item_id)
		if (!item) continue
		const parsed = parseItemStats(item, locale)
		const stats = computeArtifactStatsFromParsed(
			art,
			parsed,
			art.selected_stats
		)
		for (const [key, stat] of Object.entries(stats)) {
			const cleanKey = key.startsWith('add:') ? key.slice(4) : key
			if (stat.isPercent) map[cleanKey] = true
		}
	}
	return map
}

export function getContainerModifiers(containerItem: Item | undefined) {
	if (!containerItem) {
		return { effectiveness: 1, innerProtection: 0 }
	}

	return {
		effectiveness:
			getNumericValue(
				containerItem,
				'stalker.tooltip.backpack.stat_name.effectiveness'
			) / 100,
		innerProtection:
			getNumericValue(
				containerItem,
				'stalker.tooltip.backpack.stat_name.inner_protection'
			) / 100,
	}
}

// ignore container effects
const CONTAINER_MODIFIER_EXCLUDED_KEYS = new Set([
	'stalker.artefact_properties.factor.frost_accumulation',
])

const CONTAINER_ACCUMULATION_KEYS = new Set([
	'stalker.artefact_properties.factor.radiation_accumulation',
	'stalker.artefact_properties.factor.thermal_accumulation',
	'stalker.artefact_properties.factor.biological_accumulation',
	'stalker.artefact_properties.factor.psycho_accumulation',
])

export function applyContainerModifiers(
	stats: BuildStats,
	effectiveness: number,
	innerProtection: number
): BuildStats {
	const result: BuildStats = {}

	for (const key of Object.keys(stats)) {
		const currentVal = stats[key] ?? 0

		if (currentVal === 0 || CONTAINER_MODIFIER_EXCLUDED_KEYS.has(key)) {
			result[key] = currentVal
			continue
		}

		// Накопления заражений (радиация/термо/био/пси): внутренняя защита
		// гасит только положительный (вредный) вклад. Отрицательный вклад
		// (вывод заражений контр-артефактами) оставляем как есть.
		if (CONTAINER_ACCUMULATION_KEYS.has(key)) {
			result[key] =
				currentVal > 0 ? currentVal * (1 - innerProtection) : currentVal
			continue
		}

		// Обычные свойства (включая кровотечение и другие отрицательные):
		// масштабируются эффективностью в обе стороны.
		// Например: -18.2 при эффективности 115% -> -20.93.
		result[key] = currentVal * effectiveness
	}

	return result
}

export function getStatsFromItem(
	item: Item | undefined,
	allStatKeys: string[],
	level: number = 0
): BuildStats {
	const result: BuildStats = {}
	if (!item) return result

	for (const key of allStatKeys) {
		const val = getNumericValue(item, key, level)
		if (val !== 0) {
			result[key] = val
		}
	}

	return result
}

export function buildAllStatKeys(
	build: Build,
	armorsById: Map<string, Item>,
	containersById: Map<string, Item>,
	artefactsById: Map<string, Item>,
	consumablesById: Map<string, Item>
): string[] {
	const keys = new Set<string>()

	if (build.armor?.id) {
		const armorItem = armorsById.get(build.armor.id)
		if (armorItem) {
			getItemKeys(armorItem).forEach((k) => keys.add(k))
		}
	}

	if (build.container?.id) {
		const containerItem = containersById.get(build.container.id)
		if (containerItem) {
			getItemKeys(containerItem).forEach((k) => keys.add(k))
		}
	}

	for (const art of build.arts) {
		const artItem = artefactsById.get(art.item_id)
		if (artItem) {
			getItemKeys(artItem).forEach((k) => keys.add(k))
		}
	}

	for (const boostId of Object.values(build.boost).filter(
		(id): id is string => Boolean(id)
	)) {
		const boostItem = consumablesById.get(boostId)
		if (boostItem) {
			getItemKeys(boostItem).forEach((k) => keys.add(k))
		}
	}

	return Array.from(keys)
		.filter((k) => !HIDDEN_STAT_KEYS.has(k))
		.sort()
}

const keyToItemCache = new WeakMap<Item[], Map<string, Item>>()

function buildKeyToItemMap(allItems: Item[]): Map<string, Item> {
	const cached = keyToItemCache.get(allItems)
	if (cached) return cached

	const map = new Map<string, Item>()
	for (const item of allItems) {
		for (const key of getItemKeys(item)) {
			if (!map.has(key)) map.set(key, item)
		}
	}
	keyToItemCache.set(allItems, map)
	return map
}

export function buildDisplayNamesMap(
	allStatKeys: string[],
	allItems: Item[],
	locale: Locale
): Record<string, string> {
	const keyToItem = buildKeyToItemMap(allItems)
	const map: Record<string, string> = {}
	for (const key of allStatKeys) {
		const itemWithKey = keyToItem.get(key)
		if (itemWithKey) {
			map[key] = getDisplayName(itemWithKey, key, locale)
		}
	}
	return map
}

export function roundNumber(num: number): number {
	return Math.round(num * 100) / 100
}
