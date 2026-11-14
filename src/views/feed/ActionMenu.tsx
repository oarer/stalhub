'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import useClickOutside from '@/hooks/useClickOutside'

/** Кнопка «···» с выпадающим меню в хедере контента. */
export function ActionMenu({
	label,
	children,
}: {
	label: string
	children: React.ReactNode | ((close: () => void) => React.ReactNode)
}) {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)
	const close = () => setOpen(false)
	useClickOutside(ref, close)

	useEffect(() => {
		if (!open) return
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpen(false)
		}
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [open])

	return (
		<div className="relative" ref={ref}>
			<Button
				aria-expanded={open}
				aria-haspopup="menu"
				aria-label={label}
				className="p-2.5"
				onClick={() => setOpen((value) => !value)}
				variant="secondary"
			>
				<Icon className="size-5" icon="lucide:ellipsis" />
			</Button>
			<AnimatePresence>
				{open && (
					<motion.div
						animate={{ opacity: 1, scale: 1 }}
						className="absolute top-full right-0 z-50 mt-2 flex w-56 flex-col rounded-xl border border-primary/25 bg-card/95 p-1.5 shadow-lg backdrop-blur-xl"
						exit={{ opacity: 0, scale: 0.95 }}
						initial={{ opacity: 0, scale: 0.95 }}
						role="menu"
						transition={{ duration: 0.15, ease: 'easeOut' }}
					>
						{typeof children === 'function'
							? children(close)
							: children}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export function ActionMenuItem({
	children,
	icon,
	onClick,
	danger = false,
	disabled = false,
	close,
}: {
	children: React.ReactNode
	icon: string
	onClick?: () => void
	danger?: boolean
	disabled?: boolean
	close?: () => void
}) {
	return (
		<motion.button
			animate={{ opacity: 1 }}
			className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left font-medium text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
				danger ? 'text-destructive hover:bg-destructive/15' : ''
			}`}
			disabled={disabled}
			exit={{ opacity: 0 }}
			initial={{ opacity: 0 }}
			onClick={() => {
				close?.()
				onClick?.()
			}}
			transition={{ duration: 0.1 }}
			type="button"
			whileHover={{ scale: disabled ? 1 : 1.02 }}
			whileTap={{ scale: disabled ? 1 : 0.98 }}
		>
			<Icon className="size-4" icon={icon} />
			{children}
		</motion.button>
	)
}
