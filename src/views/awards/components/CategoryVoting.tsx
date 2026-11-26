'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import type { Ref } from 'react'
import type {
	AwardCampaignStatus,
	AwardCategory,
	AwardNominee,
	AwardResults,
} from '@/types/awards.type'
import { CategoryNominees } from './CategoryNominees'
import { CategoryPlayers } from './CategoryPlayers'
import { CategoryResults } from './CategoryResults'
import { CategoryVotingHeader } from './CategoryVotingHeader'

export function CategoryVoting({
	category,
	status,
	published,
	campaignCanVote,
	reason,
	results,
	resultsPending,
	resultsError,
	panelRef,
	onVote,
	onPlayerVote,
	onNominate,
	onShare,
}: {
	category: AwardCategory
	status: AwardCampaignStatus
	published: boolean
	campaignCanVote: boolean
	reason: string
	results: AwardResults | undefined
	resultsPending: boolean
	resultsError: boolean
	panelRef: Ref<HTMLDivElement>
	onVote: (nominee: AwardNominee) => void
	onPlayerVote: (playerName: string) => void
	onNominate: () => void
	onShare: () => void
}) {
	const t = useTranslations('awards')
	const categoryResult = results?.categories.find(
		(item) => item.id === category.id
	)
	const hasWinner = Boolean(
		categoryResult &&
			(categoryResult.winner_ids.length > 0 ||
				categoryResult.nominees.some((item) => item.place === 1))
	)

	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="bg-card/60 ring-primary/30 relative flex w-full scroll-mt-28 flex-col gap-6 rounded-3xl p-5 shadow-2xl ring-2 backdrop-blur-md sm:p-7"
			initial={{ opacity: 0, y: 16 }}
			key={category.id}
			ref={panelRef}
			transition={{ duration: 0.4 }}
		>
			<CategoryVotingHeader
				category={category}
				hasWinner={hasWinner}
				onNominate={onNominate}
				onShare={onShare}
				published={published}
				status={status}
			/>

			{!published && reason && (
				<p className="text-warning text-sm">{reason}</p>
			)}

			{published ? (
				resultsError ? (
					<p className="text-muted-foreground rounded-2xl border p-6 text-center">
						{t('loadError')}
					</p>
				) : results ? (
					<CategoryResults results={categoryResult} />
				) : resultsPending ? (
					<div className="text-muted-foreground flex items-center gap-3">
						<Icon
							className="text-primary animate-spin text-xl"
							icon="lucide:loader-circle"
						/>
						{t('loading')}
					</div>
				) : null
			) : category.kind === 'player' ? (
				<CategoryPlayers
					canVote={campaignCanVote}
					category={category}
					onVote={onPlayerVote}
				/>
			) : (
				<CategoryNominees
					canVote={campaignCanVote}
					category={category}
					onVote={onVote}
				/>
			)}
		</motion.div>
	)
}
