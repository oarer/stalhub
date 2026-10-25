'use client'

import { Icon } from '@iconify/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from '@/components/ui/Toast'
import { adminClanQueries } from '@/queries/admin/clan.queries'
import { adminNotificationQueries } from '@/queries/admin/notification.queries'
import { adminRoleQueries } from '@/queries/admin/role.queries'
import { adminUserQueries } from '@/queries/admin/user.queries'
import { adminNotificationService } from '@/services/admin/notification.service'
import type { AdminNotificationTargetKind } from '@/types/admin.type'

export default function NotificationsAdminView() {
	const t = useTranslations()
	const queryClient = useQueryClient()
	const [mode, setMode] = useState<'broadcast' | 'user' | 'target'>(
		'broadcast'
	)
	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [link, setLink] = useState('')
	const [userSearch, setUserSearch] = useState('')
	const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
	const [targetKind, setTargetKind] =
		useState<AdminNotificationTargetKind>('banned')
	const [roleId, setRoleId] = useState<number | null>(null)
	const [clanId, setClanId] = useState<string | null>(null)

	const { data: usersData } = useQuery(
		adminUserQueries.list({
			take: 10,
			search: userSearch || undefined,
		})
	)

	const { data: rolesData } = useQuery(adminRoleQueries.list())

	const { data: clansData } = useQuery(adminClanQueries.list({ take: 50 }))

	const targetPayload =
		targetKind === 'role'
			? { kind: targetKind as 'role', role_id: roleId ?? undefined }
			: targetKind === 'clan'
				? { kind: targetKind as 'clan', clan_id: clanId ?? undefined }
				: { kind: targetKind }

	const targetMissing =
		(targetKind === 'role' && !roleId) || (targetKind === 'clan' && !clanId)

	const { data: estimateData } = useQuery({
		...adminNotificationQueries.estimateTargets(targetPayload),
		enabled: mode === 'target' && !targetMissing,
		placeholderData: (prev) => prev,
	})

	const broadcastMutation = useMutation({
		mutationFn: () =>
			adminNotificationService.broadcast({
				title,
				content,
				link: link || undefined,
			}),
		onSuccess: (res) => {
			toast.success(
				t('admin.notifications.toast.broadcastSent', {
					count: res.sent,
				})
			)
			resetForm()
		},
		onError: () => toast.error(t('admin.notifications.toast.sendError')),
	})

	const toUserMutation = useMutation({
		mutationFn: () => {
			if (!selectedUserId) throw new Error('No user')
			return adminNotificationService.sendToUser(selectedUserId, {
				title,
				content,
				link: link || undefined,
			})
		},
		onSuccess: () => {
			toast.success(t('admin.notifications.toast.sent'))
			resetForm()
		},
		onError: () => toast.error(t('admin.notifications.toast.sendError')),
	})

	const targetMutation = useMutation({
		mutationFn: () =>
			adminNotificationService.sendToTarget(targetPayload, {
				title,
				content,
				link: link || undefined,
			}),
		onSuccess: (res) => {
			toast.success(
				t('admin.notifications.toast.broadcastSent', {
					count: res.sent,
				})
			)
			queryClient.invalidateQueries({
				queryKey: ['admin', 'notifications', 'stats'],
			})
			resetForm()
		},
		onError: () => toast.error(t('admin.notifications.toast.sendError')),
	})

	const resetForm = () => {
		setTitle('')
		setContent('')
		setLink('')
		setUserSearch('')
		setSelectedUserId(null)
	}

	const handleSend = () => {
		if (!title.trim() || !content.trim()) return
		if (mode === 'broadcast') {
			broadcastMutation.mutate()
		} else if (mode === 'user') {
			toUserMutation.mutate()
		} else {
			targetMutation.mutate()
		}
	}

	const isPending =
		broadcastMutation.isPending ||
		toUserMutation.isPending ||
		targetMutation.isPending

	const users = usersData?.data ?? []

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="font-semibold text-2xl">
					{t('admin.notifications.title')}
				</h1>
			</div>

			<Card.Root>
				<Card.Header>
					<Card.Title>
						<Icon icon="lucide:send" />
						{t('admin.notifications.sendTitle')}
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div className="flex flex-col gap-4">
						<div className="flex flex-wrap gap-2">
							<Button
								className={`gap-2 ${
									mode === 'broadcast' && 'dark:bg-border/20'
								}`}
								onClick={() => setMode('broadcast')}
								variant={'secondary'}
							>
								<Icon className="size-4" icon="lucide:globe" />
								{t('admin.notifications.broadcast')}
							</Button>
							<Button
								className={`gap-2 ${
									mode === 'user' && 'dark:bg-border/20'
								}`}
								onClick={() => setMode('user')}
								variant={'secondary'}
							>
								<Icon className="size-4" icon="lucide:user" />
								{t('admin.notifications.toUser')}
							</Button>
							<Button
								className={`gap-2 ${
									mode === 'target' && 'dark:bg-border/20'
								}`}
								onClick={() => setMode('target')}
								variant={'secondary'}
							>
								<Icon className="size-4" icon="lucide:filter" />
								{t('admin.notifications.target')}
							</Button>
						</div>

						{mode === 'target' && (
							<div className="flex flex-col gap-2">
								<div className="flex flex-wrap gap-2">
									{(
										[
											['banned', 'user-x'],
											['all', 'globe-2'],
											['role', 'shield-user'],
											['clan', 'swords'],
										] as [
											AdminNotificationTargetKind,
											string,
										][]
									).map(([kind, icon]) => (
										<Button
											className={`gap-2 ${
												targetKind === kind &&
												'dark:bg-border/20'
											}`}
											key={kind}
											onClick={() => {
												setTargetKind(kind)
												setRoleId(null)
												setClanId(null)
											}}
											variant={'secondary'}
										>
											<Icon
												className="size-4"
												icon={`lucide:${icon}`}
											/>
											{t(
												`admin.notifications.targetKind.${kind}`
											)}
										</Button>
									))}
								</div>

								{targetKind === 'role' && (
									<Combobox
										className="h-10 md:w-80"
										onValueChange={(value) =>
											setRoleId(value ? Number(value) : null)
										}
										options={(rolesData ?? []).map((role) => ({
											label: role.name,
											value: String(role.id),
										}))}
										placeholder="admin.notifications.selectRole"
										translateOptions={false}
										value={roleId ? String(roleId) : ''}
									/>
								)}

								{targetKind === 'clan' && (
									<Combobox
										className="h-10 md:w-80"
										onValueChange={(value) =>
											setClanId(value || null)
										}
										options={(clansData?.data ?? []).map(
											(clan) => ({
												label: clan.name,
												value: String(clan.id),
											})
										)}
										placeholder="admin.notifications.selectClan"
										translateOptions={false}
										value={clanId ?? ''}
									/>
								)}

								{estimateData && !targetMissing && (
									<p className="flex items-center gap-1.5 text-neutral-400 text-sm">
										<Icon
											className="size-4 text-sky-400"
											icon="lucide:users"
										/>
										{t('admin.notifications.recipients', {
											count: estimateData.count,
										})}
									</p>
								)}
							</div>
						)}

						{mode === 'user' && (
							<div className="flex flex-col gap-2">
								<Input
									label="admin.notifications.searchUser"
									onChange={(e) => {
										setUserSearch(e.target.value)
										setSelectedUserId(null)
									}}
									value={userSearch}
								/>
								{userSearch && !selectedUserId && (
									<div className="flex flex-col gap-1 rounded-lg border border-primary bg-card p-1">
										{users
											.filter(
												(u) =>
													u.username
														.toLowerCase()
														.includes(
															userSearch.toLowerCase()
														) ||
													(u.name &&
														u.name
															.toLowerCase()
															.includes(
																userSearch.toLowerCase()
															))
											)
											.slice(0, 5)
											.map((u) => (
												<Button
													className="justify-start px-2 py-1.5 text-left font-normal"
													key={u.id}
													onClick={() => {
														setSelectedUserId(u.id)
														setUserSearch(
															u.username
														)
													}}
													variant="ghost"
												>
													<span className="font-semibold">
														{u.username}
													</span>
													{u.name && (
														<span className="text-foreground text-xs">
															({u.name})
														</span>
													)}
													<span className="text-foreground text-xs">
														ID: {u.id}
													</span>
												</Button>
											))}
										{users.filter(
											(u) =>
												u.username
													.toLowerCase()
													.includes(
														userSearch.toLowerCase()
													) ||
												(u.name &&
													u.name
														.toLowerCase()
														.includes(
															userSearch.toLowerCase()
														))
										).length === 0 && (
											<p className="px-2 py-1 text-foreground text-sm">
												{t(
													'admin.notifications.notFound'
												)}
											</p>
										)}
									</div>
								)}
								{selectedUserId && (
									<div className="flex items-center gap-2 text-sm">
										<Icon
											className="size-4 text-green-400"
											icon="lucide:check-circle"
										/>
										<span className="font-semibold">
											{userSearch}
										</span>
										<Button
											className="h-auto p-0 text-foreground text-xs underline-offset-2 hover:underline"
											onClick={() => {
												setSelectedUserId(null)
												setUserSearch('')
											}}
											variant="none"
										>
											{t('admin.notifications.change')}
										</Button>
									</div>
								)}
							</div>
						)}

						<Input
							label="admin.notifications.titleLabel"
							onChange={(e) => setTitle(e.target.value)}
							value={title}
						/>

						<div className="flex flex-col gap-1">
							<span className="font-semibold text-foreground text-sm">
								{t('admin.notifications.contentLabel')}
							</span>
							<Textarea
								className="min-h-20 resize-none border-primary focus:border-primary/50"
								onChange={(e) => setContent(e.target.value)}
								placeholder={t(
									'admin.notifications.contentPlaceholder'
								)}
								value={content}
							/>
						</div>

						<Input
							label="admin.notifications.linkLabel"
							onChange={(e) => setLink(e.target.value)}
							value={link}
						/>

						<Button
							disabled={
								!title.trim() ||
								!content.trim() ||
								(mode === 'user' && !selectedUserId) ||
								(mode === 'target' && targetMissing) ||
								isPending
							}
							loading={isPending}
							onClick={handleSend}
						>
							<Icon className="size-4" icon="lucide:send" />
							{mode === 'broadcast'
								? t('admin.notifications.sendAll')
								: mode === 'user'
									? t('admin.notifications.sendToUser')
									: t('admin.notifications.sendToTarget')}
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	)
}
