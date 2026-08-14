'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/cn'

const tabs = [
	{
		title: 'admin.sidebar.users',
		href: '/admin/users',
		icon: 'lucide:users',
	},
	{
		title: 'admin.sidebar.roles',
		href: '/admin/roles',
		icon: 'lucide:shield',
	},
	{
		title: 'admin.sidebar.permissions',
		href: '/admin/permissions',
		icon: 'lucide:key',
	},
	{
		title: 'admin.sidebar.badges',
		href: '/admin/badges',
		icon: 'lucide:award',
	},
	{
		title: 'admin.sidebar.notifications',
		href: '/admin/notifications',
		icon: 'lucide:bell',
	},
	{
		title: 'admin.sidebar.players',
		href: '/admin/players',
		icon: 'lucide:gamepad-2',
	},
	{
		title: 'admin.sidebar.articles',
		href: '/admin/articles',
		icon: 'lucide:book-open',
	},
	{
		title: 'admin.sidebar.builds',
		href: '/admin/builds',
		icon: 'lucide:box',
	},
]

export default function AdminSidebar() {
	const pathname = usePathname()
	const t = useTranslations()

	return (
		<div className="flex h-fit flex-col gap-2 rounded-lg bg-background px-4 py-3">
			{tabs.map((tab) => (
				<Link
					className={cn(
						'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-all duration-500 hover:bg-accent',
						pathname === tab.href &&
							'bg-accent hover:brightness-125'
					)}
					href={tab.href}
					key={tab.href}
				>
					<Icon className="text-xl" icon={tab.icon} />
					<p className="font-semibold text-md">{t(tab.title)}</p>
				</Link>
			))}
		</div>
	)
}
