'use client'

import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/cn'
import { useNominateClanMutation } from '@/queries/awards/awards.queries'
import { AwardApiError } from '@/services/awards/awards.service'
import { unoService } from '@/services/uno/uno.service'
import type { ClanCandidate } from '@/types/awards.type'
import { allianceColors } from '@/types/player.type'
import { UnoFaction } from '@/views/uno/components/UnoFaction'
import { normalizeUnoFaction } from '@/views/uno/utils/uno.utils'

interface ClanOption {
	id: string
	name: string
	tag: string | null
	faction: string | null
	members: number | null
}

function fromCandidate(candidate: ClanCandidate): ClanOption {
	return {
		id: candidate.id,
		name: candidate.name,
		tag: candidate.tag,
		faction: candidate.faction ?? null,
		members: candidate.member_count ?? null,
	}
}

function fromSuggestion(clan: {
	id: string
	name: string
	tag: string | null
	faction: string | null
	memberCount: number | null
}): ClanOption {
	return {
		id: clan.id,
		name: clan.name,
		tag: clan.tag,
		faction: clan.faction,
		members: clan.memberCount,
	}
}

export default function AwardNominateClanDialog({
	open,
	onOpenChange,
	categoryId,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	categoryId: string
}) {
	const t = useTranslations()
	const [name, setName] = useState('')
	const [selected, setSelected] = useState<ClanOption | null>(null)
	const [candidates, setCandidates] = useState<ClanCandidate[]>([])
	const mutation = useNominateClanMutation()
	const query = useDebounce(name.trim(), 300)
	const suggestions = useQuery({
		queryKey: ['uno', 'clans', 'search', query],
		queryFn: ({ signal }) => unoService.searchClans(query, signal),
		enabled: query.length >= 2,
		staleTime: 60_000,
		retry: false,
	})

	const options: ClanOption[] =
		candidates.length > 0
			? candidates.map(fromCandidate)
			: (suggestions.data ?? []).map(fromSuggestion)
	const showOptions =
		!selected &&
		options.length > 0 &&
		(candidates.length > 0 || query.length >= 2)
	const selectedFaction = selected
		? normalizeUnoFaction(selected.faction)
		: null
	const selectedColor = selectedFaction
		? allianceColors[selectedFaction]
		: undefined

	const choose = (option: ClanOption) => {
		setName(option.name)
		setSelected(option)
		setCandidates([])
	}

	const submit = () =>
		mutation.mutate(
			{
				category_id: categoryId,
				clan_name: name.trim(),
			},
			{
				onSuccess: () => {
					toast.success(t('awards.nominateClan.nominated'))
					setCandidates([])
					setSelected(null)
					setName('')
					onOpenChange(false)
				},
				onError: (e) => {
					if (!(e instanceof AwardApiError)) {
						toast.error(t('awards.voteUnavailable'))
						return
					}
					const code = e.payload?.code
					if (e.status === 422 && code === 'clan_ambiguous') {
						setCandidates(e.payload?.candidates ?? [])
						return
					}
					if (e.status === 409) toast.error(t('awards.alreadyVoted'))
					else if (e.status === 404)
						toast.error(t('awards.nominateClan.notFound'))
					else if (e.status === 429) {
						if (e.payload?.cooldown_seconds) {
							toast.error(
								t('awards.nominateClan.cooldown', {
									seconds: e.payload.cooldown_seconds,
								})
							)
						} else {
							toast.error(t('awards.nominateClan.tooMany'))
						}
					} else if (e.status === 400)
						toast.error(t('awards.nominateClan.capExceeded'))
					else if (e.status === 403) toast.error(t('awards.notExbo'))
					else if (e.status === 503)
						toast.error(t('awards.voteUnavailable'))
				},
			}
		)

	return (
		<Modal.Root onOpenChange={onOpenChange} open={open}>
			<Modal.Content className="max-w-xl" fullScreen={false}>
				<Modal.Header>
					<Modal.Title>{t('awards.nominateClan.title')}</Modal.Title>
				</Modal.Header>
				<div className="flex flex-col gap-3">
					<Input
						label={t('awards.nominateClan.placeholder')}
						onChange={(e) => {
							setName(e.target.value)
							setSelected(null)
							setCandidates([])
						}}
						value={name}
					/>
					<AnimatePresence initial={false}>
						{selected && (
							<motion.div
								animate={{ opacity: 1, y: 0 }}
								className="border-primary/30 bg-primary/5 rounded-xl border p-3"
								exit={{ opacity: 0, y: -4 }}
								initial={{ opacity: 0, y: -4 }}
								key={selected.id}
								layout
								transition={{ duration: 0.2 }}
							>
								<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
									<p
										className={cn(
											'truncate font-semibold',
											selectedColor
										)}
									>
										{selected.tag && (
											<span>{`[${selected.tag}] `}</span>
										)}
										{selected.name}
									</p>
									<UnoFaction
										faction={selected.faction}
										labelClassName={selectedColor}
										size={18}
									/>
									{selected.members != null && (
										<span className="text-muted-foreground text-xs">
											{t(
												'awards.nominateClan.memberCount',
												{
													count: selected.members,
												}
											)}
										</span>
									)}
								</div>
							</motion.div>
						)}
					</AnimatePresence>
					<AnimatePresence initial={false}>
						{showOptions && (
							<motion.div
								animate={{ opacity: 1, y: 0 }}
								className="flex max-h-64 flex-col gap-3 overflow-y-auto pr-1"
								exit={{ opacity: 0, y: -4 }}
								initial={{ opacity: 0, y: -4 }}
								key={
									candidates.length > 0
										? 'ambiguous'
										: 'suggestions'
								}
								layout
								transition={{ duration: 0.2 }}
							>
								<p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
									{candidates.length > 0
										? t('awards.nominateClan.ambiguous')
										: t('awards.nominateClan.search')}
								</p>
								<div className="flex flex-col gap-2">
									<AnimatePresence initial={false}>
										{options.map((option, index) => {
											const faction = normalizeUnoFaction(
												option.faction
											)
											const color = faction
												? allianceColors[faction]
												: undefined
											return (
												<motion.button
													animate={{
														opacity: 1,
														y: 0,
													}}
													className="group bg-card/60 hover:border-primary/40 hover:bg-accent rounded-xl border p-3 text-left transition-colors"
													exit={{ opacity: 0, y: -4 }}
													initial={{
														opacity: 0,
														y: 6,
													}}
													key={option.id}
													layout
													onClick={() =>
														choose(option)
													}
													transition={{
														duration: 0.18,
														delay: index * 0.03,
													}}
													type="button"
													whileHover={{ x: 3 }}
													whileTap={{ scale: 0.985 }}
												>
													<div className="flex flex-col gap-1">
														<p
															className={cn(
																'truncate font-semibold',
																color
															)}
														>
															{option.tag && (
																<span>{`[${option.tag}] `}</span>
															)}
															{option.name}
														</p>
														<div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
															<UnoFaction
																faction={
																	option.faction
																}
																labelClassName={
																	color
																}
																size={16}
															/>
															{option.members !=
																null && (
																<span>
																	{t(
																		'awards.nominateClan.memberCount',
																		{
																			count: option.members,
																		}
																	)}
																</span>
															)}
														</div>
													</div>
												</motion.button>
											)
										})}
									</AnimatePresence>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
					<Modal.Footer>
						<Modal.Close>
							{t('awards.nominateClan.cancel')}
						</Modal.Close>
						<Button
							disabled={!name.trim()}
							loading={mutation.isPending}
							onClick={submit}
						>
							{t('awards.nominateClan.submit')}
						</Button>
					</Modal.Footer>
				</div>
			</Modal.Content>
		</Modal.Root>
	)
}
