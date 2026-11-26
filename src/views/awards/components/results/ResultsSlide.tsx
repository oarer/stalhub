'use client'

import type { AwardResultsCategory } from '@/types/awards.type'
import type { ResultSlide } from '../../utils/results-presentation'
import { CategorySummary } from './CategorySummary'
import { IntroSlide } from './IntroSlide'
import { OverallSlide } from './OverallSlide'
import { PlacesSlide } from './PlacesSlide'
import { Top3Slide } from './Top3Slide'

export function ResultsSlide({
	slide,
	categories,
}: {
	slide: ResultSlide
	categories: AwardResultsCategory[]
}) {
	if (slide.type === 'overall') {
		return <OverallSlide categories={categories} />
	}

	if (slide.type === 'intro') {
		return <IntroSlide category={slide.category} />
	}

	if (slide.type === 'places') {
		return (
			<PlacesSlide
				category={slide.category}
				nominees={slide.nominees}
				top3={slide.top3}
			/>
		)
	}

	if (slide.type === 'top3') {
		return <Top3Slide category={slide.category} nominees={slide.nominees} />
	}

	return <CategorySummary category={slide.category} />
}
