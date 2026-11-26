'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useCallback, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { effectiveAwardStatus } from '@/lib/awardStatus'
import {
	awardsQueries,
	useCastPlayerVote,
	useCastVote,
} from '@/queries/awards/awards.queries'
import { AwardApiError } from '@/services/awards/awards.service'
import { useAuthStore } from '@/stores/useAuth.store'
import type { AwardCategory, AwardNominee } from '@/types/awards.type'
import AwardNominateClanDialog from './components/AwardNominateClanDialog'
import AwardPngDialog from './components/AwardPngDialog'
import AwardResultsPngDialog from './components/AwardResultsPngDialog'
import { AwardsCategories } from './components/AwardsCategories'
import { AwardsHero } from './components/AwardsHero'
import { CategoryVoting } from './components/CategoryVoting'
import { PlayerVoteConfirmDialog } from './components/PlayerVoteConfirmDialog'
import { VoteConfirmDialog } from './components/VoteConfirmDialog'
import { VoteNextCategoryDialog } from './components/VoteNextCategoryDialog'

export default function AwardsView({
	initialCategorySlug,
}: {
	initialCategorySlug?: string
}) {
	const t = useTranslations()
	const userId = useAuthStore((state) => state.user?.id)
	const {
		data: campaign,
		isPending,
		isError,
	} = useQuery(awardsQueries.current(userId))
	const [active, setActive] = useState(initialCategorySlug ?? '')
	const [confirm, setConfirm] = useState<AwardNominee | null>(null)
	const [playerConfirm, setPlayerConfirm] = useState<string | null>(null)
	const [nextCategory, setNextCategory] = useState<AwardCategory | null>(null)
	const [nominate, setNominate] = useState(false)
	const [pngOpen, setPngOpen] = useState(false)
	const [resultsImagesOpen, setResultsImagesOpen] = useState(false)
	const votingRef = useRef<HTMLDivElement>(null)
	const vote = useCastVote()
	const playerVote = useCastPlayerVote()
	const status = campaign
		? effectiveAwardStatus(campaign.status, campaign.ends_at)
		: 'draft'
	const published = status === 'published'
	const results = useQuery({
		...awardsQueries.results(),
		enabled: published,
	})
	const category = campaign?.categories.find((c) => c.slug === active)
	const categoryFallback = category ?? campaign?.categories[0]
	const totalCandidates =
		campaign?.categories.reduce(
			(sum, item) => sum + item.nominees.length,
			0
		) ?? 0

	const openCategory = useCallback((slug: string) => {
		setActive(slug)
		window.setTimeout(() => {
			votingRef.current?.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			})
		}, 80)
	}, [])

	const voteError = (e: unknown) => {
		if (!(e instanceof AwardApiError)) {
			toast.error(t('awards.voteUnavailable'))
			return
		}
		if (e.status === 409) toast.error(t('awards.alreadyVoted'))
		else if (e.status === 403) toast.error(t('awards.notExbo'))
		else if (e.status === 401) toast.error(t('awards.authRequired'))
		else toast.error(t('awards.voteUnavailable'))
	}

	const playerVoteError = (e: unknown) => {
		if (!(e instanceof AwardApiError)) {
			toast.error(t('awards.player.voteUnavailable'))
			return
		}
		if (e.status === 409) toast.error(t('awards.alreadyVoted'))
		else if (e.status === 403) toast.error(t('awards.notExbo'))
		else if (e.status === 401) toast.error(t('awards.authRequired'))
		else if (e.status === 404) toast.error(t('awards.player.notFound'))
		else if (e.status === 422)
			toast.error(
				e.payload?.code === 'invalid_player_name'
					? t('awards.player.invalidPlayerName')
					: t('awards.voteUnavailable')
			)
		else if (e.status === 400) toast.error(t('awards.player.capExceeded'))
		else toast.error(t('awards.player.voteUnavailable'))
	}

	const submitPlayer = () => {
		if (!campaign || !categoryFallback || !playerConfirm) return
		playerVote.mutate(
			{
				category_id: categoryFallback.id,
				player_name: playerConfirm,
			},
			{
				onSuccess: () => {
					toast.success(t('awards.player.voted'))
					setPlayerConfirm(null)
					const index = campaign.categories.findIndex(
						(item) => item.id === categoryFallback.id
					)
					const next = campaign.categories[index + 1]
					if (next) setNextCategory(next)
				},
				onError: playerVoteError,
			}
		)
	}

	const submit = () => {
		if (!campaign || !categoryFallback || !confirm) return
		vote.mutate(
			{
				category_id: categoryFallback.id,
				nominee_id: confirm.id,
			},
			{
				onSuccess: () => {
					setConfirm(null)
					const index = campaign.categories.findIndex(
						(item) => item.id === categoryFallback.id
					)
					const next = campaign.categories[index + 1]
					if (next) setNextCategory(next)
					else toast.success(t('awards.voteAccepted'))
				},
				onError: voteError,
			}
		)
	}

	if (isPending) {
		return (
			<section className="flex min-h-[60vh] items-center justify-center px-4 pt-32 pb-16">
				<div className="text-muted-foreground flex items-center gap-3">
					<Icon
						className="text-primary animate-spin text-2xl"
						icon="lucide:loader-circle"
					/>
					{t('awards.loading')}
				</div>
			</section>
		)
	}

	if (isError || !campaign || !categoryFallback) {
		return (
			<section className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 pt-32 pb-16 text-center">
				<Icon className="text-primary text-4xl" icon="lucide:trophy" />
				<p className="text-muted-foreground">{t('awards.loadError')}</p>
			</section>
		)
	}

	const resultCategory = results.data?.categories.find(
		(item) => item.id === categoryFallback.id
	)
	const pngNomineeId =
		resultCategory?.winner_ids[0] ??
		resultCategory?.nominees.find((item) => item.place === 1)?.id ??
		categoryFallback.my_vote_nominee_id ??
		undefined

	const reason = campaign.vote_block_reason
		? t(
				`awards.${
					campaign.vote_block_reason === 'not_authenticated'
						? 'authRequired'
						: campaign.vote_block_reason === 'not_exbo'
							? 'notExbo'
							: campaign.vote_block_reason === 'ended'
								? 'ended'
								: 'voteUnavailable'
				}`
			)
		: ''

	return (
		<section className="relative mx-auto flex max-w-380 flex-col gap-12 px-4 pt-32 pb-16 sm:px-6 xl:pt-40">
			<div className="bg-primary/15 pointer-events-none absolute inset-x-0 top-16 mx-auto h-80 max-w-4xl rounded-full blur-[120px]" />
			<div className="flex flex-col gap-8">
				<AwardsHero
					campaign={campaign}
					published={published}
					status={status}
					totalCandidates={totalCandidates}
				/>
				{published && results.data && (
					<div className="flex justify-center">
						<Button
							className="gap-2"
							onClick={() => setResultsImagesOpen(true)}
							variant="secondary"
						>
							<Icon icon="lucide:images" />
							{t('awards.results.images')}
						</Button>
					</div>
				)}
			</div>

			<AwardsCategories
				activeSlug={categoryFallback.slug}
				categories={campaign.categories}
				onActiveChange={setActive}
				onSelect={openCategory}
				published={published}
				results={results.data}
				resultsError={results.isError}
				resultsPending={results.isPending}
			/>

			<CategoryVoting
				campaignCanVote={campaign.can_vote}
				category={categoryFallback}
				onNominate={() => setNominate(true)}
				onPlayerVote={setPlayerConfirm}
				onShare={() => setPngOpen(true)}
				onVote={setConfirm}
				panelRef={votingRef}
				published={published}
				reason={reason}
				results={results.data}
				resultsError={results.isError}
				resultsPending={results.isPending}
				status={status}
			/>

			<AwardPngDialog
				campaign={campaign}
				categories={campaign.categories}
				initialCategoryId={categoryFallback.id}
				initialNomineeId={pngNomineeId}
				onOpenChange={setPngOpen}
				open={pngOpen}
				results={results.data}
			/>

			{published && results.data && (
				<AwardResultsPngDialog
					initialCategoryId={categoryFallback.id}
					onOpenChange={setResultsImagesOpen}
					open={resultsImagesOpen}
					results={results.data}
				/>
			)}

			{playerConfirm && (
				<PlayerVoteConfirmDialog
					loading={playerVote.isPending}
					onClose={() => setPlayerConfirm(null)}
					onConfirm={submitPlayer}
					playerName={playerConfirm}
				/>
			)}
			{confirm && (
				<VoteConfirmDialog
					loading={vote.isPending}
					nominee={confirm}
					onClose={() => setConfirm(null)}
					onConfirm={submit}
				/>
			)}
			{nextCategory && (
				<VoteNextCategoryDialog
					category={nextCategory}
					onClose={() => setNextCategory(null)}
					onGo={() => {
						openCategory(nextCategory.slug)
						setNextCategory(null)
					}}
				/>
			)}
			{categoryFallback.kind === 'clan' && (
				<AwardNominateClanDialog
					categoryId={categoryFallback.id}
					onOpenChange={setNominate}
					open={nominate}
				/>
			)}
		</section>
	)
}
