'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { montserrat } from '@/app/fonts'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CopyButton } from '@/components/ui/CopyButton'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import Avatar from '@/components/ui/user/Avatar'
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
	const { isLeader, members, clanId } = useClanRoles()
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
				queryKey: clanQueries.getMembers(clanId!).queryKey,
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
		mutationFn: (userId: number) => clanService.kickGuest(userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['clan', 'invites'] })
			queryClient.invalidateQueries({ queryKey: ['clan', 'me'] })
			queryClient.invalidateQueries({
				queryKey: clanQueries.getMembers(clanId!).queryKey,
			})
			toast.success(t('clan.invites.kicked'))
		},
		onError: () => toast.error(t('clan.invites.kickError')),
	})

	if (!isLeader) {
		return (
			<div className="flex flex-col items-center gap-4 rounded-xl bg-background p-8 text-center">
				<Icon className="text-4xl" icon="lucide:shield-alert" />
				<h1 className="font-semibold text-xl">
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
		.filter((m) => !m.userId)
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
					<h1 className="font-semibold text-xl">
						{t('clan.invites.title')}
					</h1>
				</div>
				<Button onClick={openCreate} size="sm" variant="primary">
					<Icon className="text-lg" icon="lucide:plus" />
					{t('clan.invites.create')}
				</Button>
			</div>

			<p className="font-semibold text-text-accent">
				{t('clan.invites.desc')}
			</p>

			{invites.length === 0 && (
				<div className="flex flex-col items-center gap-2 rounded-xl bg-background p-8 text-center">
					<Icon
						className="text-3xl text-text-accent"
						icon="lucide:ticket"
					/>
					<p className="font-semibold text-text-accent">
						{t('clan.invites.empty')}
					</p>
				</div>
			)}

			{invites.map((invite) => (
				<div
					className="flex flex-col gap-3 rounded-xl bg-background px-5 py-4"
					key={invite.id}
				>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							<span className="rounded-md bg-accent px-2 py-1 font-mono font-semibold tracking-widest">
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
										kickMutation.mutate(invite.userId)
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

					<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-accent">
						<span className="font-semibold">
							{invite.user.name || invite.user.username}
						</span>
						<span
							className={`${montserrat.className} font-semibold`}
						>
							{formatDate(invite.created_at, 'datetime')}
						</span>
						{invite.claimed_by && (
							<span
								className={`${montserrat.className} font-medium`}
							>
								{t('clan.invites.claimedBy')}:{' '}
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
								<p className="font-semibold text-text-accent">
									{t('clan.invites.createdDesc')}
								</p>
								{unlinkedMembers.length === 0 ? (
									<div className="flex flex-col items-center gap-2 rounded-xl bg-background p-6 text-center">
										<Icon
											className="text-3xl text-text-accent"
											icon="lucide:user-check"
										/>
										<p className="font-semibold text-text-accent">
											{t('clan.invites.noUnlinked')}
										</p>
									</div>
								) : (
									<>
										<div className="flex items-center justify-between gap-2">
											<span className="font-semibold text-sm text-text-accent">
												{t(
													'clan.invites.membersCount',
													{
														count: unlinkedMembers.length,
													}
												)}
											</span>
											<Button
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
													className="flex cursor-pointer items-center gap-3 rounded-lg bg-background px-3 py-2 transition-all hover:bg-accent/40"
													key={m.id}
												>
													<input
														checked={selectedNames.includes(
															m.name
														)}
														className="size-4 shrink-0 cursor-pointer accent-border"
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
														<div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-xs">
															{m.name
																.charAt(0)
																.toUpperCase()}
														</div>
													)}
													<span className="min-w-0 flex-1 truncate font-semibold text-sm">
														{m.name}
													</span>
													<Badge
														className={`${montserrat.className} ${RANK_COLORS[m.rank] ?? ''}`}
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
											<span className="font-semibold text-sm text-text-accent">
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
								<p className="font-semibold text-text-accent">
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
												className="flex items-center justify-between gap-2 rounded-lg bg-red-500/10 p-3"
												key={i}
											>
												<span className="font-semibold">
													{result.nickname}
												</span>
												<span className="font-semibold text-red-400 text-xs">
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
		<div className="flex items-center justify-between gap-2 rounded-md bg-background/60 px-2 py-1">
			<span className="font-semibold text-sm text-text-accent">
				{label}
			</span>
			<span className="flex min-w-0 items-center gap-1">
				<span className="truncate font-mono font-semibold text-xs">
					{value}
				</span>
				<CopyButton className="p-4" text={value} variant={'ghost'} />
			</span>
		</div>
	)
}
