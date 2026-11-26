'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { resolveImageUrl } from '@/lib/imageUrl'
import type { RankedNominee } from '../../utils/award-results'
import { nomineeName } from '../../utils/results-presentation'

export function ResultCard({
	nominee,
	hidden = false,
	rank,
	highlight = false,
	delay = 0,
	showPlace = true,
}: {
	nominee?: RankedNominee
	hidden?: boolean
	rank: number
	highlight?: boolean
	delay?: number
	showPlace?: boolean
}) {
	const t = useTranslations('awards')
	const [expanded, setExpanded] = useState(false)
	const avatar = resolveImageUrl(nominee?.avatar_url)
	const name = nominee ? nomineeName(nominee) : ''

	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className={cn(
				'flex min-h-24 items-stretch gap-3 rounded-2xl border p-2.5 sm:min-h-28 sm:p-3',
				highlight
					? 'border-primary/60 bg-primary/10'
					: 'border-primary/20 bg-card/50'
			)}
			initial={{ opacity: 0, y: 16 }}
			transition={{ delay, duration: 0.35, ease: 'easeOut' }}
		>
			<div className="bg-muted relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:size-24">
				{hidden ? (
					<>
						<div className="from-muted via-card to-muted absolute inset-0 bg-gradient-to-br" />
						<div className="bg-background/40 absolute inset-0 backdrop-blur-sm" />
						<span className="text-primary/60 relative text-2xl font-semibold">
							?
						</span>
					</>
				) : avatar ? (
					<Image
						alt={name}
						className="object-cover"
						fill
						sizes="96px"
						src={avatar}
					/>
				) : (
					<span className="text-primary text-2xl font-semibold">
						{name.slice(0, 1).toUpperCase()}
					</span>
				)}
			</div>

			<div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
				{hidden ? (
					<div className="bg-muted-foreground/20 h-5 w-1/2 max-w-48 rounded" />
				) : (
					<>
						<p className="truncate text-sm font-semibold sm:text-base">
							{name}
						</p>
						{nominee?.description && (
							<>
								<p
									className={cn(
										'text-muted-foreground text-xs',
										!expanded && 'line-clamp-2'
									)}
								>
									{nominee.description}
								</p>
								{nominee.description.length > 80 && (
									<button
										className="text-primary w-fit text-xs hover:underline"
										onClick={() =>
											setExpanded((value) => !value)
										}
										type="button"
									>
										{expanded
											? t('results.showLess')
											: t('results.showMore')}
									</button>
								)}
							</>
						)}
					</>
				)}
			</div>

			<div className="flex shrink-0 flex-col items-end justify-center gap-1 text-right">
				{showPlace ? (
					<span
						className={cn(
							'text-sm font-semibold',
							highlight ? 'text-primary' : 'text-foreground'
						)}
					>
						{t('results.place', { place: rank })}
					</span>
				) : null}
				{!hidden && (
					<span className="text-muted-foreground text-xs">
						{t('results.votes', {
							count: nominee?.votes_count ?? 0,
						})}
					</span>
				)}
			</div>
		</motion.div>
	)
}
