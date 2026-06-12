'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import { memo, type ReactNode, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

type Props = {
	children: ReactNode
	className?: string
	defaultOpen?: boolean
	side?: 'left' | 'right'
}

const Sidebar = ({
	children,
	className,
	defaultOpen = true,
	side = 'left',
}: Props) => {
	const [isOpen, setIsOpen] = useState(defaultOpen)
	const [sidebarWidth, setSidebarWidth] = useState(0)
	const sidebarRef = useRef<HTMLElement | null>(null)

	const isLeft = side === 'left'
	const sidebarSideClass = isLeft ? 'left-4' : 'right-4'
	const sidebarTranslate = isLeft ? -20 : 20
	const buttonSideClass = isLeft ? 'left-5' : 'right-5'
	const openIcon = isLeft ? 'lucide:chevron-left' : 'lucide:chevron-right'
	const closedIcon = isLeft ? 'lucide:chevron-right' : 'lucide:chevron-left'

	useEffect(() => {
		if (!isOpen) return
		if (!sidebarRef.current) return

		const sidebar = sidebarRef.current

		const update = () => {
			setSidebarWidth(sidebar.offsetWidth + 16)
		}

		update()

		const observer = new ResizeObserver(update)
		observer.observe(sidebar)

		return () => observer.disconnect()
	}, [isOpen])

	return (
		<>
			<AnimatePresence>
				{isOpen && (
					<motion.aside
						animate={{ opacity: 1, x: 0 }}
						className={cn(
							'fixed top-1/2 z-999 flex max-h-[70vh] min-w-70 -translate-y-1/2 flex-col gap-4 overflow-y-auto overflow-x-hidden rounded-lg bg-background/60 p-2 shadow-lg ring-2 ring-border/60 backdrop-blur-md',
							sidebarSideClass,
							className
						)}
						exit={{ opacity: 0, x: sidebarTranslate }}
						initial={{ opacity: 0, x: sidebarTranslate }}
						ref={sidebarRef}
						transition={{ duration: 0.4, ease: 'easeInOut' }}
					>
						{children}
					</motion.aside>
				)}
			</AnimatePresence>

			<motion.button
				animate={{
					opacity: 1,
					scale: 1,
					x: isOpen
						? isLeft
							? sidebarWidth + 4
							: -(sidebarWidth + 4)
						: 0,
				}}
				aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
				className={cn(
					'fixed top-1/2 z-999 -translate-y-1/2 cursor-pointer rounded-xl bg-background/60 p-3 backdrop-blur-xs transition-colors duration-400 hover:bg-neutral-300/30 hover:dark:bg-neutral-800/60',
					buttonSideClass
				)}
				initial={{ opacity: 0, scale: 1, x: 0 }}
				onClick={() => setIsOpen(!isOpen)}
				transition={{
					ease: 'easeInOut',
					duration: 0.25,
				}}
				type="button"
			>
				<AnimatePresence initial={false} mode="wait">
					<motion.span
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 1 }}
						initial={{ opacity: 0, scale: 1 }}
						key={isOpen ? 'close' : 'chevron'}
						transition={{ duration: 0.2, ease: 'easeInOut' }}
					>
						<Icon
							className="text-lg"
							icon={isOpen ? openIcon : closedIcon}
						/>
					</motion.span>
				</AnimatePresence>
			</motion.button>
		</>
	)
}

export default memo(Sidebar)
