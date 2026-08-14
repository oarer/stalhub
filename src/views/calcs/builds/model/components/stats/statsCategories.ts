import { BUILD_STAT_COLORS } from '../hooks/itemStatsUtils'

export interface StatCategory {
	key: string
	statKeys: string[]
}

export const STAT_CATEGORIES: StatCategory[] = [
	{
		key: 'core',
		statKeys: [
			'stalker.artefact_properties.factor.health_bonus',
			'stalker.artefact_properties.factor.stamina_bonus',
			'stalker.artefact_properties.factor.speed_modifier',
			'stalker.artefact_properties.factor.sprint_speed_modifier',
			'stalker.artefact_properties.factor.max_weight_bonus',
			'stalker.artefact_properties.factor.regeneration_bonus',
			'stalker.artefact_properties.factor.stamina_regeneration_bonus',
			'stalker.artefact_properties.factor.heal_efficiency',
			'stalker.artefact_properties.factor.artefakt_heal',
		],
	},
	{
		key: 'protection',
		statKeys: [
			'stalker.artefact_properties.factor.bullet_dmg_factor',
			'stalker.artefact_properties.factor.tear_dmg_factor',
			'stalker.artefact_properties.factor.explosion_dmg_factor',
			'stalker.artefact_properties.factor.electra_dmg_factor',
			'stalker.artefact_properties.factor.burn_dmg_factor',
			'stalker.artefact_properties.factor.chemical_burn_dmg_factor',
		],
	},
	{
		key: 'contaminationProtection',
		statKeys: [
			'stalker.artefact_properties.factor.radiation_protection',
			'stalker.artefact_properties.factor.thermal_protection',
			'stalker.artefact_properties.factor.biological_protection',
			'stalker.artefact_properties.factor.psycho_protection',
			'stalker.artefact_properties.factor.bleeding_protection',
			'stalker.artefact_properties.factor.stopping_protection',
		],
	},
	{
		key: 'accumulation',
		statKeys: [
			'stalker.artefact_properties.factor.radiation_accumulation',
			'stalker.artefact_properties.factor.thermal_accumulation',
			'stalker.artefact_properties.factor.biological_accumulation',
			'stalker.artefact_properties.factor.psycho_accumulation',
		],
	},
	{
		key: 'effects',
		statKeys: [
			'stalker.artefact_properties.factor.bleeding_accumulation',
			'stalker.artefact_properties.factor.frost_accumulation',
		],
	},
]

export interface StatCategoryGroup {
	key: string
	rows: [string, number][]
}

export function groupStatsByCategory(
	stats: [string, number][]
): StatCategoryGroup[] {
	const statsMap = new Map<string, number>(stats)
	const knownKeys = new Set<string>()
	const groups: StatCategoryGroup[] = []

	for (const category of STAT_CATEGORIES) {
		const rows: [string, number][] = []
		for (const key of category.statKeys) {
			const value = statsMap.get(key)
			if (value !== undefined) {
				rows.push([key, value])
				knownKeys.add(key)
			}
		}
		if (rows.length > 0) {
			groups.push({ key: category.key, rows })
		}
	}

	const misc = stats.filter(([key]) => !knownKeys.has(key))
	if (misc.length > 0) {
		const nonColored: [string, number][] = []
		const colored: [string, number][] = []
		for (const entry of misc) {
			if (BUILD_STAT_COLORS[entry[0]]) {
				colored.push(entry)
			} else {
				nonColored.push(entry)
			}
		}
		groups.push({ key: 'misc', rows: [...nonColored, ...colored] })
	}

	return groups
}
