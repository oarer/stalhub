import type { AwardResultsCategory } from '@/types/awards.type'
import {
	type RankedNominee,
	rankCategoryNominees,
	seededShuffle,
} from './award-results'

export type ResultSlide =
	| { type: 'intro'; category: AwardResultsCategory }
	| {
			type: 'places'
			category: AwardResultsCategory
			nominees: RankedNominee[]
			top3: RankedNominee[]
	  }
	| {
			type: 'top3'
			category: AwardResultsCategory
			nominees: RankedNominee[]
	  }
	| { type: 'summary'; category: AwardResultsCategory }
	| { type: 'overall' }

export function buildResultSlides(
	categories: AwardResultsCategory[],
	startSlug?: string
): ResultSlide[] {
	if (categories.length === 0) return [{ type: 'overall' }]

	const startIndex = startSlug
		? Math.max(
				0,
				categories.findIndex((category) => category.slug === startSlug)
			)
		: 0
	const ordered = [
		...categories.slice(startIndex),
		...categories.slice(0, startIndex),
	]
	const slides: ResultSlide[] = []

	for (const category of ordered) {
		const ranked = rankCategoryNominees(category, category.nominees.length)
		const top3 = ranked.slice(0, 3)
		const rest = ranked.slice(3)

		slides.push({ type: 'intro', category })

		if (rest.length > 0 || top3.length > 0) {
			slides.push({
				type: 'places',
				category,
				nominees: rest,
				top3,
			})
		}

		if (top3.length > 0) {
			slides.push({
				type: 'top3',
				category,
				nominees: seededShuffle(top3, `${category.id}:top3`),
			})
		}

		slides.push({ type: 'summary', category })
	}

	slides.push({ type: 'overall' })
	return slides
}

export function nomineeName(nominee: RankedNominee) {
	return nominee.clan_name ?? nominee.name
}
