'use client'

import { Icon } from '@iconify/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { montserrat } from '@/app/fonts'
import { CLink } from '@/components/ui/Link'
import useClickOutside from '@/hooks/useClickOutside'
import { formatDate } from '@/lib/date'
import { getQueryClient } from '@/providers/QueryProvider'
import { userQueries } from '@/queries/user/user.queries'
import { userService } from '@/services/user/user.service'

const NOTIFICATION_ICONS: Record<number, { icon: string; color: string }> = {
	0: { icon: 'lucide:info', color: 'text-info' },
	1: { icon: 'lucide:alert-triangle', color: 'text-warning' },
	2: { icon: 'lucide:alert-circle', color: 'text-destructive' },
}

export default function NavMe() {
	const { data: user } = useQuery(userQueries.getMe())
	const t = useTranslations()

	const { data: unreadCount } = useQuery({
		...userQueries.getUnreadCount(),
		enabled: !!user,
	})

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

	const notifications = notifData?.data ?? []

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
					{unreadCount != null && unreadCount > 0 && (
						<span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary font-bold text-[10px] text-primary-foreground leading-none">
							{unreadCount > 99 ? '99+' : unreadCount}
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

			{/*TODO под рефакторинг */}
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
							{notifications.length === 0 ? (
								<p className="px-4 py-6 text-center font-semibold text-muted-foreground text-sm">
									{t('me.notifications.empty')}
								</p>
							) : (
								notifications.map((n) => {
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
												<p className="font-semibold text-text-accent text-xs">
													{n.content}
												</p>
												<span
													className={`${montserrat.className} font-semibold text-[10px] text-muted-foreground`}
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
								})
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<CLink href="/me" variant={'none'}>
				<Image
					alt={user.name || 'avatar'}
					className="rounded-lg border-2 border-primary/60 transition-all duration-300 hover:scale-110 active:scale-95"
					height={46}
					src={`${process.env.NEXT_PUBLIC_API}/api/v1/users/avatar/${user.id}`}
					unoptimized
					width={46}
				/>
			</CLink>
		</div>
	) : (
		<CLink
			className="gap-2 rounded-xl p-2.5"
			href="/auth"
			variant="primary"
		>
			<Icon className="text-xl" icon="lucide:log-in" />
			<p
				className={`${montserrat.className} hidden font-semibold text-md md:block`}
			>
				{t('auth.title')}
			</p>
		</CLink>
	)
}
