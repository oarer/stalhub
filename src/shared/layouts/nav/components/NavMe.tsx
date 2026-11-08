'use client'

import { Icon } from '@iconify/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { mtsWide } from '@/app/fonts'
import { HoverCard } from '@/components/ui/HoverCard'
import { CLink } from '@/components/ui/Link'
import Avatar from '@/components/ui/user/Avatar'
import useClickOutside from '@/hooks/useClickOutside'
import { formatDate } from '@/lib/date'
import { getSafeHref, isExternalHref } from '@/lib/safe-href'
import { getQueryClient } from '@/providers/QueryProvider'
import { globalNotificationQueries } from '@/queries/global-notification/global-notification.queries'
import { userQueries } from '@/queries/user/user.queries'
import { userService } from '@/services/user/user.service'
import type {
	GlobalNotification,
	GlobalNotificationContent,
} from '@/types/global-notification.type'

const NOTIFICATION_ICONS: Record<number, { icon: string; color: string }> = {
	0: { icon: 'lucide:info', color: 'text-info' },
	1: { icon: 'lucide:alert-triangle', color: 'text-warning' },
	2: { icon: 'lucide:alert-circle', color: 'text-destructive' },
}

const GLOBAL_NOTIFICATION_ICONS: Record<
	GlobalNotification['type'],
	{ icon: string; color: string }
> = {
	info: { icon: 'lucide:info', color: 'text-info' },
	warning: { icon: 'lucide:alert-triangle', color: 'text-warning' },
	danger: { icon: 'lucide:alert-circle', color: 'text-destructive' },
}

function isGlobalNotificationVisible(
	notification: GlobalNotification,
	now = Date.now()
) {
	const startsAt = Date.parse(notification.starts_at)
	const expiresAt = notification.expires_at
		? Date.parse(notification.expires_at)
		: Number.POSITIVE_INFINITY

	return (
		notification.is_active &&
		Number.isFinite(startsAt) &&
		startsAt <= now &&
		expiresAt > now
	)
}

function GlobalNotificationContent({
	content,
}: {
	content: GlobalNotificationContent[]
}) {
	return (
		<span className="whitespace-pre-wrap">
			{content.map((part, index) => {
				if (part.type === 'text') {
					return (
						<span key={`${part.type}-${index}`}>{part.text}</span>
					)
				}

				const href = getSafeHref(part.href)
				if (!href) {
					return (
						<span key={`${part.type}-${index}`}>{part.text}</span>
					)
				}

				const external = isExternalHref(href)
				return (
					<a
						className="text-primary underline underline-offset-2"
						href={href}
						key={`${part.type}-${index}`}
						rel={external ? 'noopener noreferrer' : undefined}
						target={external ? '_blank' : undefined}
					>
						{part.text}
					</a>
				)
			})}
		</span>
	)
}

function GlobalNotificationItem({
	notification,
}: {
	notification: GlobalNotification
}) {
	const t = useTranslations()
	const style = GLOBAL_NOTIFICATION_ICONS[notification.type]

	return (
		<div className="flex items-start gap-2.5 border-primary-foreground border-b bg-primary/5 px-3 py-2.5 last:rounded-b-xl last:border-b-0">
			<div className={`mt-1 shrink-0 ${style.color}`}>
				<Icon className="size-4" icon={style.icon} />
			</div>
			<div className="min-w-0">
				<div className="flex items-center gap-1.5">
					<p className="truncate font-bold text-[14px]">
						{notification.title}
					</p>
					<span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 font-semibold text-[10px] text-primary">
						{t('me.notifications.global')}
					</span>
				</div>
				<p className="font-semibold text-foreground text-xs">
					<GlobalNotificationContent content={notification.content} />
				</p>
				<span className="font-mono font-semibold text-[10px] text-muted-foreground">
					{formatDate(notification.starts_at, 'datetime')}
				</span>
			</div>
		</div>
	)
}

