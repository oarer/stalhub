'use client'

import { useMemo } from 'react'
import { getLocale } from '@/lib/getLocale'
import { useBuildStore } from '@/stores/useBuild.store'
import type { BuildStats } from './buildStatsUtils'
import {
	applyContainerModifiers,
	buildAllStatKeys,
	buildDisplayNamesMap,
	computeArtifactStats,
	getStatsFromItem,
} from './buildStatsUtils'
import { useBuildItems } from './useBuildItems'
import { useContainerModifiers } from './useContainerModifiers'
import { useDerivedStats } from './useDerivedStats'

export { type BuildStats, roundNumber } from './buildStatsUtils'
export { useBuildItems } from './useBuildItems'
export { useContainerModifiers } from './useContainerModifiers'
export { useDerivedStats } from './useDerivedStats'

export function useBuildStats() {
	const build = useBuildStore((s) => s.build)
	const locale = getLocale()
	const { armors, containers, artefacts, consumables, allItems } =
		useBuildItems()

	const containerItem = useMemo(
		() => containers.find((c) => c.id === build.container?.id),
		[containers, build.container?.id]
	)

	const containerModifiers = useContainerModifiers(containerItem)

	const allStatKeys = useMemo(() => {
		return buildAllStatKeys(
			build,
			armors,
			containers,
			artefacts,
			consumables
		)
	}, [build, armors, containers, artefacts, consumables])

	const displayNamesMap = useMemo(() => {
		return buildDisplayNamesMap(allStatKeys, allItems, locale)
	}, [allItems, allStatKeys, locale])

	const stats = useMemo<BuildStats>(() => {
		// Статы брони и контейнера — без модификаторов
		const baseResult: BuildStats = {}

		const armorItem = armors.find((a) => a.id === build.armor?.id)
		if (armorItem && build.armor) {
			const level = build.armor.level ?? 0
			const armorStats = getStatsFromItem(armorItem, allStatKeys, level)
			for (const [key, val] of Object.entries(armorStats)) {
				baseResult[key] = (baseResult[key] ?? 0) + val
			}
		}

		if (containerItem) {
			const containerStats = getStatsFromItem(containerItem, allStatKeys)
			for (const [key, val] of Object.entries(containerStats)) {
				baseResult[key] = (baseResult[key] ?? 0) + val
			}
		}

		// Статы артефактов — применяем модификаторы контейнера
		const artResult: BuildStats = {}
		for (const art of build.arts) {
			const artStats = computeArtifactStats(art, artefacts, locale)
			for (const [key, val] of Object.entries(artStats)) {
				if (val !== 0) {
					artResult[key] = (artResult[key] ?? 0) + val
				}
			}
		}

		const artWithModifiers = applyContainerModifiers(
			artResult,
			containerModifiers.effectiveness,
			containerModifiers.innerProtection
		)

		// Объединяем: база + артефакты с модификаторами
		const result: BuildStats = { ...baseResult }
		for (const [key, val] of Object.entries(artWithModifiers)) {
			result[key] = (result[key] ?? 0) + val
		}

		for (const boostId of Object.values(build.boost).filter(Boolean)) {
			const boostItem = consumables.find((c) => c.id === boostId)
			if (boostItem) {
				const boostStats = getStatsFromItem(boostItem, allStatKeys)
				for (const [key, val] of Object.entries(boostStats)) {
					if (val !== 0) {
						result[key] = (result[key] ?? 0) + val
					}
				}
			}
		}

		return result
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

	const { prime, hps } = useDerivedStats(stats)

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
