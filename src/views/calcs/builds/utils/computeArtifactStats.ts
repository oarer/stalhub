import type { ParsedItem, StatBreakdown } from '@/types/artifact.type'
import type { Art } from '@/types/build.type'
import {
	applyPotential,
	calcXfromVPRClamped,
	getMaxaddsFromPotential,
	isDebuffColor,
	roundNumber,
} from '@/views/calcs/builds/utils/artCalculations'

export function computeArtifactStatsFromParsed(
	art: Art,
	parsedItem: ParsedItem,
	selectedKeys?: (string | null)[]
): Record<string, StatBreakdown> {
	const percentRaw = art?.percent ?? 100
	const R = percentRaw <= 2 ? percentRaw * 100 : percentRaw
	const K = art?.potential ?? 0

	const selectedRaw = Array.isArray(selectedKeys)
		? selectedKeys
		: Array.isArray(art?.selectedStats)
			? art.selectedStats
			: []

	const selectedStrings: string[] = selectedRaw.filter(
		(s): s is string => typeof s === 'string' && s.trim().length > 0
	)

	const normalizedToKey = new Map<string, string>()
	for (const k of Object.keys(parsedItem.addStats ?? {}))
		normalizedToKey.set(k.trim().toLowerCase(), k)
	for (const k of Object.keys(parsedItem.baseStats ?? {}))
		normalizedToKey.set(k.trim().toLowerCase(), k)
	for (const k of Object.keys(parsedItem.statRanges ?? {}))
		normalizedToKey.set(k.trim().toLowerCase(), k)

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

	const resolvedSelected: string[] = []
	for (const s of selectedStrings) {
		if (s in (parsedItem.addStats ?? {})) {
			resolvedSelected.push(s)
			continue
		}
		const mapped = normalizedToKey.get(s.trim().toLowerCase())
		if (mapped) {
			resolvedSelected.push(mapped)
			continue
		}
		resolvedSelected.push(s)
	}

	const addStatsCount = Object.keys(parsedItem.addStats ?? {}).length
	const maxadds = getMaxaddsFromPotential(K) + (addStatsCount > 3 ? 1 : 0)
	const selectedLimited = resolvedSelected.slice(0, maxadds)

	const keys = new Set<string>()
	if (parsedItem.statRanges)
		Object.keys(parsedItem.statRanges).forEach((k) => keys.add(k))
	if (parsedItem.baseStats)
		Object.keys(parsedItem.baseStats).forEach((k) => keys.add(k))
	if (parsedItem.addStats)
		Object.keys(parsedItem.addStats).forEach((k) => keys.add(k))

	const result: Record<string, StatBreakdown> = {}

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

	const defaultQualityClass = art && art.qualityClass

	for (const key of Array.from(keys).sort()) {
		const { V, P } = resolveVPForKeyParsed(parsedItem, key)
		const color =
			parsedItem.statRanges[key]?.color ??
			parsedItem.addStats?.[key]?.color
		const isPercent =
			parsedItem.statRanges[key]?.isPercent ??
			parsedItem.addStats?.[key]?.isPercent

		const debuff = isDebuffColor(color)

		const qualityArg = defaultQualityClass

		// прокидываем key и color в calcXfromVPRClamped
		const X_before = calcXfromVPRClamped(V, P, R, debuff, qualityArg, {
			color: color,
			key,
		})
		const X_after = debuff ? X_before : applyPotential(X_before, K)

		let addTotal = 0
		if (selectedLimited.includes(key)) {
			const ex = parsedItem.addStats?.[key]
			if (ex !== undefined && ex !== null) {
				if (typeof ex === 'number') {
					addTotal = debuff ? ex : applyPotential(ex, K)
				} else {
					const x = calcXfromVPRClamped(
						ex.v0 ?? 0,
						ex.v100 ?? 0,
						R,
						debuff,
						qualityArg,
						{ color: ex.color ?? color, key }
					)
					addTotal = debuff ? x : applyPotential(x, K)
				}
			}
		}
		const final = X_after + addTotal
		result[key] = {
			key,
			V,
			P,
			R,
			X_before_potential: roundNumber(X_before),
			potentialK: K,
			X_after_potential: roundNumber(X_after),
			addFromSelected: roundNumber(addTotal),
			final: roundNumber(final),
			color,
			isPercent,
		}
	}

	for (const selKey of selectedLimited) {
		if (keys.has(selKey)) continue

		const color =
			parsedItem.statRanges[selKey]?.color ??
			parsedItem.addStats?.[selKey]?.color

		const debuff = isDebuffColor(color)

		const ex = parsedItem.addStats?.[selKey]
		if (ex === undefined || ex === null) {
			const { V, P } = resolveVPForKeyParsed(parsedItem, selKey)
			if (V === 0 && P === 0) continue

			const qualityArg = defaultQualityClass
			// прокидываем метаданные и сюда
			const X_before = calcXfromVPRClamped(V, P, R, debuff, qualityArg, {
				color,
				key: selKey,
			})
			const X_after = debuff ? X_before : applyPotential(X_before, K)

			const syntheticKey = `add:${selKey}`
			result[syntheticKey] = {
				key: syntheticKey,
				V,
				P,
				R,
				X_before_potential: roundNumber(X_before),
				potentialK: K,
				X_after_potential: roundNumber(X_after),
				addFromSelected: 0,
				final: roundNumber(X_after),
			}
			continue
		}

		let addTotal = 0
		if (typeof ex === 'number') {
			addTotal += debuff ? ex : applyPotential(ex, K)
		} else {
			const qualityArg = defaultQualityClass
			const x = calcXfromVPRClamped(
				ex.v0 ?? 0,
				ex.v100 ?? 0,
				R,
				debuff,
				qualityArg,
				{ color: ex.color ?? color, key: selKey }
			)
			addTotal += debuff ? x : applyPotential(x, K)
		}

		const syntheticKey = `add:${selKey}`
		result[syntheticKey] = {
			key: syntheticKey,
			V: 0,
			P: 0,
			R,
			X_before_potential: 0,
			potentialK: K,
			X_after_potential: 0,
			addFromSelected: roundNumber(addTotal),
			final: roundNumber(addTotal),
		}
	}

	return result
}
