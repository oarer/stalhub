import type { ParsedItem, StatBreakdown } from '@/types/artifact.type'
import type { Art } from '@/types/build.type'
import {
	applyPotential,
	calcXfromVPRClamped,
	getMaxaddsFromPotential,
	isDebuffColor,
	roundNumber,
} from '@/views/calcs/builds/utils/artCalculations'

interface StatContext {
	R: number
	K: number
	qualityClass: Art['quality_class']
}

function normalizePercent(percent: number | undefined): number {
	const raw = percent ?? 100
	return raw <= 2 ? raw * 100 : raw
}

function buildNormalizedKeyMap(parsedItem: ParsedItem): Map<string, string> {
	const normalizedToKey = new Map<string, string>()
	const register = (key: string) =>
		normalizedToKey.set(key.trim().toLowerCase(), key)
	for (const k of Object.keys(parsedItem.addStats ?? {})) register(k)
	for (const k of Object.keys(parsedItem.baseStats ?? {})) register(k)
	for (const k of Object.keys(parsedItem.statRanges ?? {})) register(k)

	if (parsedItem.displayNames) {
		for (const [k, display] of Object.entries(parsedItem.displayNames)) {
			if (display && display.trim().length > 0)
				normalizedToKey.set(display.trim().toLowerCase(), k)
		}
	}
	if (parsedItem.localizedToKey) {
		for (const [loc, k] of Object.entries(parsedItem.localizedToKey)) {
			normalizedToKey.set(loc.trim().toLowerCase(), k)
		}
	}
	return normalizedToKey
}

function resolveSelectedKeys(
	parsedItem: ParsedItem,
	selectedKeys: (string | null)[] | undefined,
	fallback: Art['selected_stats'],
	maxAdds: number
): string[] {
	const selectedRaw = Array.isArray(selectedKeys)
		? selectedKeys
		: Array.isArray(fallback)
			? fallback
			: []

	const selectedStrings: string[] = selectedRaw.filter(
		(s): s is string => typeof s === 'string' && s.trim().length > 0
	)

	const normalizedToKey = buildNormalizedKeyMap(parsedItem)
	const resolved = selectedStrings.map((s) => {
		if (s in (parsedItem.addStats ?? {})) return s
		return normalizedToKey.get(s.trim().toLowerCase()) ?? s
	})
	return resolved.slice(0, maxAdds)
}

function collectStatKeys(parsedItem: ParsedItem): Set<string> {
	const keys = new Set<string>()
	if (parsedItem.statRanges)
		Object.keys(parsedItem.statRanges).forEach((k) => keys.add(k))
	if (parsedItem.baseStats)
		Object.keys(parsedItem.baseStats).forEach((k) => keys.add(k))
	if (parsedItem.addStats)
		Object.keys(parsedItem.addStats).forEach((k) => keys.add(k))
	return keys
}

function maybeSwapVP(
	V: number,
	P: number,
	color?: string,
	key?: string
): { V: number; P: number } {
	if (key?.includes('accumulation') && V < P) {
		return { V: P, P: V }
	}

	if (color?.toUpperCase() === 'C15252' && Math.abs(V) < Math.abs(P)) {
		return { V: P, P: V }
	}

	return { V, P }
}

function resolveVPForKeyParsed(
	parsed: ParsedItem,
	key: string
): { V: number; P: number } {
	if (parsed.statRanges && parsed.statRanges[key]) {
		const r = parsed.statRanges[key]
		return { V: Number(r.v0 ?? 0), P: Number(r.v100 ?? 0) }
	}
	if (parsed.baseStats && key in parsed.baseStats) {
		return { V: 0, P: Number(parsed.baseStats[key] ?? 0) }
	}
	return { V: 0, P: 0 }
}

function applyBaseFormula(
	V: number,
	P: number,
	debuff: boolean,
	ctx: StatContext
): { X_before: number; X_after: number } {
	const X_before = calcXfromVPRClamped(V, P, ctx.R, debuff, ctx.qualityClass)
	return {
		X_before,
		X_after: debuff ? X_before : applyPotential(X_before, ctx.K),
	}
}

function computeAddTotal(
	ex: number | { v0?: number; v100?: number; color?: string },
	debuff: boolean,
	color: string | undefined,
	key: string,
	ctx: StatContext
): number {
	if (typeof ex === 'number') {
		return debuff ? ex : applyPotential(ex, ctx.K)
	}
	const addV = ex.v0 ?? 0
	const addP = ex.v100 ?? 0
	const swapped = maybeSwapVP(addV, addP, ex.color ?? color, key)
	const x = calcXfromVPRClamped(
		swapped.V,
		swapped.P,
		ctx.R,
		debuff,
		ctx.qualityClass
	)
	return debuff ? x : applyPotential(x, ctx.K)
}

