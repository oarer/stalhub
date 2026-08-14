'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import type { WikiSection } from '@/types/wiki.type'

interface WikiSidebarProps {
	sections: WikiSection[]
}

export function WikiSidebar({ sections }: WikiSidebarProps) {
	const pathname = usePathname()
	const t = useTranslations()

	return (
		<aside className="w-80">
			<div className="fixed flex w-80 flex-col gap-4 overflow-y-auto p-6">
				<motion.div
					animate={{ opacity: 1, x: 0 }}
					initial={{ opacity: 0, x: -10 }}
					transition={{ duration: 0.3 }}
				>
					<Link
						className="flex items-center gap-2 px-2 py-2 font-semibold transition-colors duration-500 hover:text-text-accent"
						href="/wiki"
					>
						<Icon className="text-xl" icon="lucide:book-open" />
						<h1 className="text-lg">{t('wiki.navTitle')}</h1>
					</Link>
				</motion.div>

				<nav className="space-y-2">
					{sections.map((section, index) => (
						<motion.div
							animate={{ opacity: 1, y: 0 }}
							initial={{ opacity: 0, y: 10 }}
							key={section.slug || 'root'}
							transition={{ duration: 0.3, delay: index * 0.05 }}
						>
							<SidebarSection
								pathname={pathname}
								section={section}
							/>
						</motion.div>
					))}
				</nav>
			</div>
		</aside>
	)
}

function SidebarSection({
	section,
	pathname,
}: {
	section: WikiSection
	pathname: string
}) {
	const sectionHref = `/wiki/${section.slug}`
	const isActiveSection =
		pathname === sectionHref ||
		section.pages.some((page) => pathname === `/wiki/${page.slug}`)
	const [open, setOpen] = useState(isActiveSection)

	useEffect(() => {
		if (isActiveSection && !open) {
			setOpen(true)
		}
	}, [isActiveSection, open])

	if (section.pages.length === 0 && !section.slug) return null

	return (
		<>
			<div className="flex items-center">
				<Link
					className={cn(
						'flex-1 rounded-md px-2 py-2 font-semibold text-sm transition-colors',
						pathname === sectionHref
							? 'bg-accent text-border'
							: 'hover:bg-accent/50'
					)}
					href={sectionHref}
				>
					{section.title}
				</Link>
				{section.pages.length > 0 && (
					<motion.button
						className="p-2 transition-colors hover:text-text-accent"
						onClick={() => setOpen(!open)}
						whileTap={{ scale: 0.95 }}
					>
						<motion.div
							animate={{ rotate: open ? 90 : 0 }}
							transition={{ duration: 0.2, ease: 'easeInOut' }}
						>
							<Icon
								className="h-4 w-4 cursor-pointer"
								icon="lucide:chevron-right"
							/>
						</motion.div>
					</motion.button>
				)}
			</div>

			<AnimatePresence initial={false}>
				{open && section.pages.length > 0 && (
					<motion.div
						animate={{ height: 'auto', opacity: 1 }}
						className="overflow-hidden"
						exit={{ height: 0, opacity: 0 }}
						initial={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2, ease: 'easeInOut' }}
					>
						<div className="mt-1 ml-2 space-y-0.5 border-border border-l pl-4">
							{section.pages.map((page, pageIndex) => {
								const href = `/wiki/${page.slug}`
								const isActive = pathname === href

								return (
									<motion.div
										animate={{ opacity: 1, x: 0 }}
										initial={{ opacity: 0, x: -5 }}
										key={page.slug}
										transition={{
											duration: 0.15,
											delay: pageIndex * 0.03,
										}}
									>
										<Link
											className={cn(
												'block rounded-md px-3 py-1.5 font-semibold text-sm transition-all',
												isActive
													? 'bg-accent text-border'
													: 'hover:bg-accent/50'
											)}
											href={href}
										>
											{page.metadata.title ||
												page.slug.split('/').pop()}
										</Link>
									</motion.div>
								)
							})}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	)
}
