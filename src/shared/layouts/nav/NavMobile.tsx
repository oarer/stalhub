'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { unbounded } from '@/app/fonts'
import { Accordion } from '@/components/ui/Accordion'
import { DropDownMobile, MobileLinks } from '@/constants/nav.const'
import useClickOutside from '@/hooks/useClickOutside'
import useSvg from '@/hooks/useSvg'

export default function NavMobile() {
	const svgPath = useSvg()
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	const menuRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)

	const t = useTranslations()

	const dropdownItems = useMemo(
		() => DropDownMobile(t, () => setIsMenuOpen(false)),
		[t]
	)

	useClickOutside(menuRef, () => setIsMenuOpen(false), buttonRef)

	const menu = createPortal(
		<AnimatePresence>
			{isMenuOpen && (
				<>
					<motion.div
						animate={{ opacity: 1 }}
						aria-hidden="true"
						className="fixed inset-0 z-91 bg-black/40 backdrop-blur-sm"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						onClick={() => setIsMenuOpen(false)}
					/>

					<motion.div
						animate={{ opacity: 1, y: 0, scale: 1 }}
						className="fixed top-8 left-1/2 z-99 flex w-[90%] -translate-x-1/2 flex-col gap-4 xl:w-[30%]"
						exit={{ opacity: 0, y: -10, scale: 0.95 }}
						initial={{ opacity: 0, y: -10, scale: 0.95 }}
						ref={menuRef}
						transition={{ duration: 0.2, ease: 'easeOut' }}
					>
						<div className="rounded-xl bg-background p-6 shadow-lg ring-2 ring-border/50">
							<Link
								className="flex items-center justify-center gap-3 transition-all duration-500 hover:opacity-80 active:scale-95"
								href="/"
								onClick={() => setIsMenuOpen(false)}
							>
								<Image
									alt="logo"
									height={34}
									src={`${svgPath}logo.svg`}
									width={34}
								/>
								<h1
									className={`${unbounded.className} text-2xl`}
								>
									StalHub
								</h1>
							</Link>
						</div>

						<div className="flex flex-col gap-4 rounded-xl bg-background p-6 shadow-lg ring-2 ring-border/50">
							<Accordion
								className="flex flex-col gap-4"
								items={dropdownItems}
								selectionMode="single"
								size="sm"
							/>
						</div>
						<div className="flex flex-col gap-4 rounded-xl bg-background p-6 shadow-lg ring-2 ring-border/50">
							{MobileLinks.map((link) => (
								<Link
									className="flex items-center gap-2 transition-all duration-300 hover:opacity-70 active:opacity-50"
									href={link.href}
									key={link.title}
									onClick={() => setIsMenuOpen(false)}
								>
									<Icon
										className="text-2xl"
										icon={link.iconName}
									/>
									<span className="font-semibold">
										{link.title}
									</span>
									<Icon
										className="ml-auto size-5"
										icon="lucide:external-link"
									/>
								</Link>
							))}
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>,
		document.body
	)

	return (
		<>
			<button
				aria-controls="mobile-menu"
				aria-expanded={isMenuOpen}
				className="relative z-50 flex cursor-pointer items-center justify-center p-2"
				onClick={() => setIsMenuOpen((prev) => !prev)}
				ref={buttonRef}
				type="button"
			>
				<div
					className={`absolute transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'
						}`}
				>
					<Icon
						className="text-2xl text-black dark:text-white"
						icon="lucide:menu"
					/>
				</div>

				<div
					className={`absolute transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'
						}`}
				>
					<Icon
						className="text-3xl text-black dark:text-white"
						icon="material-symbols:close"
					/>
				</div>
			</button>

			{menu}
		</>
	)
}
