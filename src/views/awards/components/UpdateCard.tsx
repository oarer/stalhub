'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { CLink } from '@/components/ui/Link'
import { cn } from '@/lib/cn'
import type { AwardCandidate } from '../awards.data'

interface UpdateCardProps {
	candidate: AwardCandidate
	index: number
	onVote: () => void
	selected: boolean
}

export function UpdateCard({
	candidate,
	index,
	onVote,
	selected,
}: UpdateCardProps) {
	return (
		<motion.article
			className={cn(
				'grid overflow-hidden rounded-2xl bg-card shadow-lg ring-2 ring-primary/20 transition-all duration-300 md:grid-cols-[minmax(0,280px)_1fr]',
				selected && 'bg-primary/10 ring-primary'
			)}
			initial={{ opacity: 0, y: 20 }}
			transition={{ duration: 0.45, delay: index * 0.06 }}
			viewport={{ once: true, amount: 0.2 }}
			whileInView={{ opacity: 1, y: 0 }}
		>
			<div className="relative aspect-[16/10] overflow-hidden bg-muted md:aspect-auto md:min-h-56">
				<Image
					alt={candidate.name}
					className="object-cover"
					fill
					sizes="(max-width: 768px) 100vw, 280px"
					src={candidate.image}
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-card/70 via-transparent to-transparent md:bg-gradient-to-r" />
				<span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1 font-medium text-xs backdrop-blur">
					<Icon
						className="text-primary text-sm"
						icon="lucide:package-open"
					/>
					Обновление
				</span>
			</div>

			<div className="flex flex-col gap-3 p-5">
				<div className="flex flex-wrap items-center gap-2">
					{candidate.date && (
						<span className="inline-flex items-center gap-1 font-medium text-muted-foreground text-xs">
							<Icon className="text-sm" icon="lucide:calendar" />
							{candidate.date}
						</span>
					)}
					{selected && (
						<span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 font-semibold text-primary-foreground text-xs">
							<Icon className="text-sm" icon="lucide:check" />
							Выбрано
						</span>
					)}
				</div>

				<h3 className="font-semibold text-xl tracking-tight">
					{candidate.name}
				</h3>
				<p className="max-w-2xl text-muted-foreground text-sm">
					{candidate.description}
				</p>

				<div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
					{candidate.patchUrl && (
						<CLink
							className="gap-2"
							externalIcon={false}
							href={candidate.patchUrl}
							size="sm"
							variant="outline"
						>
							<Icon
								className="text-base"
								icon="lucide:file-text"
							/>
							Патчноут
						</CLink>
					)}
					<Button
						aria-pressed={selected}
						className="gap-2"
						onClick={onVote}
						size="sm"
						variant={selected ? 'primary' : 'bordered'}
					>
						<Icon
							className="text-base"
							icon={selected ? 'lucide:check' : 'lucide:vote'}
						/>
						{selected ? 'Выбран' : 'Выбрать'}
					</Button>
				</div>
			</div>
		</motion.article>
	)
}
