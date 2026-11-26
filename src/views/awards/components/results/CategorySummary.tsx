'use client'

import { useTranslations } from 'next-intl'
import { mtsWide } from '@/app/fonts'
import type { AwardResultsCategory } from '@/types/awards.type'
import {
	getCategoryWinners,
	rankCategoryNominees,
} from '../../utils/award-results'
import { ConfettiBurst } from './ConfettiBurst'
import { ResultCard } from './ResultCard'

export function CategorySummary({
	category,
}: {
	category: AwardResultsCategory
}) {
	const t = useTranslations('awards')
	const ranked = rankCategoryNominees(category, category.nominees.length)
	const winners = new Set(
		getCategoryWinners(category).map((nominee) => nominee.id)
	)
	const tie = winners.size > 1

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
			<div className="flex items-center gap-2">
				<span
					className={`${mtsWide.className} text-lg font-semibold tracking-tight`}
				>
					{category.title}
				</span>
				{tie && (
					<span className="bg-primary/15 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.16em] uppercase">
						{t('results.tie')}
					</span>
				)}
			</div>

			<div className="relative grid gap-3 sm:grid-cols-2">
				<ConfettiBurst seed={`summary-${category.id}`} />
				{ranked.map((nominee, index) => (
					<ResultCard
						delay={0.12 + index * 0.04}
						highlight={
							winners.has(nominee.id) || nominee.rank === 1
						}
						key={nominee.id}
						nominee={nominee}
						rank={nominee.rank}
						showPlace={false}
					/>
				))}
				{ranked.length === 0 && (
					<p className="text-muted-foreground rounded-2xl border p-6 text-center sm:col-span-2">
						{t('results.noWinner')}
					</p>
				)}
			</div>
		</div>
	)
}
