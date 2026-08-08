import { moduleEconomy } from '@/constants/modules.economy.const'
import { useModulesStore } from '@/stores/useModules.store'
import { InfoColor, infoColorMap } from '@/types/item.type'
import type {
	ModuleGroupKey,
	ModuleRarity,
	ModuleSlotConfig,
	ModuleStat,
	WeaponModule,
} from '@/types/module.type'

export const QUALITY_MIN = 0
export const QUALITY_MAX = 200

export function getModuleStatValue(stat: ModuleStat, quality: number): number {
	const q = Math.max(QUALITY_MIN, Math.min(QUALITY_MAX, quality))
	return stat.value.min + (stat.value.max - stat.value.min) * (q / 190)
}

export const RARITY_COLORS: Record<ModuleRarity, string> = {
	common: infoColorMap[InfoColor.ART_QUALITY_COMMON],
	uncommon: infoColorMap[InfoColor.ART_QUALITY_UNCOMMON],
	special: infoColorMap[InfoColor.ART_QUALITY_SPECIAL],
	rare: infoColorMap[InfoColor.ART_QUALITY_RARE],
	exclusive: infoColorMap[InfoColor.ART_QUALITY_EXCLUSIVE],
	legendary: infoColorMap[InfoColor.ART_QUALITY_LEGENDARY],
	unique: infoColorMap[InfoColor.ART_QUALITY_UNIQUE],
}

const RARITY_INDEX: Record<ModuleRarity, number> = {
	common: 1,
	uncommon: 2,
	special: 3,
	rare: 4,
	exclusive: 5,
	legendary: 6,
	unique: 7,
}

function getModulesData() {
	return useModulesStore.getState().data
}

export function getRarityByQuality(quality: number): ModuleRarity {
	const data = getModulesData()
	const q = Math.max(QUALITY_MIN, Math.min(QUALITY_MAX, quality))
	let rarity: ModuleRarity = data.qualityRarities[0]?.rarity ?? 'common'

	for (const tier of data.qualityRarities) {
		if (q >= tier.quality) rarity = tier.rarity
	}

	return rarity
}

export function getRarityIndex(rarity: ModuleRarity): number {
	return RARITY_INDEX[rarity] ?? 1
}

function tokenizeExpression(src: string): string[] {
	const tokens: string[] = []
	const regex = /\d+(?:\.\d+)?|[A-Za-z]+|[()+\-*/^,]/g
	let m: RegExpExecArray | null

	while ((m = regex.exec(src)) !== null) {
		tokens.push(m[0])
	}

	return tokens
}

interface ExprParser {
	tokens: string[]
	pos: number
}

function peek(p: ExprParser): string | null {
	return p.tokens[p.pos] ?? null
}

function next(p: ExprParser): string | null {
	return p.tokens[p.pos++] ?? null
}

function parseExpr(p: ExprParser): number {
	let value = parseTerm(p)

	while (peek(p) === '+' || peek(p) === '-') {
		const op = next(p)
		const rhs = parseTerm(p)
		value = op === '+' ? value + rhs : value - rhs
	}

	return value
}

function parseTerm(p: ExprParser): number {
	let value = parsePower(p)

	while (peek(p) === '*' || peek(p) === '/') {
		const op = next(p)
		const rhs = parsePower(p)
		value = op === '*' ? value * rhs : value / rhs
	}

	return value
}

function parsePower(p: ExprParser): number {
	const base = parseUnary(p)

	if (peek(p) === '^') {
		next(p)
		const exponent = parseUnary(p)
		return Math.pow(base, exponent)
	}

	return base
}

function parseUnary(p: ExprParser): number {
	const token = peek(p)

	if (token === '-') {
		next(p)
		return -parseUnary(p)
	}

	if (token === '+') {
		next(p)
		return parseUnary(p)
	}

	if (token === '(') {
		next(p)
		const value = parseExpr(p)
		next(p) // ')'
		return value
	}

	if (token === 'floor') {
		next(p)
		next(p) // '('
		const value = parseExpr(p)
		next(p) // ')'
		return Math.floor(value)
	}

	return parseAtom(p)
}

function parseAtom(p: ExprParser): number {
	const token = next(p)

	if (token === null) return 0

	if (token === 'k' || token === 'N') {
		return parseFloat(token)
	}

	return parseFloat(token)
}

export function evalModuleExpression(
	expression: string,
	{ k, N }: { k: number; N: number }
): number {
	const tokens = tokenizeExpression(expression).map((t) =>
		t === 'k' ? String(k) : t === 'N' ? String(N) : t
	)

	const parser: ExprParser = { tokens, pos: 0 }
	return parseExpr(parser)
}

export interface ModuleCosts {
	craft: number
	category: number
	disassemble: number
	restore: number
	reroll: number
}

export function getModuleCosts(quality: number): ModuleCosts {
	const rarity = getRarityByQuality(quality)
	const k = moduleEconomy.rarityCostMultiplier[rarity]
	const N = getRarityIndex(rarity)

	return {
		craft: evalModuleExpression(moduleEconomy.craftExpression, {
			k: k.craft,
			N,
		}),
		category: evalModuleExpression(moduleEconomy.categoryExpression, {
			k: k.category,
			N,
		}),
		disassemble: evalModuleExpression(moduleEconomy.disassembleExpression, {
			k: k.disassemble,
			N,
		}),
		restore: evalModuleExpression(moduleEconomy.restoreExpression, {
			k: k.restore,
			N,
		}),
		reroll: evalModuleExpression(moduleEconomy.rerollExpression, {
			k: 1,
			N,
		}),
	}
}

export function getModuleByKey(
	groupKey: ModuleGroupKey,
	moduleKey: string
): WeaponModule | null {
	const data = getModulesData()
	const group = data.groups.find((g) => g.key === groupKey)
	if (!group) return null
	return group.modules.find((m) => m.key === moduleKey) ?? null
}

export function getGroupModules(groupKey: ModuleGroupKey): WeaponModule[] {
	const data = getModulesData()
	const group = data.groups.find((g) => g.key === groupKey)
	return group?.modules ?? []
}

export function getModuleGroupLabel(groupKey: ModuleGroupKey): string {
	const data = getModulesData()
	const group = data.groups.find((g) => g.key === groupKey)
	return group?.lines.ru ?? groupKey
}

export interface ModuleDamageModifiers {
	startMult: number
	endMult: number
}

export function getModuleDamageModifiers(
	slots: Record<ModuleGroupKey, ModuleSlotConfig>
): ModuleDamageModifiers {
	let damage = 0
	let damageDistant = 0

	for (const groupKey of Object.keys(slots) as ModuleGroupKey[]) {
		const slot = slots[groupKey]
		if (!slot?.moduleKey) continue

		const module = getModuleByKey(groupKey, slot.moduleKey)
		if (!module) continue

		for (const stat of module.stats) {
			const value = getModuleStatValue(stat, slot.quality)
			if (stat.key === 'damage') damage += value
			else if (stat.key === 'damage_distant') damageDistant += value
		}
	}

	return {
		startMult: 1 + damage / 100,
		endMult: 1 + damageDistant / 100,
	}
}
