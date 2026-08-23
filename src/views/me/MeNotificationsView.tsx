'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { userQueries } from '@/queries/user/user.queries'
import { userService } from '@/services/user/user.service'
import { NotificationItem } from './components/NotificationItem'

const NOTIFICATIONS_PER_PAGE = 20

export default function MeNotificationsView() {
	const queryClient = getQueryClient()
	const t = useTranslations()
	const [page, setPage] = useState(1)

	const { data } = useSuspenseQuery(
		userQueries.getNotifications({
			take: NOTIFICATIONS_PER_PAGE,
			page,
		})
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
			toast.success(t('me.notifications.toastAllRead'))
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
	const totalPages = data ? Math.ceil(data.total_count / NOTIFICATIONS_PER_PAGE) : 1

	const handleNotificationClick = (id: number) => {
		if (!notifications.find((n) => n.id === id)?.read) {
			markReadMutation.mutate(id)
		}
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<h1 className="font-semibold text-xl">
					{t('me.notifications.title')}
				</h1>
				{notifications.some((n) => !n.read) && (
					<Button
						loading={markAllReadMutation.isPending}
						onClick={() => markAllReadMutation.mutate()}
						size="sm"
						variant="ghost"
					>
						<Icon className="size-4" icon="lucide:check-check" />
						{t('me.notifications.markAllRead')}
					</Button>
				)}
			</div>

			{notifications.length === 0 ? (
				<p className="py-8 text-center font-semibold text-sm text-text-accent">
					{t('me.notifications.empty')}
				</p>
			) : (
				<div className="flex flex-col gap-1">
					{notifications.map((notification) => (
						<NotificationItem
							key={notification.id}
							notification={notification}
							onClick={() =>
								handleNotificationClick(notification.id)
							}
							onDelete={() =>
								deleteMutation.mutate(notification.id)
							}
						/>
					))}
				</div>
			)}

			<Pagination
				onPageChange={setPage}
				page={page}
				totalPages={totalPages}
			/>
		</div>
	)
}
