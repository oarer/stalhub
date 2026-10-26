'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion, useDragControls } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import {
	getGroupItems,
	NAV_STRUCTURE,
	type NavItem,
} from '@/constants/nav.const'
import { cn } from '@/lib/cn'
import { userQueries } from '@/queries/user/user.queries'
import { filterTabsByRoles, tabGroups } from '@/types/me.types'

function isHrefActive(pathname: string, href?: string) {
	if (!href) return false
	return (
		pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))
	)
}

function SheetRow({
	icon,
	href,
	label,
	depth,
	onNavigate,
	active,
}: {
	icon: string
	href?: string
	label: string
	depth: number
	onNavigate: () => void
	active: boolean
}) {
	return (
		<Link
			aria-current={active ? 'page' : undefined}
			className={cn(
				'flex min-h-11 w-full items-center gap-3 rounded-xl px-3 transition-colors',
				active
					? 'bg-primary text-primary-foreground'
					: 'text-card-foreground hover:bg-muted/70',
				depth > 0 && 'pl-9'
			)}
			href={href ?? '#'}
			onClick={onNavigate}
		>
			<Icon className="size-5 shrink-0" icon={icon} />
			<span className="truncate font-semibold text-sm">{label}</span>
		</Link>
	)
}

function SheetSubmenu({
	item,
	depth,
	pathname,
	onNavigate,
}: {
	item: NavItem
	depth: number
	pathname: string
	onNavigate: () => void
}) {
	const t = useTranslations()
	const href = item.href ?? item.submenu?.find((entry) => entry.href)?.href

	return (
		<>
			<SheetRow
				active={isHrefActive(pathname, href)}
				depth={depth}
				href={href}
				icon={item.icon}
				label={t(item.labelKey)}
				onNavigate={onNavigate}
			/>
			{item.submenu?.map((sub) => (
				<SheetSubmenu
					depth={depth + 1}
					item={sub}
					key={sub.key}
					onNavigate={onNavigate}
					pathname={pathname}
				/>
			))}
		</>
	)
}

