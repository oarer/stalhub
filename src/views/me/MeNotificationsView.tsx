'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/date'
import { getQueryClient } from '@/providers/QueryProvider'
import { userQueries } from '@/queries/user/user.queries'
import { userService } from '@/services/user/user.service'

const NOTIFICATION_ICONS: Record<number, { icon: string; color: string }> = {
	0: { icon: 'lucide:info', color: 'text-sky-400' },
	1: { icon: 'lucide:alert-triangle', color: 'text-yellow-400' },
	2: { icon: 'lucide:alert-circle', color: 'text-red-400' },
}

export default function MeNotificationsView() {
	const queryClient = getQueryClient()
	const [page, setPage] = useState(1)

	const { data } = useSuspenseQuery(
		userQueries.getNotifications({ take: 20, page })
	)

	const markReadMutation = useMutation({
		mutationFn: (id: number) => userService.markRead(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['user', 'notifications'],
			})
			queryClient.invalidateQueries({
				queryKey: ['user', 'notifications', 'unread'],
			})
		},
	})

	const markAllReadMutation = useMutation({
		mutationFn: () => userService.markAllRead(),
		onSuccess: () => {
			toast.success('Все уведомления прочитаны')
			queryClient.invalidateQueries({
				queryKey: ['user', 'notifications'],
			})
			queryClient.invalidateQueries({
				queryKey: ['user', 'notifications', 'unread'],
			})
		},
	})

	const deleteMutation = useMutation({
		mutationFn: (id: number) => userService.deleteNotification(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['user', 'notifications'],
			})
			queryClient.invalidateQueries({
				queryKey: ['user', 'notifications', 'unread'],
			})
		},
	})

	const notifications = data?.data ?? []
	const totalPages = data ? Math.ceil(data.total / 20) : 1

	const handleNotificationClick = (id: number, link: string | null) => {
		if (!notifications.find((n) => n.id === id)?.read) {
			markReadMutation.mutate(id)
		}
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<h1 className="font-semibold text-xl">Уведомления</h1>
				{notifications.some((n) => !n.read) && (
					<Button
						loading={markAllReadMutation.isPending}
						onClick={() => markAllReadMutation.mutate()}
						size="sm"
						variant="ghost"
					>
						<Icon className="size-4" icon="lucide:check-check" />
						Прочитать все
					</Button>
				)}
			</div>

			{notifications.length === 0 ? (
				<p className="py-8 text-center font-semibold text-sm text-text-accent">
					Нет уведомлений
				</p>
			) : (
				<div className="flex flex-col gap-1">
					{notifications.map((notification) => {
						const style =
							NOTIFICATION_ICONS[notification.type] ??
							NOTIFICATION_ICONS[0]

						const content = (
							<div
								className={`flex items-start gap-3 rounded-lg border border-border-secondary px-3 py-2.5 transition-colors ${
									!notification.read
										? 'bg-sky-500/5'
										: 'bg-background'
								} ${notification.link ? 'cursor-pointer hover:bg-accent' : ''}`}
								onClick={() =>
									handleNotificationClick(
										notification.id,
										notification.link
									)
								}
							>
								<div className={`mt-0.5 ${style.color}`}>
									<Icon
										className="size-4"
										icon={style.icon}
									/>
								</div>
								<div className="min-w-0 flex-1 gap-2">
									<div className="flex items-center gap-2">
										<p className="font-semibold text-lg">
											{notification.title}
										</p>
										{!notification.read && (
											<span className="size-1.5 rounded-full bg-sky-400" />
										)}
									</div>
									<p className="font-semibold text-sm">
										{notification.content}
									</p>
									<p
										className={`${montserrat.className} mt-1 flex items-center gap-2 font-semibold text-[11px] text-text-accent`}
									>
										<span>{notification.author}</span>
										<span>·</span>
										<span>
											{formatDate(
												notification.created_at,
												'datetime'
											)}
										</span>
									</p>
								</div>
								<button
									className="flex shrink-0 items-center justify-center rounded p-1 text-neutral-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
									onClick={(e) => {
										e.stopPropagation()
										deleteMutation.mutate(notification.id)
									}}
								>
									<Icon
										className="size-3.5"
										icon="lucide:x"
									/>
								</button>
							</div>
						)

						if (notification.link) {
							return (
								<Link
									href={notification.link}
									key={notification.id}
								>
									{content}
								</Link>
							)
						}

						return <div key={notification.id}>{content}</div>
					})}
				</div>
			)}

			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-2">
					<Button
						disabled={page <= 1}
						onClick={() => setPage((p) => p - 1)}
						size="sm"
						variant="outline"
					>
						<Icon icon="lucide:chevron-left" />
					</Button>
					<span className="text-neutral-400 text-sm">
						{page} / {totalPages}
					</span>
					<Button
						disabled={page >= totalPages}
						onClick={() => setPage((p) => p + 1)}
						size="sm"
						variant="outline"
					>
						<Icon icon="lucide:chevron-right" />
					</Button>
				</div>
			)}
		</div>
	)
}
