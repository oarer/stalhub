'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { formatDate } from '@/lib/date'
import type { Notification } from '@/types/user.type'

const NOTIFICATION_ICONS: Record<number, { icon: string; color: string }> = {
	0: { icon: 'lucide:info', color: 'text-primary' },
	1: { icon: 'lucide:alert-triangle', color: 'text-warning' },
	2: { icon: 'lucide:alert-circle', color: 'text-destructive' },
}

export function NotificationItem({
	notification,
	onClick,
	onDelete,
}: {
	notification: Notification
	onClick: () => void
	onDelete: () => void
}) {
	const style = NOTIFICATION_ICONS[notification.type] ?? NOTIFICATION_ICONS[0]

	const content = (
		<div
			className={`border-primary/50 flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
				!notification.read ? 'bg-primary/5' : 'bg-card'
			} ${notification.link ? 'hover:bg-accent cursor-pointer' : ''}`}
			onClick={onClick}
		>
			<div className={`mt-0.5 ${style.color}`}>
				<Icon className="size-4" icon={style.icon} />
			</div>
			<div className="min-w-0 flex-1 gap-2">
				<div className="flex items-center gap-2">
					<p className="text-lg font-semibold">
						{notification.title}
					</p>
					{!notification.read && (
						<span className="bg-primary size-1.5 rounded-full" />
					)}
				</div>
				<p className="text-sm font-semibold">{notification.content}</p>
				<p
					className={`text-foreground mt-1 flex items-center gap-2 font-mono text-[11px] font-semibold`}
				>
					<span>{notification.author}</span>
					<span>·</span>
					<span>
						{formatDate(notification.created_at, 'datetime')}
					</span>
				</p>
			</div>
			<button
				className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex shrink-0 items-center justify-center rounded p-1 transition-colors"
				onClick={(e) => {
					e.stopPropagation()
					onDelete()
				}}
			>
				<Icon className="size-3.5" icon="lucide:x" />
			</button>
		</div>
	)

	if (notification.link) {
		return <Link href={notification.link}>{content}</Link>
	}

	return content
}
