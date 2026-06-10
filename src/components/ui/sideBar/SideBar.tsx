'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import { memo, type ReactNode, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

type Props = {
	children: ReactNode
	className?: string
	defaultOpen?: boolean
}

const Sidebar: React.FC<Props> = ({
	children,
	className,
	defaultOpen = true,
}) => {
	const [isOpen, setIsOpen] = useState(defaultOpen)
	const containerRef = useRef<HTMLDivElement | null>(null)
	const sidebarRef = useRef<HTMLElement | null>(null)

	useEffect(() => {
		if (!isOpen) return
		if (!containerRef.current || !sidebarRef.current) return

		const container = containerRef.current
		const sidebar = sidebarRef.current

		const update = () => {
			container.style.setProperty(
				'--sidebar-width',
				`${sidebar.offsetWidth + 16}px`
			)
		}

		update()

		const observer = new ResizeObserver(update)
		observer.observe(sidebar)

		return () => observer.disconnect()
	}, [isOpen])

	return (
		<div ref={containerRef}>
			<AnimatePresence>
				{isOpen && (
					<motion.aside
						animate={{ opacity: 1, x: 0 }}
						className={cn(
							'fixed top-1/2 left-4 z-999 flex max-h-[70vh] min-w-70 -translate-y-1/2 flex-col gap-4 overflow-y-auto overflow-x-hidden rounded-lg bg-background/60 p-2 shadow-lg ring-2 ring-border/60 backdrop-blur-md',
							className
						)}
						exit={{ opacity: 0, x: -20 }}
						initial={{ opacity: 0, x: -20 }}
						ref={sidebarRef}
						transition={{ duration: 0.4, ease: 'easeInOut' }}
					>
						{children}
					</motion.aside>
				)}
			</AnimatePresence>

			<motion.button
				animate={{
					left: isOpen
						? 'calc(var(--sidebar-width, 0px) + 24px)'
						: '20px',
					opacity: 1,
					scale: 1,
				}}
				className="fixed top-1/2 z-999 -translate-y-1/2 cursor-pointer rounded-xl bg-background/60 p-3 backdrop-blur-xs transition-colors duration-400 hover:bg-neutral-300/30 hover:dark:bg-neutral-800/60"
				initial={{ opacity: 0, scale: 1 }}
				onClick={() => setIsOpen(!isOpen)}
				transition={{
					ease: 'easeInOut',
					duration: 0.2,
					left: {
						duration: isOpen ? 0.3 : 0.45,
						delay: isOpen ? 0 : 0.2,
						ease: 'easeInOut',
					},
				}}
			>
				<AnimatePresence initial={false} mode="wait">
					<motion.span
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 1 }}
						initial={{ opacity: 0, scale: 1 }}
						key={isOpen ? 'close' : 'chevron'}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
					>
						<Icon
							className="text-lg"
							icon={
								isOpen
									? 'lucide:chevron-left'
									: 'lucide:chevron-right'
							}
						/>
					</motion.span>
				</AnimatePresence>
			</motion.button>
		</div>
	)
}

export default memo(Sidebar)
