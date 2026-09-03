'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/Button'
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
		title: 'admin.sidebar.clans',
		href: '/admin/clans',
		icon: 'lucide:flag',
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
	{
		title: 'admin.sidebar.arts',
		href: '/admin/arts',
		icon: 'lucide:palette',
	},
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
	const pathname = usePathname()
	const t = useTranslations()

	return (
		<div className="flex flex-col gap-1">
			{tabs.map((tab) => {
				const isActive = pathname.startsWith(tab.href)
				return (
					<Link
						className={cn(
							'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-all duration-500 hover:bg-accent',
							isActive && 'bg-accent hover:brightness-125'
						)}
						href={tab.href}
						key={tab.href}
						onClick={onNavigate}
					>
						<Icon className="text-xl" icon={tab.icon} />
						<p className="font-semibold text-sm">{t(tab.title)}</p>
					</Link>
				)
			})}
		</div>
	)
}

export default function AdminSidebar() {
	const [isOpen, setIsOpen] = useState(false)
	const t = useTranslations()

	useEffect(() => {
		if (!isOpen) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setIsOpen(false)
		}
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [isOpen])

	useEffect(() => {
		if (!isOpen) return
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = prev
		}
	}, [isOpen])

	const close = () => setIsOpen(false)

	return (
		<>
			<motion.button
				aria-label="Open admin navigation"
				className="fixed bottom-7 left-1/2 z-99999 flex -translate-x-1/2 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-primary/60 bg-card p-2 shadow-lg backdrop-blur-md lg:hidden"
				onClick={() => setIsOpen(true)}
				type="button"
				whileTap={{ scale: 0.9 }}
			>
				<Icon className="text-lg" icon="lucide:menu" />
				<p className="font-semibold">{t('me.menu')}</p>
			</motion.button>

			{typeof document !== 'undefined' &&
				createPortal(
					<motion.div
						animate={{ opacity: isOpen ? 1 : 0 }}
						className={cn(
							'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden',
							isOpen
								? 'pointer-events-auto'
								: 'pointer-events-none'
						)}
						initial={{ opacity: 0 }}
						onClick={close}
						style={{ visibility: isOpen ? 'visible' : 'hidden' }}
						transition={{ duration: 0.2 }}
					>
						<motion.aside
							animate={{ x: isOpen ? 0 : '-100%' }}
							className="absolute inset-y-0 left-0 z-10 flex w-72 flex-col gap-4 overflow-y-auto bg-card px-4 py-6 pt-32 shadow-xl"
							initial={{ x: '-100%' }}
							transition={{
								type: 'spring',
								damping: 28,
								stiffness: 300,
							}}
						>
							<div className="flex items-center justify-between">
								<p className="font-semibold text-lg">
									{t('admin.sidebar.title')}
								</p>
								<Button
									className="p-1.5"
									onClick={close}
									variant="ghost"
								>
									<Icon className="text-lg" icon="lucide:x" />
								</Button>
							</div>
							<div className="mask-y-from-97% mask-y-to-100% min-h-0 flex-1 overflow-y-auto">
								<SidebarContent onNavigate={close} />
							</div>
						</motion.aside>
					</motion.div>,
					document.body
				)}

			<aside className="sticky top-0 hidden h-dvh w-64 shrink-0 overflow-y-auto border-primary/2 border-r-2 bg-background/80 px-4 pt-32 pb-6 lg:block">
				<SidebarContent />
			</aside>
		</>
	)
}
