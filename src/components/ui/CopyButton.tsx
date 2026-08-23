'use client'

import { Icon } from '@iconify/react'
import type { VariantProps } from 'class-variance-authority'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { buttonVariants } from './Button'

interface ICopyButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	disabled?: boolean
	text: string | number
}

export function CopyButton({
	text,
	className,
	disabled,
	variant,
	size,
}: ICopyButtonProps) {
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		if (copied) return
		await navigator.clipboard.writeText(String(text))
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<motion.button
			aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
			className={cn(
				buttonVariants({
					variant,
					size,
					disabled: disabled,
				}),
				copied &&
					'bg-success/10 text-success ring-success/40 hover:bg-success/15 hover:text-success',
				'relative',
				className
			)}
			onClick={handleCopy}
			whileTap={{ scale: 0.95 }}
		>
			<AnimatePresence initial={false} mode="wait">
				{copied ? (
					<motion.span
						animate={{ opacity: 1, scale: 1, rotate: 0 }}
						className="absolute inset-0 flex items-center justify-center"
						exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
						initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
						key="check"
						transition={{ duration: 0.15, ease: 'easeOut' }}
					>
						<Icon
							className="size-4 stroke-[2.5]"
							icon="lucide:check"
						/>
					</motion.span>
				) : (
					<motion.span
						animate={{ opacity: 1, scale: 1 }}
						className="absolute inset-0 flex items-center justify-center"
						exit={{ opacity: 0, scale: 0.5 }}
						initial={{ opacity: 0, scale: 0.5 }}
						key="copy"
						transition={{ duration: 0.15, ease: 'easeOut' }}
					>
						<Icon className="size-4" icon="lucide:copy" />
					</motion.span>
				)}
			</AnimatePresence>
		</motion.button>
	)
}
