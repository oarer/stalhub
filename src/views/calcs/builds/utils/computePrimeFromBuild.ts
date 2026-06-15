import type { Build } from '@/types/build.type'
import type { Item, Locale } from '@/types/item.type'
import { getNumericValue } from '../model/components/hooks'
import { parseItemStats } from './parseArtifact'
import { computeArtifactStatsFromParsed } from './computeArtifactStats'

const BULLET_KEY = 'stalker.artefact_properties.factor.bullet_dmg_factor'
const HEALTH_KEY = 'stalker.artefact_properties.factor.health_bonus'

export function computePrimeFromBuild(
	build: Build,
	armors: Item[],
	containers: Item[],
	artefacts: Item[],
	consumables: Item[],
	locale: Locale
): number {
	const result: Record<string, number> = {}

	const containerItem = containers.find((c) => c.id === build.container?.id)
	const effectiveness = containerItem
		? getNumericValue(
				containerItem,
				'stalker.tooltip.backpack.stat_name.effectiveness'
			) / 100
		: 1

	const KEYS = [BULLET_KEY, HEALTH_KEY]

	const armorItem = armors.find((a) => a.id === build.armor?.id)
	if (armorItem && build.armor) {
		for (const key of KEYS) {
			const val = getNumericValue(armorItem, key, build.armor.level ?? 0)
			if (val !== 0) result[key] = (result[key] ?? 0) + val
		}
	}

	if (containerItem) {
		for (const key of KEYS) {
			const val = getNumericValue(containerItem, key)
			if (val !== 0) result[key] = (result[key] ?? 0) + val
		}
	}

	for (const art of build.arts) {
		const item = artefacts.find((i) => i.id === art.itemId)
		if (!item) continue
		const parsed = parseItemStats(item, locale)
		const artStats = computeArtifactStatsFromParsed(
			art,
			parsed,
			art.selectedStats
		)
		for (const [key, stat] of Object.entries(artStats)) {
			const cleanKey = key.startsWith('add:') ? key.slice(4) : key
			if (cleanKey === BULLET_KEY || cleanKey === HEALTH_KEY) {
				result[cleanKey] = (result[cleanKey] ?? 0) + stat.final
			}
		}
	}

	for (const key of KEYS) {
		const val = result[key] ?? 0
		if (val > 0) result[key] = val * effectiveness
	}

	for (const boostId of Object.values(build.boost).filter(Boolean)) {
		const boostItem = consumables.find((c) => c.id === boostId)
		if (!boostItem) continue
		for (const key of KEYS) {
			const val = getNumericValue(boostItem, key)
			if (val !== 0) result[key] = (result[key] ?? 0) + val
		}
	}

	const bulletRes = result[BULLET_KEY] ?? 0
	const vitality = result[HEALTH_KEY] ?? 0
	return ((100 + bulletRes) * (vitality + 100)) / 100
}
