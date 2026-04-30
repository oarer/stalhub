'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { getLocale } from '@/lib/getLocale'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { useBuildStore } from '@/stores/useBuild.store'
import type { Art } from '@/types/build.type'
import type { Item, Locale } from '@/types/item.type'
import { computeArtifactStatsFromParsed } from '@/utils/computeArtifactStats'
import { parseItemStats } from '@/utils/parseArtifact'
import {
	getDisplayName,
	getItemKeys,
	getNumericValue,
	HIDDEN_STAT_KEYS,
} from './useItemStats'

export type BuildStats = Record<string, number>

function computeArtifactStats(
	art: Art,
	items: Item[],
	locale: Locale
): BuildStats {
	const item = items.find((i) => i.id === art.itemId)
	if (!item) return {}

	const parsed = parseItemStats(item, locale)
	const stats = computeArtifactStatsFromParsed(art, parsed, art.selectedStats)

	const result: BuildStats = {}

	for (const [key, stat] of Object.entries(stats)) {
		const cleanKey = key.startsWith('add:') ? key.slice(4) : key
		result[cleanKey] = (result[cleanKey] ?? 0) + stat.final
	}

	return result
}

function getContainerModifiers(
	containerItem: Item | undefined,
	locale: Locale
) {
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

function applyContainerModifiers(
	stats: BuildStats,
	effectiveness: number,
	innerProtection: number
): BuildStats {
	const result: BuildStats = {}

	for (const key of Object.keys(stats)) {
		const isAccumulation = key.includes('accumulation')
		const currentVal = stats[key] ?? 0

		if (currentVal > 0) {
			result[key] = isAccumulation
				? currentVal * (1 - innerProtection)
				: currentVal * effectiveness
		} else {
			result[key] = currentVal
		}
	}

	return result
}

function getStatsFromItem(
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

export function useBuildStats() {
	const build = useBuildStore((s) => s.build)
	const locale = getLocale()

	const armorsQuery = useSuspenseQuery(itemsQueries.get({ type: 'armor' }))
	const containersQuery = useSuspenseQuery(
		itemsQueries.get({ type: 'containers' })
	)
	const artefactsQuery = useSuspenseQuery(
		itemsQueries.get({ type: 'artefact' })
	)
	const consumablesQuery = useSuspenseQuery(
		itemsQueries.get({ type: 'consumables' })
	)

	const armors = armorsQuery.data ?? []
	const containers = containersQuery.data ?? []
	const artefacts = artefactsQuery.data ?? []
	const consumables = consumablesQuery.data ?? []

	const allItems = useMemo(
		() => [...armors, ...containers, ...artefacts, ...consumables],
		[armors, containers, artefacts, consumables]
	)

	const containerItem = useMemo(
		() => containers.find((c) => c.id === build.container?.id),
		[containers, build.container?.id]
	)

	const containerModifiers = useMemo(
		() => getContainerModifiers(containerItem, locale),
		[containerItem, locale]
	)

	const allStatKeys = useMemo(() => {
		const keys = new Set<string>()

		if (build.armor?.id) {
			const armorItem = armors.find((a) => a.id === build.armor?.id)
			if (armorItem) {
				getItemKeys(armorItem).forEach((k) => keys.add(k))
			}
		}

		if (build.container?.id) {
			const containerItem = containers.find(
				(c) => c.id === build.container?.id
			)
			if (containerItem) {
				getItemKeys(containerItem).forEach((k) => keys.add(k))
			}
		}

		for (const art of build.arts) {
			const artItem = artefacts.find((a) => a.id === art.itemId)
			if (artItem) {
				getItemKeys(artItem).forEach((k) => keys.add(k))
			}
		}

		for (const boostId of Object.values(build.boost).filter(Boolean)) {
			const boostItem = consumables.find((c) => c.id === boostId)
			if (boostItem) {
				getItemKeys(boostItem).forEach((k) => keys.add(k))
			}
		}

		return Array.from(keys)
			.filter((k) => !HIDDEN_STAT_KEYS.has(k))
			.sort()
	}, [build, armors, containers, artefacts, consumables])

	const displayNamesMap = useMemo(() => {
		const map: Record<string, string> = {}
		for (const key of allStatKeys) {
			const itemWithKey = allItems.find((item) => {
				return getItemKeys(item).has(key)
			})
			if (itemWithKey) {
				map[key] = getDisplayName(itemWithKey, key, locale)
			}
		}
		return map
	}, [allItems, allStatKeys, locale])

	const stats = useMemo<BuildStats>(() => {
		const result: BuildStats = {}

		const armorItem = armors.find((a) => a.id === build.armor?.id)
		if (armorItem && build.armor) {
			const level = build.armor.level ?? 0
			const armorStats = getStatsFromItem(armorItem, allStatKeys, level)
			for (const [key, val] of Object.entries(armorStats)) {
				result[key] = (result[key] ?? 0) + val
			}
		}

		if (containerItem) {
			const containerStats = getStatsFromItem(containerItem, allStatKeys)
			for (const [key, val] of Object.entries(containerStats)) {
				result[key] = (result[key] ?? 0) + val
			}
		}

		for (const art of build.arts) {
			const artStats = computeArtifactStats(art, artefacts, locale)
			for (const [key, val] of Object.entries(artStats)) {
				if (val !== 0) {
					result[key] = (result[key] ?? 0) + val
				}
			}
		}

		const withBoosts = applyContainerModifiers(
			result,
			containerModifiers.effectiveness,
			containerModifiers.innerProtection
		)

		for (const boostId of Object.values(build.boost).filter(Boolean)) {
			const boostItem = consumables.find((c) => c.id === boostId)
			if (boostItem) {
				const boostStats = getStatsFromItem(boostItem, allStatKeys)
				for (const [key, val] of Object.entries(boostStats)) {
					if (val !== 0) {
						withBoosts[key] = (withBoosts[key] ?? 0) + val
					}
				}
			}
		}

		return withBoosts
	}, [
		build,
		armors,
		containerItem,
		artefacts,
		consumables,
		allStatKeys,
		locale,
		containerModifiers,
	])

	const containerStats = useMemo<BuildStats>(() => {
		const result: BuildStats = {}

		if (!containerItem) return result

		const containerOnlyStats = getStatsFromItem(containerItem, allStatKeys)
		for (const [key, val] of Object.entries(containerOnlyStats)) {
			result[key] = val
		}

		for (const art of build.arts) {
			const artStats = computeArtifactStats(art, artefacts, locale)
			for (const [key, val] of Object.entries(artStats)) {
				if (val !== 0) {
					result[key] = (result[key] ?? 0) + val
				}
			}
		}

		return applyContainerModifiers(
			result,
			containerModifiers.effectiveness,
			containerModifiers.innerProtection
		)
	}, [
		build,
		containerItem,
		artefacts,
		allStatKeys,
		locale,
		containerModifiers,
	])

	const prime = useMemo(() => {
		const bulletDmg =
			stats['stalker.artefact_properties.factor.bullet_dmg_factor'] ?? 0
		const healthBonus =
			stats['stalker.artefact_properties.factor.health_bonus'] ?? 0
		return Number(((100 + bulletDmg) * (healthBonus + 100)) / 100).toFixed(
			2
		)
	}, [stats])

	const hps = useMemo(() => {
		const artefaktHeal =
			stats['stalker.artefact_properties.factor.artefakt_heal'] ?? 0
		const healingEfficiency =
			stats['stalker.artefact_properties.factor.healing_efficiency'] ?? 0
		const regenerationBonus =
			stats['stalker.artefact_properties.factor.regeneration_bonus'] ?? 0
		const healthBonus =
			stats['stalker.artefact_properties.factor.health_bonus'] ?? 0

		return (
			(artefaktHeal + healingEfficiency + (regenerationBonus + 2.5) / 5) *
			(1 + healthBonus / 100)
		).toFixed(2)
	}, [stats])

	const sortedStats = useMemo(() => {
		return Object.entries(stats)
			.filter(([, val]) => val !== 0)
			.sort(([keyA], [keyB]) => {
				const nameA = displayNamesMap[keyA] ?? keyA
				const nameB = displayNamesMap[keyB] ?? keyB
				return nameA.localeCompare(nameB)
			})
	}, [stats, displayNamesMap])

	const sortedContainerStats = useMemo(() => {
		return Object.entries(containerStats)
			.filter(([, val]) => val !== 0)
			.sort(([keyA], [keyB]) => {
				const nameA = displayNamesMap[keyA] ?? keyA
				const nameB = displayNamesMap[keyB] ?? keyB
				return nameA.localeCompare(nameB)
			})
	}, [containerStats, displayNamesMap])

	return {
		stats,
		containerStats,
		displayNamesMap,
		sortedStats,
		sortedContainerStats,
		prime,
		hps,
		hasContainer: !!build.container,
	}
}

export function roundNumber(num: number): number {
	return Math.round(num * 100) / 100
}
