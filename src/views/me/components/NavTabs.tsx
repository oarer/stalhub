'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import type { NavTabsProps } from '../../../types/me.types'
import { tabs } from '../../../types/me.types'

export default function NavTabs({
	pathname,
	unreadCount,
	onTabClick,
}: NavTabsProps) {
	return (
		<div className="flex flex-col gap-2 rounded-lg bg-background px-4 py-3">
			{tabs.map((tab) => (
				<Link
					className={cn(
						'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-all duration-500 hover:bg-accent',
						pathname === tab.href &&
							'bg-accent hover:brightness-125'
					)}
					href={tab.href}
					key={tab.title}
					onClick={onTabClick}
				>
					<Icon className="text-xl" icon={tab.icon} />
					<p className="font-semibold text-md">{tab.title}</p>
					{tab.href === '/me/notifications' &&
						unreadCount != null &&
						unreadCount > 0 && (
							<span className="ml-auto rounded-full bg-sky-500 px-1.5 py-0.5 font-semibold text-white text-xs leading-none">
								{unreadCount > 99 ? '99+' : unreadCount}
							</span>
						)}
				</Link>
			))}
		</div>
	)
}
