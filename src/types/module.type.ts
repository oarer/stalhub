export type ModuleGroupKey = 'add-on' | 'deviation' | 'concept'

type ModuleStatType = 'positive' | 'negative' | 'special'

export type ModuleRarity =
	| 'common'
	| 'uncommon'
	| 'special'
	| 'rare'
	| 'exclusive'
	| 'legendary'
	| 'unique'

export interface ModuleStat {
	key: string
	lines: { ru: string }
	type: ModuleStatType
	value: {
		min: number
		max: number
	}
}

interface ModuleBehaviour {
	type: string
	duration?: string
	bonusShots?: number
}

export interface WeaponModule {
	key: string
	moduleType: string
	lines: { ru: string }
	description?: { ru: string }
	behaviour?: ModuleBehaviour
	stats: ModuleStat[]
}

interface ModuleGroup {
	key: ModuleGroupKey
	lines: { ru: string }
	modules: WeaponModule[]
}

export interface RarityCostMultiplier {
	craft: number
	category: number
	disassemble: number
	restore: number
}

interface QualityRarityThreshold {
	quality: number
	rarity: ModuleRarity
}

export interface ModuleEconomyConfig {
	rerollBaseCost: number
	craftExpression: string
	disassembleExpression: string
	restoreExpression: string
	categoryExpression: string
	rerollExpression: string
	rarityCostMultiplier: Record<ModuleRarity, RarityCostMultiplier>
}

export interface ModulesData {
	qualityRarities: QualityRarityThreshold[]
	groups: ModuleGroup[]
}

export interface ModuleSlotConfig {
	moduleKey: string
	quality: number
}
