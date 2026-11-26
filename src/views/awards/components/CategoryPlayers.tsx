'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import { useDebounce } from '@/hooks/useDebounce'
import { awardsService } from '@/services/awards/awards.service'
import type { AwardCategory, AwardPlayerCandidate } from '@/types/awards.type'
import { AwardPlayerCard } from './AwardPlayerCard'

interface PlayerChoice {
	name: string
	alliance?: string | null
	region?: string | null
	avatar_url?: string | null
	nominee_id?: string | null
}

export function CategoryPlayers({
	category,
	canVote,
	onVote,
}: {
	category: AwardCategory
	canVote: boolean
	onVote: (playerName: string) => void
}) {
	const t = useTranslations('awards')
	const [name, setName] = useState('')
	const selectedName = category.nominees.find(
		(nominee) => nominee.id === category.my_vote_nominee_id
	)?.name
	const [picked, setPicked] = useState<PlayerChoice | null>(null)
	const query = useDebounce(name.trim(), 350)
	const search = useQuery({
		queryKey: ['awards', 'players', 'search', category.id, query],
		queryFn: ({ signal }) =>
			awardsService.searchPlayers(category.id, query, signal),
		enabled: query.length >= 2,
		staleTime: 15_000,
		retry: false,
	})

	const voted = Boolean(category.my_vote_nominee_id)
	const options: PlayerChoice[] = picked
		? [picked]
		: (search.data?.items ?? []).map((candidate: AwardPlayerCandidate) => ({
				name: candidate.name,
				alliance: candidate.alliance,
				region: candidate.region,
				nominee_id: candidate.nominee_id,
			}))
	const top = category.top ?? []

	const choose = (choice: PlayerChoice) => {
		setName(choice.name)
		setPicked(choice)
	}

	const submit = () => {
		const target = picked ?? { name: name.trim() }
		if (!target.name) return
		onVote(target.name)
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 rounded-2xl border p-4 sm:p-5">
				<p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
					{t('player.searchLabel')}
				</p>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					<div className="flex-1">
						<Input
							label={t('player.searchPlaceholder')}
							onChange={(event) => {
								setName(event.target.value)
								setPicked(null)
							}}
							value={name}
						/>
					</div>
					<button
						className={cn(
							'flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors',
							voted || !name.trim() || !canVote
								? 'bg-muted text-muted-foreground cursor-not-allowed'
								: 'bg-primary text-primary-foreground hover:opacity-90'
						)}
						disabled={voted || !name.trim() || !canVote}
						onClick={submit}
						type="button"
					>
						<Icon icon={voted ? 'lucide:check' : 'lucide:vote'} />
						{voted ? t('alreadyVoted') : t('vote')}
					</button>
				</div>
				{name.trim().length > 0 && name.trim().length < 2 && (
					<p className="text-muted-foreground text-xs">
						{t('player.searchHint')}
					</p>
				)}
				{search.isError && (
					<p className="text-warning text-xs">
						{t('player.searchError')}
					</p>
				)}
				{query.length >= 2 &&
					!picked &&
					!search.isPending &&
					!search.isError &&
					options.length === 0 && (
						<p className="text-muted-foreground text-xs">
							{t('player.searchEmpty')}
						</p>
					)}
				<AnimatePresence initial={false}>
					{options.length > 0 && (
						<motion.div
							animate={{ opacity: 1, y: 0 }}
							className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1"
							exit={{ opacity: 0, y: -4 }}
							initial={{ opacity: 0, y: -4 }}
							key="options"
							transition={{ duration: 0.2 }}
						>
							{options.map((option, index) => (
								<motion.div
									animate={{ opacity: 1, y: 0 }}
									initial={{ opacity: 0, y: 6 }}
									key={`${option.name}-${index}`}
									transition={{
										duration: 0.18,
										delay: index * 0.03,
									}}
								>
									<AwardPlayerCard
										alliance={option.alliance}
										avatarUrl={option.avatar_url}
										compact
										disabled={voted || !canVote}
										name={option.name}
										onVote={() =>
											voted
												? undefined
												: (choose(option),
													onVote(option.name))
										}
										region={option.region}
										selected={
											selectedName?.toLocaleLowerCase() ===
											option.name.toLocaleLowerCase()
										}
									/>
								</motion.div>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-2">
					<Icon className="text-primary" icon="lucide:flame" />
					<p className="text-xs font-semibold tracking-[0.18em] uppercase">
						{t('player.topTitle')}
					</p>
				</div>
				<p className="text-muted-foreground text-xs">
					{t('player.topDescription')}
				</p>
				{top.length === 0 ? (
					<p className="text-muted-foreground py-4 text-center text-sm">
						{t('empty')}
					</p>
				) : (
					<div className="grid gap-2 sm:grid-cols-2">
						{top.map((player) => (
							<AwardPlayerCard
								alliance={player.alliance}
								avatarUrl={player.avatar_url}
								compact
								disabled={voted || !canVote}
								key={player.id}
								name={player.name}
								onVote={() =>
									voted ? undefined : onVote(player.name)
								}
								region={player.region}
								selected={
									selectedName?.toLocaleLowerCase() ===
									player.name.toLocaleLowerCase()
								}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
