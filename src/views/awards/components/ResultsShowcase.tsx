'use client'

import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/cn'
import type { AwardResults, AwardResultsCategory } from '@/types/awards.type'
import { getCategoryWinners } from '../utils/award-results'
import { nomineeName } from '../utils/results-presentation'
import { AwardHighlightCard } from './AwardResultCards'

export default function ResultsShowcase({
	results,
	activeSlug,
	onSelect,
}: {
	results: AwardResults
	activeSlug: string
	onSelect: (slug: string) => void
}) {
	const t = useTranslations('awards')
	const featured = results.categories.slice(0, 3)
	const rest = results.categories.slice(3)

	return (
		<div className="flex flex-col gap-5">
			<div className="grid w-full gap-4 md:grid-cols-3">
				{featured.map((category, index) => {
					const winners = getCategoryWinners(category)
					const winner = winners[0]
					const name =
						winners.length > 1
							? t('results.tie')
							: winners.length === 1
								? nomineeName(winners[0])
								: t('results.noWinner')
					const votes = winners.reduce(
						(sum, nominee) => sum + nominee.votes_count,
						0
					)

					return (
						<motion.div
							className="h-full w-full"
							animate={{ opacity: 1, y: 0 }}
							initial={{ opacity: 0, y: 18 }}
							key={category.id}
							transition={{
								duration: 0.45,
								delay: index * 0.06,
							}}
						>
							<AwardHighlightCard
								avatarUrl={
									winner?.avatar_url ?? category.image_url
								}
								badge={
									winners.length > 1
										? t('results.tie')
										: winners.length > 0
											? t('results.winner')
											: t('results.title')
								}
								className={cn(
									activeSlug === category.slug
										? 'from-primary/25'
										: undefined,
									'cursor-pointer'
								)}
								faction={
									category.kind === 'clan'
										? winner?.clan_faction
										: category.kind === 'player'
											? winner?.player_alliance
											: null
								}
								name={name}
								onClick={() => onSelect(category.slug)}
								title={category.title}
								votes={votes}
							/>
						</motion.div>
					)
				})}
			</div>

			{rest.length > 0 && (
				<div className="border-border/70 mt-2 border-t pt-6">
					<p className="text-muted-foreground mb-4 text-xs font-semibold tracking-[0.2em] uppercase">
						{t('otherCategories')}
					</p>
					<div className="flex w-full flex-wrap gap-3">
						{rest.map((category, index) => (
							<CompactCategory
								category={category}
								index={index}
								key={category.id}
								onSelect={onSelect}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

function CompactCategory({
	category,
	index,
	onSelect,
}: {
	category: AwardResultsCategory
	index: number
	onSelect: (slug: string) => void
}) {
	const t = useTranslations('awards')
	const winners = getCategoryWinners(category)
	const winner = winners[0]
	const name =
		winners.length > 1
			? t('results.tie')
			: winners.length === 1
				? nomineeName(winners[0])
				: t('results.noWinner')
	const votes = winners.reduce((sum, nominee) => sum + nominee.votes_count, 0)

	return (
		<motion.div
			className="h-full min-w-0 grow basis-80"
			animate={{ opacity: 1, y: 0 }}
			initial={{ opacity: 0, y: 12 }}
			transition={{ duration: 0.35, delay: 0.15 + index * 0.04 }}
		>
			<AwardHighlightCard
				avatarUrl={winner?.avatar_url ?? category.image_url}
				badge={
					winners.length > 1
						? t('results.tie')
						: winners.length > 0
							? t('results.winner')
							: t('results.title')
				}
				className="cursor-pointer"
				faction={
					category.kind === 'clan'
						? winner?.clan_faction
						: category.kind === 'player'
							? winner?.player_alliance
							: null
				}
				name={name}
				onClick={() => onSelect(category.slug)}
				size="compact"
				title={category.title}
				votes={votes}
			/>
		</motion.div>
	)
}
