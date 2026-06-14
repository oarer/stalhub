import {
	qualityIndexToArtQuality,
	qualityPercentRanges,
} from '@/utils/artUtils'

export const roundNumber = (v: number): number => {
	return Number.isInteger(v) ? v : Number(v.toFixed(2))
}

export function normalizePercent(R: number): number {
	if (!Number.isFinite(R)) return 100
	if (R <= 2) return R * 100
	return R
}

export function getArtQualityCandidates(percent: number): string[] {
	const r = normalizePercent(percent)
	const res: string[] = []

	for (const k of Object.keys(qualityPercentRanges)) {
		const idx = Number(k)
		const range = qualityPercentRanges[idx]
		if (!range) continue
		if (r >= range.min && r <= range.max) {
			const q = qualityIndexToArtQuality[idx]
			if (q) res.push(q)
		}
	}

	return res
}

const DEBUFF_MIN_PERCENT = 85
const DEBUFF_CYCLE = 15

export function resolveQualityIndex(q?: number | string): number {
	if (q === undefined || q === null) return 0
	if (typeof q === 'number') {
		if (qualityPercentRanges[q]) return q
		return 0
	}
	const artQualityToIndex = Object.fromEntries(
		Object.entries(qualityIndexToArtQuality).map(([k, v]) => [v, Number(k)])
	) as Record<string, number>
	const idx = artQualityToIndex[q]
	return typeof idx === 'number' ? idx : 0
}

export function calcDebuffValueForQuality(
	V: number,
	P: number,
	R: number,
	qualityIndex = 0
): number {
	const r = normalizePercent(R)

	const min = DEBUFF_MIN_PERCENT + DEBUFF_CYCLE * qualityIndex
	const max = min + DEBUFF_CYCLE

	if (r <= min) return V
	if (r >= max) return P

	const t = (r - min) / (max - min)
	return P + (V - P) * (1 - t)
}

export function calcXfromVPRClamped(
	V: number,
	P: number,
	R: number,
	isDebuff: boolean,
	qualityClass?: number | string
): number {
	if (!isDebuff) {
		const r = normalizePercent(R)

		if (P >= V) {
			if (r <= 85) return V
			if (r > 100) return P * (r / 100)
			const t = (r - 85) / 15
			return V + (P - V) * t
		}

		const t = Math.min(r, 115) / 115
		return V + (P - V) * t
	}

	const qIdx = resolveQualityIndex(qualityClass)
	const [v, p] = [P, V]
	return calcDebuffValueForQuality(v, p, R, qIdx)
}

export function applyPotential(x: number, K = 0): number {
	const m = 1 + (2 * (K || 0)) / 100
	return x * m
}

export function getMaxaddsFromPotential(K: number): number {
	if (K >= 15) return 3
	if (K >= 10) return 2
	if (K >= 5) return 1
	return 0
}

export function isDebuffColor(color?: string): boolean {
	return color?.toUpperCase() === 'C15252'
}
