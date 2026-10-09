import type { Build } from '@/types/build.type'
import type { Item, Locale } from '@/types/item.type'
import { getNumericValue } from '../model/components/hooks'
import { computeArtifactStatsFromParsed } from './computeArtifactStats'
import { parseItemStats } from './parseArtifact'

const BULLET_KEY = 'stalker.artefact_properties.factor.bullet_dmg_factor'
const HEALTH_KEY = 'stalker.artefact_properties.factor.health_bonus'

const KEYS = [BULLET_KEY, HEALTH_KEY]

function accumulateItemKeys(
	target: Record<string, number>,
	item: Item,
	level = 0
): void {
	for (const key of KEYS) {
		const val = getNumericValue(item, key, level)
		if (val !== 0) target[key] = (target[key] ?? 0) + val
	}
}

export function computePrimeFromBuild(
	build: Build,
	armors: Item[],
	containers: Item[],
	artefacts: Item[],
	consumables: Item[],
	locale: Locale
): { bulletRes: number; vitality: number; prime: number } {
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
		accumulateItemKeys(result, armorItem, build.armor.level ?? 0)
	}

	if (containerItem) {
		accumulateItemKeys(result, containerItem)
	}

	for (const art of build.arts) {
		const item = artefacts.find((i) => i.id === art.item_id)
		if (!item) continue
		const parsed = parseItemStats(item, locale)
		const artStats = computeArtifactStatsFromParsed(
			art,
			parsed,
			art.selected_stats
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
		accumulateItemKeys(result, boostItem)
	}

	const bulletRes = result[BULLET_KEY] ?? 0
	const vitality = result[HEALTH_KEY] ?? 0
	const prime = ((100 + bulletRes) * (vitality + 100)) / 100
	return { bulletRes, vitality, prime }
}