function makeBreakdown(
	key: string,
	V: number,
	P: number,
	X_before: number,
	X_after: number,
	addTotal: number,
	ctx: StatContext,
	extra?: Partial<StatBreakdown>
): StatBreakdown {
	const final = X_after + addTotal
	return {
		key,
		V,
		P,
		R: ctx.R,
		X_before_potential: roundNumber(X_before),
		potentialK: ctx.K,
		X_after_potential: roundNumber(X_after),
		addFromSelected: roundNumber(addTotal),
		final: roundNumber(final),
		...extra,
	}
}

function computeKnownKeyBreakdown(
	parsedItem: ParsedItem,
	key: string,
	selectedLimited: string[],
	ctx: StatContext
): StatBreakdown {
	let { V, P } = resolveVPForKeyParsed(parsedItem, key)
	const color =
		parsedItem.statRanges[key]?.color ?? parsedItem.addStats?.[key]?.color
	const isPercent =
		parsedItem.statRanges[key]?.isPercent ??
		parsedItem.addStats?.[key]?.isPercent

	const debuff = isDebuffColor(color)

	const swapped = maybeSwapVP(V, P, color, key)
	V = swapped.V
	P = swapped.P

	const { X_before, X_after } = applyBaseFormula(V, P, debuff, ctx)

	let addTotal = 0
	if (selectedLimited.includes(key)) {
		const ex = parsedItem.addStats?.[key]
		if (ex !== undefined && ex !== null) {
			addTotal = computeAddTotal(ex, debuff, color, key, ctx)
		}
	}
	return makeBreakdown(key, V, P, X_before, X_after, addTotal, ctx, {
		color,
		isPercent,
	})
}

function computeSelectedOnlyBreakdown(
	parsedItem: ParsedItem,
	selKey: string,
	ctx: StatContext
): StatBreakdown | null {
	const color =
		parsedItem.statRanges[selKey]?.color ??
		parsedItem.addStats?.[selKey]?.color
	const debuff = isDebuffColor(color)
	const syntheticKey = `add:${selKey}`

	const ex = parsedItem.addStats?.[selKey]
	if (ex === undefined || ex === null) {
		const { V, P } = resolveVPForKeyParsed(parsedItem, selKey)
		if (V === 0 && P === 0) return null

		const swapped = maybeSwapVP(V, P, color, selKey)
		const { X_before, X_after } = applyBaseFormula(
			swapped.V,
			swapped.P,
			debuff,
			ctx
		)
		return makeBreakdown(
			syntheticKey,
			swapped.V,
			swapped.P,
			X_before,
			X_after,
			0,
			ctx
		)
	}

	const addTotal = computeAddTotal(ex, debuff, color, selKey, ctx)
	return {
		key: syntheticKey,
		V: 0,
		P: 0,
		R: ctx.R,
		X_before_potential: 0,
		potentialK: ctx.K,
		X_after_potential: 0,
		addFromSelected: roundNumber(addTotal),
		final: roundNumber(addTotal),
	}
}

export function computeArtifactStatsFromParsed(
	art: Art,
	parsedItem: ParsedItem,
	selectedKeys?: (string | null)[]
): Record<string, StatBreakdown> {
	const ctx: StatContext = {
		R: normalizePercent(art?.percent),
		K: art?.potential ?? 0,
		qualityClass: art && art.quality_class,
	}

	const addStatsCount = Object.keys(parsedItem.addStats ?? {}).length
	const maxadds = getMaxaddsFromPotential(ctx.K) + (addStatsCount > 3 ? 1 : 0)
	const selectedLimited = resolveSelectedKeys(
		parsedItem,
		selectedKeys,
		art?.selected_stats,
		maxadds
	)

	const keys = collectStatKeys(parsedItem)
	const result: Record<string, StatBreakdown> = {}

	for (const key of Array.from(keys).sort()) {
		result[key] = computeKnownKeyBreakdown(
			parsedItem,
			key,
			selectedLimited,
			ctx
		)
	}

	for (const selKey of selectedLimited) {
		if (keys.has(selKey)) continue
		const breakdown = computeSelectedOnlyBreakdown(parsedItem, selKey, ctx)
		if (breakdown) result[breakdown.key] = breakdown
	}

	return result
}
