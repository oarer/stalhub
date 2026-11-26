'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CopyButton } from '@/components/ui/CopyButton'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import Avatar from '@/components/ui/user/Avatar'
import Username from '@/components/ui/user/Username'
import { formatDate } from '@/lib/date'
import { getQueryClient } from '@/providers/QueryProvider'
import { clanQueries } from '@/queries/clan/clan.queries'
import { clanService } from '@/services/clan/clan.service'
import type { BulkInviteResult } from '@/types/clan/clan.type'
import { RANK_COLORS, RANK_ORDER } from './clan.const'
import { useClanRoles } from './hooks/useClanRoles'

export default function ClanInvitesView() {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const { isLeader, members, clan_id } = useClanRoles()
	const { data: invites } = useSuspenseQuery(clanQueries.getInvites())
	const [createOpen, setCreateOpen] = useState(false)
	const [selectedNames, setSelectedNames] = useState<string[]>([])
	const [results, setResults] = useState<BulkInviteResult[] | null>(null)

	const createMutation = useMutation({
		mutationFn: () => clanService.createInvitesBulk(selectedNames),
		onSuccess: (data) => {
			setResults(data)
			queryClient.invalidateQueries({ queryKey: ['clan', 'invites'] })
			queryClient.invalidateQueries({
				queryKey: clanQueries.getMembers(clan_id!).queryKey,
			})
		},
		onError: () => toast.error(t('clan.invites.createError')),
	})

	const revokeMutation = useMutation({
		mutationFn: (id: number) => clanService.revokeInvite(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['clan', 'invites'] })
			toast.success(t('clan.invites.revoked'))
		},
		onError: () => toast.error(t('clan.invites.revokeError')),
	})

	const kickMutation = useMutation({
		mutationFn: (user_id: number) => clanService.kickGuest(user_id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['clan', 'invites'] })
			queryClient.invalidateQueries({ queryKey: ['clan', 'me'] })
			queryClient.invalidateQueries({
				queryKey: clanQueries.getMembers(clan_id!).queryKey,
			})
			toast.success(t('clan.invites.kicked'))
		},
		onError: () => toast.error(t('clan.invites.kickError')),
	})

	if (!isLeader) {
		return (
			<div className="bg-card flex flex-col items-center gap-4 rounded-xl p-8 text-center">
				<Icon className="text-4xl" icon="lucide:shield-alert" />
				<h1
					className={`${mtsExtended.className} text-[22px] leading-none font-medium`}
				>
					{t('clan.invites.leaderOnly')}
				</h1>
			</div>
		)
	}

	const copy = (value: string) => {
		navigator.clipboard.writeText(value)
		toast.success(t('clan.invites.copied'))
	}

	const unlinkedMembers = [...members]
		.filter((m) => !m.user_id)
		.sort((a, b) => (RANK_ORDER[a.rank] ?? 99) - (RANK_ORDER[b.rank] ?? 99))
	const allSelected =
		unlinkedMembers.length > 0 &&
		unlinkedMembers.every((m) => selectedNames.includes(m.name))
	const createdCount = results?.filter((r) => r.ok).length ?? 0
	const failedCount = results?.filter((r) => !r.ok).length ?? 0

	const toggleName = (name: string) =>
		setSelectedNames((prev) =>
			prev.includes(name)
				? prev.filter((n) => n !== name)
				: [...prev, name]
		)

	const toggleAll = () => {
		if (allSelected) setSelectedNames([])
		else setSelectedNames(unlinkedMembers.map((m) => m.name))
	}

	const openCreate = () => {
		setSelectedNames([])
		setResults(null)
		setCreateOpen(true)
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Icon className="text-2xl" icon="lucide:ticket" />
					<h1
						className={`${mtsExtended.className} text-[22px] leading-none font-medium`}
					>
						{t('clan.invites.title')}
					</h1>
				</div>
				<Button onClick={openCreate} size="sm" variant="primary">
					<Icon className="text-lg" icon="lucide:plus" />
					{t('clan.invites.create')}
				</Button>
			</div>

			<p className="text-foreground text-sm font-medium">
				{t('clan.invites.desc')}
			</p>

			{invites.length === 0 && (
				<div className="bg-card flex flex-col items-center gap-2 rounded-xl p-8 text-center">
					<Icon
						className="text-foreground text-3xl"
						icon="lucide:ticket"
					/>
					<p className="text-foreground font-semibold">
						{t('clan.invites.empty')}
					</p>
				</div>
			)}

			{invites.map((invite) => (
				<div
					className="bg-card flex flex-col gap-3 rounded-xl px-5 py-4"
					key={invite.id}
				>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							<span className="bg-muted rounded-md px-2 py-1 font-mono font-semibold tracking-widest">
								{invite.code}
							</span>
							<Button
								onClick={() => copy(invite.code)}
								size="sm"
								variant="ghost"
							>
								<Icon className="text-lg" icon="lucide:copy" />
							</Button>
						</div>
						<div className="flex items-center gap-2">
							{invite.claimed_at ? (
								<Badge variant={'success'}>
									<Icon
										className="text-sm"
										icon="lucide:check-circle-2"
									/>
									{t('clan.invites.claimed')}
								</Badge>
							) : (
								<Badge>{t('clan.invites.pending')}</Badge>
							)}
							{invite.claimed_at && (
								<Button
									loading={kickMutation.isPending}
									onClick={() =>
										kickMutation.mutate(invite.user_id)
									}
									size="sm"
									variant="ghost"
								>
									<Icon
										className="text-lg"
										icon="lucide:user-x"
									/>
								</Button>
							)}
							<Button
								className="ring-0"
								loading={revokeMutation.isPending}
								onClick={() => revokeMutation.mutate(invite.id)}
								size="sm"
								variant={'danger'}
							>
								<Icon
									className="text-lg"
									icon="lucide:trash-2"
								/>
							</Button>
						</div>
					</div>

					<div className="text-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
						<span className="font-semibold">
							<Username user={invite.user} />
						</span>
						<span className={`font-mono font-semibold`}>
							{formatDate(invite.created_at, 'datetime')}
						</span>
						{invite.claimed_by && (
							<span className={`font-mono font-medium`}>
								{t('clan.invites.claimed_by')}:{' '}
								{invite.claimed_by}
							</span>
						)}
					</div>
				</div>
			))}

			<Modal.Root
				onOpenChange={(open) => {
					if (!open) setCreateOpen(false)
				}}
				open={createOpen}
			>
				<Modal.Content className="max-w-md">
					<Modal.Header>
						<Modal.Title>
							{results
								? t('clan.invites.resultsTitle')
								: t('clan.invites.createdTitle')}
						</Modal.Title>
					</Modal.Header>
					<Modal.Body className="flex flex-col gap-3">
						{results === null ? (
							<>
								<p className="text-foreground font-semibold">
									{t('clan.invites.createdDesc')}
								</p>
								{unlinkedMembers.length === 0 ? (
									<div className="bg-card flex flex-col items-center gap-2 rounded-xl p-6 text-center">
										<Icon
											className="text-foreground text-3xl"
											icon="lucide:user-check"
										/>
										<p className="text-foreground font-semibold">
											{t('clan.invites.noUnlinked')}
										</p>
									</div>
								) : (
									<>
										<div className="flex items-center justify-between gap-2">
											<span className="text-foreground text-sm font-semibold">
												{t(
													'clan.invites.membersCount',
													{
														count: unlinkedMembers.length,
													}
												)}
											</span>
											<Button
												className="gap-2"
												onClick={toggleAll}
												size="sm"
												variant="ghost"
											>
												<Icon
													className="text-lg"
													icon={
														allSelected
															? 'lucide:square-dashed'
															: 'lucide:square-check'
													}
												/>
												{t('clan.invites.selectAll')}
											</Button>
										</div>
										<div className="flex max-h-64 flex-col gap-1 overflow-y-auto pr-1">
											{unlinkedMembers.map((m) => (
												<label
													className="bg-card hover:bg-accent/40 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-all"
													key={m.id}
												>
													<input
														checked={selectedNames.includes(
															m.name
														)}
														className="accent-border size-4 shrink-0 cursor-pointer"
														onChange={() =>
															toggleName(m.name)
														}
														type="checkbox"
													/>
													{m.user ? (
														<Avatar
															height={28}
															id={m.user.id}
															username={
																m.user.username
															}
															width={28}
														/>
													) : (
														<div className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
															{m.name
																.charAt(0)
																.toUpperCase()}
														</div>
													)}
													<span className="min-w-0 flex-1 truncate text-sm font-semibold">
														{m.name}
													</span>
													<Badge
														className={`font-mono ${RANK_COLORS[m.rank] ?? ''}`}
														variant="secondary"
													>
														{t(
															`player.rank.${m.rank}`
														)}
													</Badge>
												</label>
											))}
										</div>
										<div className="flex items-center justify-between gap-2">
											<span className="text-foreground text-sm font-semibold">
												{t(
													'clan.invites.selectedCount',
													{
														count: selectedNames.length,
													}
												)}
											</span>
											<Button
												disabled={
													selectedNames.length === 0
												}
												loading={
													createMutation.isPending
												}
												onClick={() =>
													createMutation.mutate()
												}
												variant="primary"
											>
												{t('clan.invites.createBulk')}
											</Button>
										</div>
									</>
								)}
							</>
						) : (
							<>
								<Alert.Root variant={'warning'}>
									<Alert.Description>
										{t('clan.invites.warning')}
									</Alert.Description>
								</Alert.Root>
								<p className="text-foreground font-semibold">
									{t('clan.invites.resultsDesc', {
										created: createdCount,
										failed: failedCount,
									})}
								</p>
								<div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
									{results.map((result, i) =>
										result.ok ? (
											<div
												className="flex flex-col gap-1.5 rounded-lg bg-emerald-500/10 p-3"
												key={i}
											>
												<div className="flex items-center justify-between gap-2">
													<span className="font-semibold">
														{result.nickname}
													</span>
												</div>
												<CopyRow
													copy={copy}
													label={t(
														'clan.invites.code'
													)}
													value={result.code ?? ''}
												/>
												<CopyRow
													copy={copy}
													label={t(
														'clan.invites.username'
													)}
													value={
														result.username ?? ''
													}
												/>
												<CopyRow
													copy={copy}
													label={t(
														'clan.invites.password'
													)}
													value={
														result.password ?? ''
													}
												/>
											</div>
										) : (
											<div
												className="bg-destructive/10 flex items-center justify-between gap-2 rounded-lg p-3"
												key={i}
											>
												<span className="font-semibold">
													{result.nickname}
												</span>
												<span className="text-destructive text-xs font-semibold">
													{result.error}
												</span>
											</div>
										)
									)}
								</div>
								<Button
									onClick={() => setCreateOpen(false)}
									variant="secondary"
								>
									{t('clan.invites.close')}
								</Button>
							</>
						)}
					</Modal.Body>
				</Modal.Content>
			</Modal.Root>
		</div>
	)
}

function CopyRow({
	copy,
	label,
	value,
}: {
	copy: (value: string) => void
	label: string
	value: string
}) {
	return (
		<div className="bg-card/60 flex items-center justify-between gap-2 rounded-md px-2 py-1">
			<span className="text-foreground text-sm font-semibold">
				{label}
			</span>
			<span className="flex min-w-0 items-center gap-1">
				<span className="truncate font-mono text-xs font-semibold">
					{value}
				</span>
				<CopyButton className="p-4" text={value} variant={'ghost'} />
			</span>
		</div>
	)
}
