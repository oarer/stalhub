'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import useSvg from '@/hooks/useSvg'
import { userQueries } from '@/queries/user/user.queries'
import NavTabs from '@/views/me/components/NavTabs'
import UserCard from '@/views/me/components/UserCard'
import { usePatchMe } from '@/views/me/hooks/usePatchMe'

export default function MobileMeNav() {
	const [isOpen, setIsOpen] = useState(false)
	const pathname = usePathname()
	const t = useTranslations()
	const { data: user } = useSuspenseQuery(userQueries.getMe())
	const { data: unreadCount } = useSuspenseQuery(userQueries.getUnreadCount())

	const svgPath = useSvg()

	const bgVariant = user.customization?.cardBackground ?? 'NONE'
	const bgColor = user.customization?.cardColor ?? '#000000'

	const bgUpdateMutation = usePatchMe()

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
				aria-label="Open navigation"
				className="fixed bottom-7 left-1/2 z-99999 flex -translate-x-1/2 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-border/60 bg-background p-2 shadow-lg backdrop-blur-md lg:hidden"
				onClick={() => setIsOpen(true)}
				type="button"
				whileTap={{ scale: 0.9 }}
			>
				<Icon className="text-lg" icon="lucide:menu" />
				<p className="font-semibold">{t('me.menu')}</p>
			</motion.button>

			{typeof document !== 'undefined' &&
				createPortal(
					<AnimatePresence>
						{isOpen && (
							<div className="fixed inset-0 z-999999">
								<motion.div
									animate={{ opacity: 1 }}
									className="absolute inset-0 bg-black/60 backdrop-blur-sm"
									exit={{ opacity: 0 }}
									initial={{ opacity: 0 }}
									onClick={close}
									transition={{ duration: 0.2 }}
								/>

								<motion.aside
									animate={{ x: 0 }}
									className="absolute inset-y-0 left-0 z-10 flex min-w-90 flex-col gap-4 bg-background px-4 py-6 shadow-xl"
									exit={{ x: '-100%' }}
									initial={{ x: '-100%' }}
									transition={{
										type: 'spring',
										damping: 28,
										stiffness: 300,
									}}
								>
									<div className="flex items-center justify-between">
										<Link
											className="flex items-center gap-3 transition-all duration-500 hover:opacity-80 active:scale-95"
											href="/"
											onClick={close}
										>
											<Image
												alt="logo"
												height={32}
												src={`${svgPath}logo.svg`}
												width={32}
											/>
											<h1
												className={`${unbounded.className} font-semibold text-xl`}
											>
												StalHub
											</h1>
										</Link>
										<Button
											className="p-1.5"
											onClick={close}
											variant={'ghost'}
										>
											<Icon
												className="text-lg"
												icon="lucide:x"
											/>
										</Button>
									</div>
									<UserCard
										cardBackground={bgVariant}
										cardColor={bgColor}
										onCardChange={bgUpdateMutation.mutate}
										user={user}
									/>
									<Divider />
									<div className="mask-y-from-97% mask-y-to-100% min-h-0 flex-1 overflow-y-auto">
										<NavTabs
											onTabClick={close}
											pathname={pathname}
											unreadCount={unreadCount}
										/>
									</div>
								</motion.aside>
							</div>
						)}
					</AnimatePresence>,
					document.body
				)}
		</>
	)
}
