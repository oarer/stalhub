'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { cn } from '@/lib/cn'
import type { LogEntry } from '../config'
import { rowOpacity } from '../utils'

function LogStatus({ processing }: { processing: boolean }) {
	const t = useTranslations('landing.clan')
	const label = processing ? t('demo.processing') : t('demo.done')

	return (
		<AnimatePresence initial={false} mode="wait">
			{processing ? (
				<motion.span
					animate={{ opacity: 1, y: 0 }}
					className="flex items-center gap-1.5"
					exit={{ opacity: 0, y: -4 }}
					initial={{ opacity: 0, y: 4 }}
					key="processing"
					transition={{ duration: 0.25 }}
				>
					{label}
					<Icon
						className="animate-spin text-sm"
						icon="lucide:loader-circle"
					/>
				</motion.span>
			) : (
				<motion.span
					animate={{ opacity: 1, y: 0 }}
					className="flex items-center gap-1.5"
					exit={{ opacity: 0, y: -4 }}
					initial={{ opacity: 0, y: 4 }}
					key="done"
					transition={{ duration: 0.25 }}
				>
					{label}
					<Icon className="text-sm" icon="lucide:check" />
				</motion.span>
			)}
		</AnimatePresence>
	)
}

export function LogList({
	entries,
	reducedMotion,
}: {
	entries: LogEntry[]
	reducedMotion: boolean
}) {
	return (
		<div className="overflow-hidden rounded-xl border border-muted bg-card">
			<AnimatePresence initial={false} mode="popLayout">
				{entries.map((entry, i) => {
					const processing = i === 0 && entry.status === 'processing'
					return (
						<motion.div
							animate={{
								opacity: reducedMotion ? 1 : rowOpacity(i),
								y: 0,
							}}
							className={cn(
								'grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-2.5 font-mono text-[13px] transition-colors duration-500',
								processing && 'bg-accent/50'
							)}
							exit={{ opacity: 0, y: 8 }}
							initial={{ opacity: 0, y: -12 }}
							key={entry.shot}
							layout={!reducedMotion}
							transition={{
								duration: 0.5,
								ease: 'easeOut',
							}}
						>
							<span
								className={cn(
									montserrat.className,
									'truncate font-medium',
									processing
										? 'text-primary'
										: 'text-foreground/80'
								)}
							>
								screenshot_{entry.shot}.png
							</span>
							<span
								className={cn(
									montserrat.className,
									'font-medium',
									processing
										? 'text-primary/90'
										: 'text-muted-foreground'
								)}
							>
								{entry.time}
							</span>
							<span
								className={cn(
									'flex items-center gap-1.5 font-semibold',
									processing
										? 'text-primary'
										: 'text-muted-foreground'
								)}
							>
								<LogStatus processing={processing} />
							</span>
						</motion.div>
					)
				})}
			</AnimatePresence>
		</div>
	)
}
