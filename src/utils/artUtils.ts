import type { ArtQuality } from '@/types/item.type'
import { InfoColor, infoColorMap } from '@/types/item.type'

export type ArtifactAdditional = {
	ndmg?: number
	qlt?: number
	it_transf_count?: number
	upgrade_bonus?: number
	spawn_time?: number
	ptn?: number
	bonus_properties?: string[]
	stats_random?: number
	md_k?: string | number
}

export const qualityPercentRanges: Record<
	number,
	{ min: number; max: number }
> = {
	0: { min: 85, max: 100 },
	1: { min: 100, max: 115 },
	2: { min: 115, max: 130 },
	3: { min: 130, max: 145 },
	4: { min: 145, max: 160 },
	5: { min: 160, max: 175 },
	6: { min: 175, max: 190 },
}

export const qualityIndexToArtQuality: Record<number, ArtQuality> = {
	0: InfoColor.ART_QUALITY_COMMON,
	1: InfoColor.ART_QUALITY_UNCOMMON,
	2: InfoColor.ART_QUALITY_SPECIAL,
	3: InfoColor.ART_QUALITY_RARE,
	4: InfoColor.ART_QUALITY_EXCLUSIVE,
	5: InfoColor.ART_QUALITY_LEGENDARY,
	6: InfoColor.ART_QUALITY_UNIQUE,
}

export const artQualityToQualityIndex: Record<ArtQuality, number> = {
	[InfoColor.ART_QUALITY_COMMON]: 0,
	[InfoColor.ART_QUALITY_UNCOMMON]: 1,
	[InfoColor.ART_QUALITY_SPECIAL]: 2,
	[InfoColor.ART_QUALITY_RARE]: 3,
	[InfoColor.ART_QUALITY_EXCLUSIVE]: 4,
	[InfoColor.ART_QUALITY_LEGENDARY]: 5,
	[InfoColor.ART_QUALITY_UNIQUE]: 6,
}

export const calcArtifactPercent = (additional: ArtifactAdditional): number => {
	if (additional.qlt === undefined) return 0

	const ndmg = typeof additional.ndmg === 'number' ? additional.ndmg : 0
	const qlt = additional.qlt
	const range = qualityPercentRanges[qlt] ?? { min: 0, max: 100 }
	const diff = range.max - range.min

	let normalized = ((ndmg || 0) + 2) / 4

	if (!Number.isFinite(normalized)) normalized = 0
	normalized = Math.max(0, Math.min(1, normalized))

	const percent = range.min + diff * normalized

	return Math.max(range.min, Math.min(range.max, percent))
}

const getQualityIndexByPercent = (percent: number): number => {
	const entry = Object.entries(qualityPercentRanges).find(
		([, range]) => percent >= range.min && percent <= range.max
	)

	if (entry) return Number(entry[0])

	const maxIndex = Math.max(...Object.keys(qualityPercentRanges).map(Number))
	const lastRange = qualityPercentRanges[maxIndex]

	if (percent > (lastRange?.max ?? Infinity)) return maxIndex
	return 0
}

export const getQualityByPercent = (percent: number): ArtQuality => {
	const idx = getQualityIndexByPercent(percent)
	return qualityIndexToArtQuality[idx] ?? InfoColor.ART_QUALITY_UNCOMMON
}



export const getArtifactColor = (qlt: number): string => {
	const quality = qualityIndexToArtQuality[qlt]
	return infoColorMap[quality] ?? '#FFFFFF'
}