function GuestNotifications({
	notifications,
}: {
	notifications: GlobalNotification[]
}) {
	const t = useTranslations()
	const [open, setOpen] = useState(false)
	const menuRef = useRef(null)

	useClickOutside(menuRef, () => setOpen(false))
	const hasNotifications = notifications.length > 0

	return (
		<div className="relative" ref={menuRef}>
			<button
				aria-expanded={open}
				aria-label={t('me.notifications.title')}
				className="relative flex cursor-pointer items-center justify-center rounded-full p-5 opacity-70 duration-500 hover:bg-muted/60 hover:opacity-100 active:opacity-50"
				onClick={() => setOpen((value) => !value)}
				type="button"
			>
				<Icon className="text-2xl" icon="lucide:bell" />
				{notifications.length > 0 && (
					<span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary font-bold text-[10px] text-primary-foreground leading-none">
						{notifications.length > 99
							? '99+'
							: notifications.length}
					</span>
				)}
			</button>
			<AnimatePresence>
				{open && (
					<motion.div
						animate={{ opacity: 1 }}
						className="absolute top-12 right-0 z-20 flex w-80 origin-top-right flex-col rounded-2xl border-2 border-primary/40 bg-card/95 shadow-lg backdrop-blur-lg"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						transition={{ duration: 0.2, ease: 'easeOut' }}
					>
						<div className="border-primary/40 border-b px-4 py-3">
							<span className="font-semibold text-sm">
								{t('me.notifications.title')}
							</span>
						</div>
						<div className="max-h-80 overflow-y-auto">
							{!hasNotifications ? (
								<p className="px-4 py-6 text-center font-semibold text-muted-foreground text-sm">
									{t('me.notifications.empty')}
								</p>
							) : (
								notifications.map((notification) => (
									<GlobalNotificationItem
										key={notification.id}
										notification={notification}
									/>
								))
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export default function NavMe() {
	const { data: user } = useQuery(userQueries.getMe())
	const t = useTranslations()
	const router = useRouter()

	const { data: unreadCount } = useQuery({
		...userQueries.getUnreadCount(),
		enabled: !!user,
	})

	const { data: globalNotifications = [] } = useQuery(
		globalNotificationQueries.list()
	)

	const [open, setOpen] = useState(false)
	const menuRef = useRef(null)

	const queryClient = getQueryClient()

	useClickOutside(menuRef, () => setOpen(false))

	const { data: notifData } = useQuery({
		...userQueries.getNotifications({ take: 10 }),
		enabled: !!user && open,
	})

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

	const logoutMutation = useMutation({
		mutationFn: () => userService.deleteAllSessions(),
		onSuccess: () => {
			queryClient.clear()
			router.push('/auth')
		},
	})

	const notifications = notifData?.data ?? []
	const visibleGlobalNotifications = globalNotifications.filter(
		(notification) => isGlobalNotificationVisible(notification)
	)
	const notificationCount =
		(unreadCount ?? 0) + visibleGlobalNotifications.length
	const hasNotifications =
		notifications.length > 0 || visibleGlobalNotifications.length > 0

	return user ? (
		<div className="relative flex items-center gap-2" ref={menuRef}>
			<button
				className="relative flex cursor-pointer items-center justify-center rounded-full p-5 opacity-70 duration-500 hover:bg-muted/60 hover:opacity-100 active:opacity-50"
				onClick={() => setOpen(!open)}
			>
				<div
					className={`absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 ${
						open ? 'opacity-0' : 'opacity-100'
					}`}
				>
					<Icon className="text-2xl" icon="lucide:bell" />
					{notificationCount > 0 && (
						<span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary font-bold text-[10px] text-primary-foreground leading-none">
							{notificationCount > 99 ? '99+' : notificationCount}
						</span>
					)}
				</div>
				<div
					className={`absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 ${
						open ? 'opacity-100' : 'opacity-0'
					}`}
				>
					<Icon className="text-3xl" icon="material-symbols:close" />
				</div>
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						animate={{ opacity: 1 }}
						className="absolute top-12 right-0 z-20 flex w-80 origin-top-right flex-col rounded-2xl border-2 border-primary/40 bg-card/95 shadow-lg backdrop-blur-lg"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						transition={{ duration: 0.2, ease: 'easeOut' }}
					>
						<div className="flex items-center justify-between border-primary/40 border-b px-4 py-3">
							<span className="font-semibold text-sm">
								{t('me.nav.notifications')}
							</span>
							<Link
								className="font-bold text-primary/90 text-xs hover:underline"
								href="/me/notifications"
								onClick={() => setOpen(false)}
							>
								{t('me.articles.all')}
							</Link>
						</div>

						<div className="max-h-80 overflow-y-auto">
							{!hasNotifications ? (
								<p className="px-4 py-6 text-center font-semibold text-muted-foreground text-sm">
									{t('me.notifications.empty')}
								</p>
							) : (
								<>
									{visibleGlobalNotifications.map(
										(notification) => (
											<GlobalNotificationItem
												key={`global-${notification.id}`}
												notification={notification}
											/>
										)
									)}
									{notifications.map((n) => {
										const style =
											NOTIFICATION_ICONS[n.type] ??
											NOTIFICATION_ICONS[0]
										const handleClick = () => {
											if (!n.read)
												markReadMutation.mutate(n.id)
											setOpen(false)
										}

										const inner = (
											<>
												<div
													className={`mt-1 shrink-0 ${style.color}`}
												>
													<Icon
														className="size-4"
														icon={style.icon}
													/>
												</div>
												<div className="min-w-0">
													<div className="flex items-center gap-1.5">
														<p className="truncate font-bold text-[14px]">
															{n.title}
														</p>
														{!n.read && (
															<span className="size-1.5 shrink-0 rounded-full bg-primary" />
														)}
													</div>
													<p className="font-semibold text-foreground text-xs">
														{n.content}
													</p>
													<span
														className={`font-mono font-semibold text-[10px] text-muted-foreground`}
													>
														{formatDate(
															n.created_at,
															'datetime'
														)}
													</span>
												</div>
											</>
										)

										const className = `flex items-start gap-2.5 border-primary-foreground border-b px-3 py-2.5 transition-colors last:border-b-0 last:rounded-b-xl ${
											!n.read ? 'bg-sky-500/5' : ''
										} ${n.link ? 'hover:bg-primary/40 cursor-pointer' : ''}`

										if (n.link) {
											return (
												<Link
													className={className}
													href={n.link}
													key={n.id}
													onClick={handleClick}
												>
													{inner}
												</Link>
											)
										}

										return (
											<div
												className={className}
												key={n.id}
												onClick={handleClick}
											>
												{inner}
											</div>
										)
									})}
								</>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<HoverCard.Root closeDelay={150} openDelay={150}>
				<HoverCard.Trigger asChild>
					<CLink href="/me" variant={'none'}>
						<Avatar
							className="rounded-lg border-2 border-primary/60 transition-all duration-300 hover:scale-110 active:scale-95"
							height={46}
							id={user.id}
							username={user.username}
							width={46}
						/>
					</CLink>
				</HoverCard.Trigger>
				<HoverCard.Content
					align="end"
					className="z-999 w-64 p-2"
					side="bottom"
				>
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2 rounded-lg bg-accent/40 px-3 py-2">
							<Avatar
								height={32}
								id={user.id}
								username={user.username}
								width={32}
							/>
							<p className="truncate font-semibold text-sm">
								{user.username}
							</p>
						</div>
						<NavMeQuickLink
							href="/me/analytics"
							icon="lucide:bar-chart-3"
							label={t('me.nav.analytics')}
						/>
						<NavMeQuickLink
							href="/me/clan"
							icon="lucide:users"
							label={t('me.nav.clan')}
						/>
						<NavMeQuickLink
							href="/me"
							icon="lucide:user-round"
							label={t('nav.userMenu.profile')}
						/>
						<button
							className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left font-semibold text-destructive text-sm transition-colors hover:bg-destructive/10"
							disabled={logoutMutation.isPending}
							onClick={() => logoutMutation.mutate()}
							type="button"
						>
							<Icon className="text-lg" icon="lucide:log-out" />
							{t('nav.userMenu.logout')}
						</button>
					</div>
				</HoverCard.Content>
			</HoverCard.Root>
		</div>
	) : (
		<div className="flex items-center gap-2">
			<GuestNotifications notifications={visibleGlobalNotifications} />
			<CLink
				className="gap-2 rounded-xl p-2.5"
				href="/auth"
				variant="primary"
			>
				<Icon className="text-xl" icon="lucide:log-in" />
				<p
					className={`${mtsWide.className} hidden font-medium text-md md:block`}
				>
					{t('auth.title')}
				</p>
			</CLink>
		</div>
	)
}

function NavMeQuickLink({
	href,
	icon,
	label,
}: {
	href: string
	icon: string
	label: string
}) {
	return (
		<Link
			className="flex items-center gap-3 rounded-lg px-3 py-2 font-semibold text-sm transition-colors hover:bg-accent"
			href={href}
		>
			<Icon className="text-lg text-muted-foreground" icon={icon} />
			{label}
		</Link>
	)
}
