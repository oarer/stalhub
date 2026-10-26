'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { montserrat, unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import {
	getGroupItems,
	NAV_STRUCTURE,
	type NavItem,
} from '@/constants/nav.const'
import useSvg from '@/hooks/useSvg'
import { cn } from '@/lib/cn'
import { userQueries } from '@/queries/user/user.queries'
import { useSidebarStore } from '@/stores/useSidebar.store'
import { filterTabsByRoles, tabGroups } from '@/types/me.types'

type SidebarView = 'tools' | 'me'

function isHrefActive(pathname: string, href?: string) {
	if (!href) return false
	return (
		pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))
	)
}

function linkClass(active: boolean, collapsed: boolean) {
	return cn(
		'group flex min-h-11 w-full items-center gap-3 rounded-xl px-3 transition-colors',
		collapsed ? 'justify-center' : 'justify-center sm:justify-start',
		active
			? 'bg-primary text-primary-foreground'
			: 'text-card-foreground hover:bg-muted/70 hover:text-muted-foreground'
	)
}

function SlideLabel({
	collapsed,
	className,
	children,
}: {
	collapsed: boolean
	className?: string
	children: ReactNode
}) {
	return (
		<AnimatePresence initial={false}>
			{!collapsed && (
				<motion.div
					animate={{ opacity: 1, x: 0 }}
					className={cn('hidden sm:block', className)}
					exit={{ opacity: 0, x: -12 }}
					initial={{ opacity: 0, x: -12 }}
					key="label"
					transition={{ duration: 0.22, ease: 'easeOut' }}
				>
					{children}
				</motion.div>
			)}
		</AnimatePresence>
	)
}

function GroupHeader({
	collapsed,
	title,
	showDivider,
	className,
}: {
	collapsed: boolean
	title?: string
	showDivider: boolean
	className?: string
}) {
	return (
		<AnimatePresence initial={false}>
			{collapsed
				? showDivider && (
						<motion.div
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							initial={{ opacity: 0 }}
							key="divider"
							transition={{ duration: 0.18, ease: 'easeOut' }}
						>
							<Divider className="my-2" />
						</motion.div>
					)
				: title && (
						<motion.p
							animate={{ opacity: 1 }}
							className={className}
							exit={{ opacity: 0 }}
							initial={{ opacity: 0 }}
							key="title"
							transition={{ duration: 0.18, ease: 'easeOut' }}
						>
							{title}
						</motion.p>
					)}
		</AnimatePresence>
	)
}

function SidebarLink({
	item,
	active,
	collapsed,
}: {
	item: NavItem
	active: boolean
	collapsed: boolean
}) {
	const t = useTranslations()
	const href = item.href ?? item.submenu?.find((entry) => entry.href)?.href

	if (!href) return null

	return (
		<Link
			aria-current={active ? 'page' : undefined}
			className={linkClass(active, collapsed)}
			href={href}
			title={t(item.labelKey)}
		>
			<Icon className="size-5 shrink-0" icon={item.icon} />
			<SlideLabel
				className="truncate font-semibold text-sm"
				collapsed={collapsed}
			>
				{t(item.labelKey)}
			</SlideLabel>
		</Link>
	)
}

