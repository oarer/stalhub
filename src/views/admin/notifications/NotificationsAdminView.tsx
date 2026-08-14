'use client'

import { Icon } from '@iconify/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { adminUserQueries } from '@/queries/admin/user.queries'
import { adminNotificationService } from '@/services/admin/notification.service'

export default function NotificationsAdminView() {
	const t = useTranslations()
	const [mode, setMode] = useState<'broadcast' | 'user'>('broadcast')
	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [link, setLink] = useState('')
	const [userSearch, setUserSearch] = useState('')
	const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

	const { data: usersData } = useQuery(
		adminUserQueries.list({
			take: 10,
			search: userSearch || undefined,
		})
	)

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
			setTitle('')
			setContent('')
			setLink('')
		},
		onError: () => toast.error(t('admin.notifications.toast.sendError')),
	})

	const sendToUserMutation = useMutation({
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
			setTitle('')
			setContent('')
			setLink('')
			setSelectedUserId(null)
			setUserSearch('')
		},
		onError: () => toast.error(t('admin.notifications.toast.sendError')),
	})

	const handleSend = () => {
		if (!title.trim() || !content.trim()) return
		if (mode === 'broadcast') {
			broadcastMutation.mutate()
		} else {
			sendToUserMutation.mutate()
		}
	}

	const isPending =
		broadcastMutation.isPending || sendToUserMutation.isPending

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
						<div className="flex gap-2">
							<Button
								className={`gap-2 ${
									mode === 'broadcast' &&
									'border-sky-500 bg-sky-500/10 text-sky-400'
								}`}
								onClick={() => setMode('broadcast')}
								type="button"
							>
								<Icon className="size-4" icon="lucide:globe" />
								{t('admin.notifications.broadcast')}
							</Button>
							<Button
								className={`gap-2 ${
									mode === 'user' &&
									'border-sky-500 bg-sky-500/10 text-sky-400'
								}`}
								onClick={() => setMode('user')}
								type="button"
							>
								<Icon className="size-4" icon="lucide:user" />
								{t('admin.notifications.toUser')}
							</Button>
						</div>

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
									<div className="flex flex-col gap-1 rounded-lg border border-border-secondary bg-background p-1">
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
												<button
													className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
													key={u.id}
													onClick={() => {
														setSelectedUserId(u.id)
														setUserSearch(
															u.username
														)
													}}
													type="button"
												>
													<span className="font-semibold">
														{u.username}
													</span>
													{u.name && (
														<span className="text-text-accent text-xs">
															({u.name})
														</span>
													)}
													<span className="text-text-accent text-xs">
														ID: {u.id}
													</span>
												</button>
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
											<p className="px-2 py-1 text-sm text-text-accent">
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
										<button
											className="text-text-accent text-xs hover:underline"
											onClick={() => {
												setSelectedUserId(null)
												setUserSearch('')
											}}
											type="button"
										>
											{t('admin.notifications.change')}
										</button>
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
							<span className="font-semibold text-sm text-text-accent">
								{t('admin.notifications.contentLabel')}
							</span>
							<textarea
								className="min-h-20 resize-none rounded-lg border-2 border-border-secondary bg-background px-3 py-2 font-semibold text-sm outline-none transition-colors focus:border-sky-400/50"
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
								isPending
							}
							loading={isPending}
							onClick={handleSend}
						>
							<Icon className="size-4" icon="lucide:send" />
							{mode === 'broadcast'
								? t('admin.notifications.sendAll')
								: t('admin.notifications.sendToUser')}
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	)
}
