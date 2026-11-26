'use client'

import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { mtsExtended } from '@/app/fonts'
import { cn } from '@/lib/cn'
import type { AwardResultsCategory } from '@/types/awards.type'
import { getCategoryWinners } from '../../utils/award-results'
import { nomineeName } from '../../utils/results-presentation'
import { AwardHighlightCard } from '../AwardResultCards'
import { ConfettiBurst } from './ConfettiBurst'

export function OverallSlide({
	categories,
}: {
	categories: AwardResultsCategory[]
}) {
	const t = useTranslations('awards')
	const featured = categories.slice(0, 3)
	const rest = categories.slice(3)

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
			<div className="flex flex-col gap-2 text-center">
				<span className="text-primary text-xs font-semibold tracking-[0.24em] uppercase">
					{t('results.resultsTitle')}
				</span>
				<h2
					className={`${mtsExtended.className} text-3xl font-semibold tracking-tight sm:text-4xl`}
				>
					{t('results.overall')}
				</h2>
			</div>

			<div className="relative flex flex-col gap-4">
				<ConfettiBurst seed="overall" />
				<div className="grid gap-4 md:grid-cols-3">
					{featured.map((category, index) => (
						<OverallWinnerCard
							category={category}
							index={index}
							key={category.id}
						/>
					))}
				</div>

				{rest.length > 0 && (
					<div className="flex w-full flex-wrap gap-x-4 gap-y-6 sm:gap-x-5">
						{rest.map((category, index) => (
							<OverallWinnerCard
								category={category}
								className="min-w-0 grow basis-[calc(50%_-_0.5rem)] sm:basis-[calc(33.333%_-_0.833rem)] lg:basis-[calc(25%_-_0.9375rem)]"
								compact
								index={index}
								key={category.id}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

function OverallWinnerCard({
	category,
	index,
	compact = false,
	className,
}: {
	category: AwardResultsCategory
	index: number
	compact?: boolean
	className?: string
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
			animate={{ opacity: 1, scale: 1, y: 0 }}
			className={cn(compact ? 'h-full' : 'h-full w-full', className)}
			initial={
				compact
					? { opacity: 0, scale: 0.94, y: 16 }
					: { opacity: 0, scale: 0.9, y: 24 }
			}
			transition={{
				delay: compact ? 0.24 + index * 0.04 : index * 0.08,
				duration: compact ? 0.35 : 0.45,
				ease: 'easeOut',
			}}
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
				faction={
					category.kind === 'clan'
						? winner?.clan_faction
						: category.kind === 'player'
							? winner?.player_alliance
							: null
				}
				name={name}
				size={compact ? 'compact' : 'default'}
				title={category.title}
				votes={votes}
			/>
		</motion.div>
	)
}
