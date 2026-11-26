'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import { memo, type ReactNode, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

type Props = {
	children: ReactNode
	className?: string
	defaultOpen?: boolean
	id?: string
	side?: 'left' | 'right'
	buttonSideClass?: string

	open?: boolean
	onOpenChange?: (open: boolean) => void
}

const Sidebar = ({
	children,
	className,
	defaultOpen = true,
	id,
	buttonSideClass,
	side = 'left',
	open: openProp,
	onOpenChange,
}: Props) => {
	const [isOpenInternal, setIsOpenInternal] = useState(defaultOpen)
	const [sidebarWidth, setSidebarWidth] = useState(0)
	const sidebarRef = useRef<HTMLElement | null>(null)

	const isOpen = openProp ?? isOpenInternal

	const setOpen = (next: boolean) => {
		if (onOpenChange) onOpenChange(next)
		else setIsOpenInternal(next)
	}

	const isLeft = side === 'left'
	const sidebarSideClass = isLeft ? 'left-4' : 'right-4'
	const sidebarTranslate = isLeft ? -20 : 20
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
							'bg-card/60 ring-primary/60 fixed top-1/2 z-999 flex max-h-[70vh] min-w-70 -translate-y-1/2 flex-col gap-4 overflow-x-hidden overflow-y-auto rounded-lg p-2 shadow-lg ring-2 backdrop-blur-md',
							sidebarSideClass,
							className
						)}
						exit={{ opacity: 0, x: sidebarTranslate }}
						id={id}
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
					'bg-card/60 hover:bg-muted/30 fixed top-1/2 z-999 -translate-y-1/2 cursor-pointer rounded-xl p-3 backdrop-blur-xs transition-colors duration-400',
					buttonSideClass,
					isLeft ? 'left-5' : 'right-5'
				)}
				initial={{ opacity: 0, scale: 1, x: 0 }}
				onClick={() => setOpen(!isOpen)}
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
