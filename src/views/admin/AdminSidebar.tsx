'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'

const tabs = [
	{
		title: 'Пользователи',
		href: '/admin/users',
		icon: 'lucide:users',
	},
	{
		title: 'Роли',
		href: '/admin/roles',
		icon: 'lucide:shield',
	},
	{
		title: 'Разрешения',
		href: '/admin/permissions',
		icon: 'lucide:key',
	},
	{
		title: 'Бейджи',
		href: '/admin/badges',
		icon: 'lucide:award',
	},
	{
		title: 'Уведомления',
		href: '/admin/notifications',
		icon: 'lucide:bell',
	},
	{
		title: 'Игроки',
		href: '/admin/players',
		icon: 'lucide:gamepad-2',
	},
	{
		title: 'Статьи',
		href: '/admin/articles',
		icon: 'lucide:book-open',
	},
	{
		title: 'Сборки',
		href: '/admin/builds',
		icon: 'lucide:box',
	},
]

export default function AdminSidebar() {
	const pathname = usePathname()

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
					<p className="font-semibold text-md">{tab.title}</p>
				</Link>
			))}
		</div>
	)
}
