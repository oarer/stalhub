'use client'

import { useTranslations } from 'next-intl'
import type { AwardResultsCategory } from '@/types/awards.type'
import {
	getCategoryWinners,
	rankCategoryNominees,
} from '../utils/award-results'
import { nomineeName } from '../utils/results-presentation'
import { AwardHighlightCard } from './AwardResultCards'

export function CategoryResults({
	results,
}: {
	results: AwardResultsCategory | undefined
}) {
	const t = useTranslations('awards')
	if (!results) return null

	const ranked = rankCategoryNominees(results, results.nominees.length)
	const winnerIds = new Set(
		getCategoryWinners(results).map((nominee) => nominee.id)
	)
	const tie = winnerIds.size > 1
	const top = ranked.slice(0, 3)
	const rest = ranked.slice(3)

	if (ranked.length === 0) {
		return (
			<p className="text-muted-foreground rounded-2xl border p-6 text-center">
				{t('results.noWinner')}
			</p>
		)
	}

	return (
		<div className="flex flex-col gap-5">
			<div className="grid w-full gap-3 md:grid-cols-3">
				{top.map((nominee) => {
					const winner =
						winnerIds.has(nominee.id) || nominee.rank === 1

					return (
						<AwardHighlightCard
							avatarUrl={nominee.avatar_url}
							badge={
								winner
									? tie
										? t('results.tie')
										: t('results.winner')
									: t('results.place', {
											place: nominee.rank,
										})
							}
							faction={
								results.kind === 'clan'
									? nominee.clan_faction
									: results.kind === 'player'
										? nominee.player_alliance
										: null
							}
							key={nominee.id}
							name={nomineeName(nominee)}
							place={nominee.rank}
							showPlace={false}
							title={results.title}
							votes={nominee.votes_count}
						/>
					)
				})}
			</div>

			{rest.length > 0 && (
				<div className="flex flex-col gap-2">
					<p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
						{t('results.otherPlaces')}
					</p>
					<div className="flex w-full flex-wrap gap-3">
						{rest.map((nominee) => {
							const winner =
								winnerIds.has(nominee.id) || nominee.rank === 1

							return (
								<AwardHighlightCard
									avatarUrl={nominee.avatar_url}
									badge={
										winner
											? tie
												? t('results.tie')
												: t('results.winner')
											: t('results.place', {
													place: nominee.rank,
												})
									}
									className="min-w-0 grow basis-80"
									faction={
										results.kind === 'clan'
											? nominee.clan_faction
											: results.kind === 'player'
												? nominee.player_alliance
												: null
									}
									key={nominee.id}
									name={nomineeName(nominee)}
									place={nominee.rank}
									showPlace={false}
									size="compact"
									title={results.title}
									votes={nominee.votes_count}
								/>
							)
						})}
					</div>
				</div>
			)}
		</div>
	)
}
