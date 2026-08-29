'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Divider } from '@/components/ui/Divider'
import { cn } from '@/lib/cn'
import type { NavTabsProps } from '@/types/me.types'
import { filterTabsByRoles, tabGroups } from '@/types/me.types'

export default function NavTabs({
	pathname,
	unreadCount,
	roles,
	onTabClick,
}: NavTabsProps) {
	const t = useTranslations()
	return (
		<div className="flex max-h-120 flex-col overflow-y-scroll rounded-lg bg-card px-4 py-3">
			{filterTabsByRoles(tabGroups, roles).map((group, gi) => (
				<div key={gi}>
					{gi > 0 && <Divider className="my-2" />}
					{group.label && (
						<p className="mb-1 px-2 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
							{t(group.label)}
						</p>
					)}
					<div className="flex flex-col gap-1">
						{group.items.map((tab) => {
							const isActive =
								tab.href === '/me'
									? pathname === '/me'
									: pathname.startsWith(tab.href)
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
									<p className="font-semibold text-sm">
										{t(tab.title)}
									</p>
									{tab.href === '/me/notifications' &&
										unreadCount != null &&
										unreadCount > 0 && (
											<span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 font-semibold text-white text-xs leading-none">
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
