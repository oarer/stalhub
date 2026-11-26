'use client'

import { mtsExtended } from '@/app/fonts'
import type { AwardResultsCategory } from '@/types/awards.type'
import type { RankedNominee } from '../../utils/award-results'
import { ResultCard } from './ResultCard'

export function PlacesSlide({
	category,
	nominees,
	top3,
}: {
	category: AwardResultsCategory
	nominees: RankedNominee[]
	top3: RankedNominee[]
}) {
	const cards = [
		...top3.map((nominee, index) => ({
			hidden: true,
			nominee,
			rank: index + 1,
		})),
		...nominees.map((nominee) => ({
			hidden: false,
			nominee,
			rank: nominee.rank,
		})),
	]

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
			<span
				className={`${mtsExtended.className} text-lg font-medium tracking-widest uppercase`}
			>
				{category.title}
			</span>

			<div className="grid gap-3 sm:grid-cols-2">
				{cards.map((card, index) => (
					<ResultCard
						delay={0.05 + index * 0.04}
						hidden={card.hidden}
						key={card.nominee.id}
						nominee={card.nominee}
						rank={card.rank}
					/>
				))}
			</div>
		</div>
	)
}
