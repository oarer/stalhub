'use client'

import { useMemo } from 'react'
import {
	applySicknessEffects,
	computeSicknessEffects,
} from '@/constants/sickness'
import { getLocale } from '@/lib/getLocale'
import { useBuildStore } from '@/stores/useBuild.store'
import type { Build } from '@/types/build.type'
import { REACTION_KEYS } from '@/types/build.type'
import type { Item } from '@/types/item.type'
import type { BuildStats } from './buildStatsUtils'
import {
	applyContainerModifiers,
	buildAllStatKeys,
	buildDisplayNamesMap,
	computeArtifactStats,
	computeIsPercentMap,
	getStatsFromItem,
} from './buildStatsUtils'
import { BUILD_HIDDEN_STAT_KEYS, getThresholdLimits } from './itemStatsUtils'
import { useBuildItems } from './useBuildItems'
import { useContainerModifiers } from './useContainerModifiers'
import { useDerivedStats } from './useDerivedStats'

export { type BuildStats, roundNumber } from './buildStatsUtils'

export function useBuildStats(buildOverride?: Build) {
	const storeBuild = useBuildStore((s) => s.build)
	const build = buildOverride ?? storeBuild
	const locale = getLocale()
	const { armors, containers, artefacts, consumables, allItems } =
		useBuildItems()

	const armorsById = useMemo(
		() =>
			new Map<string, Item>(
				armors.map((item) => [item.id, item] as const)
			),
		[armors]
	)
	const containersById = useMemo(
		() =>
			new Map<string, Item>(
				containers.map((item) => [item.id, item] as const)
			),
		[containers]
	)
	const artefactsById = useMemo(
		() =>
			new Map<string, Item>(
				artefacts.map((item) => [item.id, item] as const)
			),
		[artefacts]
	)
	const consumablesById = useMemo(
		() =>
			new Map<string, Item>(
				consumables.map((item) => [item.id, item] as const)
			),
		[consumables]
	)

	const { armor, boost, reaction, sickness } = build

	const containerItem = useMemo(
		() =>
			build.container?.id
				? containersById.get(build.container.id)
				: undefined,
		[containersById, build.container?.id]
	)

	const containerModifiers = useContainerModifiers(containerItem)

	const thresholdLimits = useMemo(
		() => getThresholdLimits(containerItem),
		[containerItem]
	)

	const allStatKeys = useMemo(() => {
		return buildAllStatKeys(
			build,
			armorsById,
			containersById,
			artefactsById,
			consumablesById
		)
	}, [build, armorsById, containersById, artefactsById, consumablesById])

	const displayNamesMap = useMemo(() => {
		return buildDisplayNamesMap(allStatKeys, allItems, locale)
	}, [allItems, allStatKeys, locale])

	// сырые суммы статов артефактов (до модификаторов контейнера).
	// Нужны для расчёта итоговых статов: к ним применяются модификаторы
	// контейнера.
	const rawArtifactStats = useMemo<BuildStats>(() => {
		const artResult: BuildStats = {}
		for (const art of build.arts) {
			const artStats = computeArtifactStats(art, artefactsById, locale)
			for (const [key, val] of Object.entries(artStats)) {
				if (val !== 0) {
					artResult[key] = (artResult[key] ?? 0) + val
				}
			}
		}
		return artResult
	}, [build.arts, artefactsById, locale])

	// сырые суммы накоплений для варнингов: статы артефактов плюс
	// собственный вклад контейнера (бывает отрицательным, например вывод
	// холода). Лимиты Threshold выражены в сырых единицах
	// (limit = 10 / (1 - innerProtection)), поэтому собственный вклад
	// контейнера должен смещать сумму до сравнения с лимитом. Отдельно от
	// rawArtifactStats, чтобы не задваивать вклад контейнера в stats.
	const rawAccumulationStats = useMemo<BuildStats>(() => {
		const result: BuildStats = { ...rawArtifactStats }

		if (containerItem) {
			const containerStats = getStatsFromItem(containerItem, allStatKeys)
			for (const [key, val] of Object.entries(containerStats)) {
				if (key.includes('accumulation') && val !== 0) {
					result[key] = (result[key] ?? 0) + val
				}
			}
		}

		return result
	}, [rawArtifactStats, containerItem, allStatKeys])

	const stats = useMemo<BuildStats>(() => {
		// статы армора и контейнера - без модификаторов
		const baseResult: BuildStats = {}

		const armorItem = armor?.id ? armorsById.get(armor.id) : undefined
		if (armorItem && armor) {
			const level = armor.level ?? 0
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

		// статы артефактов - применяем модификаторы контейнера
		const artWithModifiers = applyContainerModifiers(
			rawArtifactStats,
			containerModifiers.effectiveness,
			containerModifiers.innerProtection
		)

		// объединяем: база + артефакты с модификаторами
		const result: BuildStats = { ...baseResult }
		for (const [key, val] of Object.entries(artWithModifiers)) {
			result[key] = (result[key] ?? 0) + val
		}

		for (const boostId of Object.values(boost).filter((id): id is string =>
			Boolean(id)
		)) {
			const boostItem = consumablesById.get(boostId)
			if (boostItem) {
				const boostStats = getStatsFromItem(boostItem, allStatKeys)
				for (const [key, val] of Object.entries(boostStats)) {
					if (val !== 0) {
						result[key] = (result[key] ?? 0) + val
					}
				}
			}
		}

		// реакция: если выбрана, её процент прибавляется к живучести и выносливости
		if (reaction) {
			const reactionVal = result[reaction] ?? 0
			if (reactionVal !== 0) {
				result['stalker.artefact_properties.factor.health_bonus'] =
					(result[
						'stalker.artefact_properties.factor.health_bonus'
					] ?? 0) + reactionVal
				result[
					'stalker.artefact_properties.factor.stamina_regeneration_bonus'
				] =
					(result[
						'stalker.artefact_properties.factor.stamina_regeneration_bonus'
					] ?? 0) + reactionVal
			}
		}

		// дебафы (заражения/болезни)
		const sicknessEffects = computeSicknessEffects(sickness)
		return applySicknessEffects(result, sicknessEffects)
	}, [
		armor,
		boost,
		reaction,
		sickness,
		armorsById,
		containerItem,
		rawArtifactStats,
		consumablesById,
		allStatKeys,
		containerModifiers,
	])

	const containerStats = useMemo<BuildStats>(() => {
		const result: BuildStats = {}

		if (!containerItem) return result

		// свой вклад контейнера + уже посчитанные статы артефактов,
		// чтобы не пересчитывать артефакты повторно
		Object.assign(result, getStatsFromItem(containerItem, allStatKeys))
		for (const [key, val] of Object.entries(rawArtifactStats)) {
			result[key] = (result[key] ?? 0) + val
		}

		const modified = applyContainerModifiers(
			result,
			containerModifiers.effectiveness,
			containerModifiers.innerProtection
		)

		if (reaction) {
			const reactionVal = modified[reaction] ?? 0
			if (reactionVal !== 0) {
				modified['stalker.artefact_properties.factor.health_bonus'] =
					(modified[
						'stalker.artefact_properties.factor.health_bonus'
					] ?? 0) + reactionVal
				modified[
					'stalker.artefact_properties.factor.stamina_regeneration_bonus'
				] =
					(modified[
						'stalker.artefact_properties.factor.stamina_regeneration_bonus'
					] ?? 0) + reactionVal
			}
		}

		return applySicknessEffects(modified, computeSicknessEffects(sickness))
	}, [
		reaction,
		sickness,
		containerItem,
		rawArtifactStats,
		allStatKeys,
		containerModifiers,
	])

	const { prime, hps, stopping, speed } = useDerivedStats(stats)
	const sortedStats = useMemo(() => {
		return Object.entries(stats)
			.filter(
				([key, val]) => val !== 0 && !BUILD_HIDDEN_STAT_KEYS.has(key)
			)
			.sort(([keyA], [keyB]) => {
				const nameA = displayNamesMap[keyA] ?? keyA
				const nameB = displayNamesMap[keyB] ?? keyB
				return nameA.localeCompare(nameB)
			})
	}, [stats, displayNamesMap])

	const sortedContainerStats = useMemo(() => {
		return Object.entries(containerStats)
			.filter(
				([key, val]) => val !== 0 && !BUILD_HIDDEN_STAT_KEYS.has(key)
			)
			.sort(([keyA], [keyB]) => {
				const nameA = displayNamesMap[keyA] ?? keyA
				const nameB = displayNamesMap[keyB] ?? keyB
				return nameA.localeCompare(nameB)
			})
	}, [containerStats, displayNamesMap])

	const isPercentMap = useMemo(
		() => computeIsPercentMap(build.arts, artefactsById, locale),
		[build.arts, artefactsById, locale]
	)

	const availableReactions = useMemo(() => {
		const keys = Object.values(REACTION_KEYS)
		return keys.filter((key) => (stats[key] ?? 0) !== 0)
	}, [stats])

	return {
		stats,
		containerStats,
		rawArtifactStats,
		rawAccumulationStats,
		displayNamesMap,
		isPercentMap,
		sortedStats,
		sortedContainerStats,
		prime,
		hps,
		stopping,
		speed,
		hasContainer: !!build.container,
		thresholdLimits,
		availableReactions,
		selectedReaction: build.reaction ?? null,
	}
}