export default function AppSidebar() {
	const pathname = usePathname()
	const { data: user } = useQuery(userQueries.getMe())
	const { data: unreadCount } = useQuery({
		...userQueries.getUnreadCount(),
		enabled: !!user,
	})

	const t = useTranslations()
	const svgPath = useSvg()
	const collapsed = useSidebarStore((s) => s.collapsed)
	const toggle = useSidebarStore((s) => s.toggle)

	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	const isCollapsed = mounted && collapsed

	const isMeRoute = pathname === '/me' || pathname.startsWith('/me/')
	const [view, setView] = useState<SidebarView>(isMeRoute ? 'me' : 'tools')

	useEffect(() => {
		setView(isMeRoute ? 'me' : 'tools')
	}, [isMeRoute])

	const meGroups = useMemo(
		() =>
			filterTabsByRoles(tabGroups, user?.roles ?? [])
				.map((group) => ({
					...group,
					items: group.items.filter(
						(tab) => tab.href !== '/me/notifications'
					),
				}))
				.filter((group) => group.items.length > 0),
		[user?.roles]
	)

	const isNotificationsRoute = isHrefActive(pathname, '/me/notifications')

	const toolsActive = useMemo(() => {
		let active: string | null = null
		let bestLength = -1

		for (const group of NAV_STRUCTURE) {
			for (const item of getGroupItems(group)) {
				const hrefs = [
					item.href,
					...(item.submenu?.map((entry) => entry.href) ?? []),
				].filter(Boolean) as string[]

				for (const href of hrefs) {
					if (
						isHrefActive(pathname, href) &&
						href.length > bestLength
					) {
						bestLength = href.length
						active = `${group.key}:${item.key}`
					}
				}
			}
		}

		return active
	}, [pathname])

	const meActive = useMemo(() => {
		let active: string | null = null
		let bestLength = -1

		for (const group of meGroups) {
			for (const tab of group.items) {
				const matches =
					tab.href === '/me'
						? pathname === '/me'
						: isHrefActive(pathname, tab.href)

				if (matches && tab.href.length > bestLength) {
					bestLength = tab.href.length
					active = tab.href
				}
			}
		}

		return active
	}, [meGroups, pathname])

	return (
		<aside
			className={cn(
				'fixed inset-y-0 left-0 z-80 hidden w-16 flex-col gap-2 overflow-hidden border-primary/20 border-r bg-card/90 px-2 py-3 shadow-xl backdrop-blur-xl transition-[width,padding] duration-500 ease-in-out sm:flex',
				!isCollapsed && 'sm:w-72 sm:px-4'
			)}
		>
			<Link
				className="flex h-12 items-center gap-3 rounded-xl px-2 transition-opacity hover:opacity-80"
				href="/"
			>
				<Image
					alt="Stalhub"
					height={32}
					src={`${svgPath}logo.svg`}
					width={32}
				/>
				<SlideLabel
					className={`${unbounded.className} font-bold text-md tracking-widest`}
					collapsed={isCollapsed}
				>
					STALHUB
				</SlideLabel>
			</Link>

			{user ? (
				<Link
					className={cn(
						'flex items-center gap-3 rounded-xl bg-accent/50 transition-colors hover:bg-muted',
						isCollapsed
							? 'justify-center p-1'
							: 'p-2 sm:justify-start',
						isMeRoute ? 'ring-primary' : 'ring-primary/20'
					)}
					href="/me"
					title={user.name || user.username}
				>
					<Image
						alt={user.name || user.username}
						className={cn(
							'shrink-0 rounded-lg border border-primary/50 object-cover',
							isCollapsed ? 'size-8' : 'size-10'
						)}
						height={40}
						src={`${process.env.NEXT_PUBLIC_API}/api/v1/users/avatar/${user.id}`}
						unoptimized
						width={40}
					/>
					<SlideLabel className="min-w-0" collapsed={isCollapsed}>
						<p className="truncate font-semibold">
							{user.name || user.username}
						</p>
						<p
							className={`${montserrat.className} truncate font-semibold text-muted-foreground text-xs`}
						>
							@{user.username}
						</p>
					</SlideLabel>
				</Link>
			) : (
				<Link
					className={cn(
						'mb-3 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-3 font-semibold text-primary-foreground transition-opacity hover:opacity-85',
						!isCollapsed && 'sm:justify-start'
					)}
					href="/auth"
					title={t('auth.title')}
				>
					<Icon className="size-5 shrink-0" icon="lucide:log-in" />
					<SlideLabel collapsed={isCollapsed}>
						{t('auth.login')}
					</SlideLabel>
				</Link>
			)}

			{user && (
				<Link
					aria-current={isNotificationsRoute ? 'page' : undefined}
					className={cn(
						'flex min-h-11 items-center justify-center gap-3 rounded-xl px-3 transition-colors',
						!isCollapsed && 'sm:justify-start',
						isNotificationsRoute
							? 'bg-primary text-primary-foreground'
							: 'text-card-foreground hover:bg-muted/70 hover:text-muted-foreground'
					)}
					href="/me/notifications"
					title={t('me.nav.notifications')}
				>
					<span className="relative shrink-0">
						<Icon className="size-5" icon="lucide:bell" />
						{unreadCount != null && unreadCount > 0 && (
							<span
								className={cn(
									'absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-bold text-[10px] leading-none',
									isNotificationsRoute
										? 'bg-primary-foreground text-primary'
										: 'bg-primary text-primary-foreground'
								)}
							>
								{unreadCount > 99 ? '99+' : unreadCount}
							</span>
						)}
					</span>
					<SlideLabel
						className="truncate font-semibold text-sm"
						collapsed={isCollapsed}
					>
						{t('me.nav.notifications')}
					</SlideLabel>
				</Link>
			)}

			<div
				className={cn(
					'grid gap-1 rounded-xl bg-muted/40 p-1 transition-all duration-300',
					isCollapsed ? 'grid-cols-1' : 'grid-cols-2'
				)}
			>
				<Button
					aria-pressed={view === 'tools'}
					className="px-0"
					onClick={() => setView('tools')}
					title={t('landing.tools.title')}
					variant={view === 'tools' ? 'primary' : 'ghost'}
				>
					<Icon
						className="size-5 shrink-0"
						icon="lucide:layout-grid"
					/>
				</Button>
				<Button
					aria-pressed={view === 'me'}
					className="px-0"
					onClick={() => setView('me')}
					title={t('dashboard.categories.account')}
					variant={view === 'me' ? 'primary' : 'ghost'}
				>
					<Icon
						className="size-5 shrink-0"
						icon="lucide:user-round"
					/>
				</Button>
			</div>

			<nav className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pr-0 sm:pr-1">
				{view === 'tools'
					? NAV_STRUCTURE.map((group, groupIndex) => (
							<section key={group.key}>
								<GroupHeader
									className={`${unbounded.className} hidden font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.2em] sm:block`}
									collapsed={isCollapsed}
									showDivider={groupIndex > 0}
									title={
										group.titleKey
											? t(group.titleKey)
											: undefined
									}
								/>
								<div className="space-y-1">
									{getGroupItems(group).map((item) => (
										<SidebarLink
											active={
												toolsActive ===
												`${group.key}:${item.key}`
											}
											collapsed={isCollapsed}
											item={item}
											key={item.key}
										/>
									))}
								</div>
							</section>
						))
					: meGroups.map((group, index) => (
							<section
								className="flex flex-col gap-2"
								key={group.label ?? index}
							>
								<GroupHeader
									className={`${unbounded.className} hidden font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.2em] sm:block`}
									collapsed={isCollapsed}
									showDivider={index > 0}
									title={
										group.label ? t(group.label) : undefined
									}
								/>
								<div className="space-y-1">
									{group.items.map((tab) => {
										const active = meActive === tab.href

										return (
											<Link
												aria-current={
													active ? 'page' : undefined
												}
												className={linkClass(
													active,
													isCollapsed
												)}
												href={tab.href}
												key={tab.href}
												title={t(tab.title)}
											>
												<Icon
													className="size-5 shrink-0"
													icon={tab.icon}
												/>
												<SlideLabel
													className="truncate font-semibold text-sm"
													collapsed={isCollapsed}
												>
													{t(tab.title)}
												</SlideLabel>
											</Link>
										)
									})}
								</div>
							</section>
						))}
			</nav>
			<Divider className="bg-accent/80" />
			<div
				className={cn(
					'flex items-center py-2 transition-all duration-300',
					isCollapsed ? 'flex-col justify-center gap-1' : 'gap-1'
				)}
			>
				<Link
					aria-current={
						isHrefActive(pathname, '/settings') ? 'page' : undefined
					}
					className={linkClass(
						isHrefActive(pathname, '/settings'),
						isCollapsed
					)}
					href="/settings"
					title={t('nav.settings')}
				>
					<Icon className="size-5 shrink-0" icon="lucide:settings" />
					<SlideLabel
						className="truncate font-semibold text-sm"
						collapsed={isCollapsed}
					>
						{t('nav.settings')}
					</SlideLabel>
				</Link>
				<Button
					aria-label={t(isCollapsed ? 'nav.expand' : 'nav.collapse')}
					aria-pressed={!isCollapsed}
					className={cn(
						'hidden min-h-11 items-center justify-center rounded-xl transition-colors sm:flex',
						isCollapsed ? 'w-full px-0' : 'shrink-0 gap-3 px-3'
					)}
					onClick={toggle}
					title={t(isCollapsed ? 'nav.expand' : 'nav.collapse')}
					type="button"
					variant="ghost"
				>
					<motion.span
						animate={{ rotate: isCollapsed ? 180 : 0 }}
						className="inline-flex"
						transition={{
							type: 'spring',
							stiffness: 260,
							damping: 20,
						}}
					>
						<Icon
							className="size-5 shrink-0"
							icon={
								isCollapsed
									? 'lucide:panel-left-open'
									: 'lucide:panel-left-close'
							}
						/>
					</motion.span>
				</Button>
			</div>
		</aside>
	)
}
