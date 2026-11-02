'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { unbounded } from '@/app/fonts'
import { Divider } from '@/components/ui/Divider'
import { cn } from '@/lib/cn'
import { commissionQueries } from '@/queries/commission/commission.queries'
import { useAuthStore } from '@/stores/useAuth.store'
import type { NavTabsProps } from '@/types/me.types'
import { filterTabsByRoles, tabGroups } from '@/types/me.types'

export default function NavTabs({
	pathname,
	unreadCount,
	roles,
	onTabClick,
}: NavTabsProps) {
	const t = useTranslations()
	const user = useAuthStore((s) => s.user?.id)
	const { data: capabilities } = useQuery(
		commissionQueries.capabilities(user)
	)
	const groups = filterTabsByRoles(tabGroups, roles, capabilities)
	const hrefs = groups.flatMap((group) =>
		group.items.map((item) => item.href)
	)
	return (
		<div className="flex flex-col rounded-lg bg-card px-4 py-3">
			{groups.map((group, gi) => (
				<div key={group.label ?? group.items[0]?.href}>
					{gi > 0 && <Divider className="my-2" />}
					{group.label && (
						<p
							className={`${unbounded.className} mb-1 px-2 font-body text-[12px] text-muted-foreground uppercase`}
						>
							{t(group.label)}
						</p>
					)}
					<div className="flex flex-col gap-1">
						{group.items.map((tab) => {
							const isActive =
								tab.href === '/me'
									? pathname === '/me'
									: pathname.startsWith(tab.href) &&
										!hrefs.some(
											(href) =>
												href !== tab.href &&
												href.length > tab.href.length &&
												href.startsWith(tab.href) &&
												pathname.startsWith(href)
										)
							return (
								<Link
									className={cn(
										'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-all duration-500 hover:bg-accent',
										isActive &&
											'bg-accent hover:brightness-125'
									)}
									href={tab.href}
									key={tab.href}
									onClick={onTabClick}
								>
									<Icon className="text-xl" icon={tab.icon} />
									<p
										className={`${unbounded.className} font-body text-xs`}
									>
										{t(tab.title)}
									</p>
									{tab.href === '/me/notifications' &&
										unreadCount != null &&
										unreadCount > 0 && (
											<span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 font-semibold text-primary-foreground text-xs leading-none">
												{unreadCount > 99
													? '99+'
													: unreadCount}
											</span>
										)}
								</Link>
							)
						})}
					</div>
				</div>
			))}
		</div>
	)
}
