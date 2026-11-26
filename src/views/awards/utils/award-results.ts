import type {
	AwardResultsCategory,
	AwardResultsNominee,
} from '@/types/awards.type'

export interface RankedNominee extends AwardResultsNominee {
	rank: number
}

export function rankCategoryNominees(
	category: AwardResultsCategory,
	limit = 10
): RankedNominee[] {
	const sorted = [...category.nominees].sort((a, b) => {
		const placeA = a.place ?? Number.POSITIVE_INFINITY
		const placeB = b.place ?? Number.POSITIVE_INFINITY
		if (placeA !== placeB) return placeA - placeB
		return b.votes_count - a.votes_count
	})

	return sorted.slice(0, limit).map((nominee, index) => ({
		...nominee,
		rank: nominee.place ?? index + 1,
	}))
}

export function getCategoryWinners(
	category: AwardResultsCategory
): RankedNominee[] {
	const ranked = rankCategoryNominees(category, category.nominees.length)
	const explicit = ranked.filter((nominee) =>
		category.winner_ids.includes(nominee.id)
	)

	if (explicit.length > 0) return explicit

	return ranked.filter((nominee) => nominee.rank === 1)
}

function hashSeed(value: string): number {
	let hash = 2166136261
	for (let index = 0; index < value.length; index += 1) {
		hash ^= value.charCodeAt(index)
		hash = Math.imul(hash, 16777619)
	}
	return hash >>> 0
}

export function seededRandom(seed: string): number {
	return (hashSeed(seed) % 100000) / 100000
}

export function seededShuffle<T>(items: T[], seed: string): T[] {
	const result = [...items]
	let state = hashSeed(seed) || 1
	const random = () => {
		state = (Math.imul(state, 1664525) + 1013904223) >>> 0
		return state / 0x100000000
	}

	for (let index = result.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(random() * (index + 1))
		;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
	}

	return result
}