export default function MobileNavbar() {
	const pathname = usePathname()
	const t = useTranslations()
	const { data: user } = useQuery(userQueries.getMe())
	const [sheetOpen, setSheetOpen] = useState(false)
	const dragControls = useDragControls()

	useEffect(() => {
		if (!sheetOpen) return
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setSheetOpen(false)
		}
		window.addEventListener('keydown', onKey)
		return () => {
			document.body.style.overflow = prev
			window.removeEventListener('keydown', onKey)
		}
	}, [sheetOpen])

	const meGroups = useMemo(
		() =>
			filterTabsByRoles(tabGroups, user?.roles ?? []).filter(
				(group) => group.items.length > 0
			),
		[user?.roles]
	)

	const tabs = [
		{
			key: 'home',
			href: '/',
			icon: 'lucide:house',
			label: t('nav.home'),
		},
		{
			key: 'builds',
			href: '/calcs/builds/lite',
			icon: 'lucide:box',
			label: t('nav.groups.creative.items.builds.label'),
		},
		{
			key: 'ttk',
			href: '/calcs/ttk',
			icon: 'lucide:timer-reset',
			label: t('nav.groups.calculators.items.ttk.label'),
		},
		{
			key: 'profile',
			href: user ? '/me' : '/auth',
			icon: user ? 'lucide:user-round' : 'lucide:log-in',
			label: user ? t('me.nav.home') : t('auth.login'),
		},
	]
	const moreActive = !tabs.some((tab) => isHrefActive(pathname, tab.href))
	const isMeRoute = pathname === '/me' || pathname.startsWith('/me/')

	return (
		<>
			<nav
				aria-label={t('me.menu')}
				className="fixed inset-x-0 bottom-0 z-1000 border-primary/20 border-t bg-card/95 backdrop-blur-xl sm:hidden"
			>
				<div className="grid grid-cols-5 pb-[env(safe-area-inset-bottom,0px)]">
					{tabs.map((tab) => {
						const active = isHrefActive(pathname, tab.href)
						return (
							<Link
								aria-current={active ? 'page' : undefined}
								className={cn(
									'flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 transition-colors',
									active
										? 'text-primary'
										: 'text-muted-foreground'
								)}
								href={tab.href}
								key={tab.key}
							>
								<Icon
									className="size-6 shrink-0"
									icon={tab.icon}
								/>
								<span className="max-w-full truncate font-semibold text-[10px] leading-none">
									{tab.label}
								</span>
							</Link>
						)
					})}
					<button
						aria-expanded={sheetOpen}
						className={cn(
							'flex min-h-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 transition-colors',
							moreActive || sheetOpen
								? 'text-primary'
								: 'text-muted-foreground'
						)}
						onClick={() => setSheetOpen(true)}
						type="button"
					>
						<Icon
							className="size-6 shrink-0"
							icon="lucide:more-horizontal"
						/>
						<span className="max-w-full truncate font-semibold text-[10px] leading-none">
							{t('me.menu')}
						</span>
					</button>
				</div>
			</nav>

			<AnimatePresence>
				{sheetOpen && (
					<>
						<motion.button
							animate={{ opacity: 1 }}
							aria-label={t('me.menu')}
							className="fixed inset-0 z-1100 cursor-default bg-black/60 sm:hidden"
							exit={{ opacity: 0 }}
							initial={{ opacity: 0 }}
							onClick={() => setSheetOpen(false)}
							transition={{ duration: 0.2 }}
							type="button"
						/>
						<motion.div
							animate={{ y: 0 }}
							className="fixed inset-x-0 bottom-0 z-1100 flex max-h-[75dvh] flex-col rounded-t-2xl border-primary/20 border-t bg-card sm:hidden"
							drag="y"
							dragConstraints={{ top: 0 }}
							dragControls={dragControls}
							dragElastic={{ top: 0, bottom: 0.5 }}
							dragListener={false}
							exit={{ y: '100%' }}
							initial={{ y: '100%' }}
							onDragEnd={(_, info) => {
								if (
									info.offset.y > 90 ||
									info.velocity.y > 500
								) {
									setSheetOpen(false)
								}
							}}
							role="dialog"
							transition={{
								type: 'spring',
								stiffness: 380,
								damping: 38,
							}}
						>
							<div
								className="cursor-grab touch-none select-none active:cursor-grabbing"
								onPointerDown={(event) =>
									dragControls.start(event)
								}
							>
								<div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted-foreground/40" />
								<div className="flex items-center justify-between px-4 pt-1 pb-1">
									<p className="font-semibold text-sm">
										{t('me.menu')}
									</p>
									<button
										aria-label={t('me.menu')}
										className="flex size-9 cursor-pointer items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/70"
										onClick={() => setSheetOpen(false)}
										type="button"
									>
										<Icon
											className="size-5"
											icon="lucide:x"
										/>
									</button>
								</div>
							</div>
							<div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
								{isMeRoute ? (
									user &&
									meGroups.map((group, groupIndex) => (
										<section
											className="flex flex-col gap-1"
											key={group.label ?? groupIndex}
										>
											{group.label && (
												<p className="px-3 pt-1 font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
													{t(group.label)}
												</p>
											)}
											{group.items.map((tab) => (
												<SheetRow
													active={isHrefActive(
														pathname,
														tab.href
													)}
													depth={0}
													href={tab.href}
													icon={tab.icon}
													key={tab.href}
													label={t(tab.title)}
													onNavigate={() =>
														setSheetOpen(false)
													}
												/>
											))}
										</section>
									))
								) : (
									NAV_STRUCTURE.map((group) => (
										<section
											className="flex flex-col gap-1"
											key={group.key}
										>
											<p className="px-3 pt-1 font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
												{t(group.titleKey)}
											</p>
											{getGroupItems(group).map((item) => (
												<SheetSubmenu
													depth={0}
													item={item}
													key={item.key}
													onNavigate={() =>
														setSheetOpen(false)
													}
													pathname={pathname}
												/>
											))}
										</section>
									))
								)}
								<Link
									aria-current={
										isHrefActive(pathname, '/settings')
											? 'page'
											: undefined
									}
									className={cn(
										'flex min-h-11 w-full items-center gap-3 rounded-xl px-3 transition-colors',
										isHrefActive(pathname, '/settings')
											? 'bg-primary text-primary-foreground'
											: 'text-card-foreground hover:bg-muted/70'
									)}
									href="/settings"
									onClick={() => setSheetOpen(false)}
								>
									<Icon
										className="size-5 shrink-0"
										icon="lucide:settings"
									/>
									<span className="truncate font-semibold text-sm">
										{t('nav.settings')}
									</span>
								</Link>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	)
}
