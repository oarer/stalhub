'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { CLink } from '@/components/ui/Link'
import { cn } from '@/lib/cn'
import type { AwardCandidate } from '../awards.data'

interface NomineeCardProps {
	candidate: AwardCandidate
	index: number
	onVote: () => void
	selected: boolean
}

export function NomineeCard({
	candidate,
	index,
	onVote,
	selected,
}: NomineeCardProps) {
	return (
		<motion.article
			className={cn(
				'relative flex h-full flex-col items-center gap-4 rounded-2xl bg-card p-5 text-center shadow-lg ring-2 ring-primary/20 transition-all duration-300',
				selected && 'bg-primary/10 ring-primary'
			)}
			initial={{ opacity: 0, y: 20 }}
			transition={{ duration: 0.45, delay: index * 0.06 }}
			viewport={{ once: true, amount: 0.2 }}
			whileInView={{ opacity: 1, y: 0 }}
		>
			<div className="relative size-28 overflow-hidden rounded-full bg-muted ring-4 ring-primary/30">
				<Image
					alt={candidate.name}
					className="object-cover"
					fill
					sizes="112px"
					src={candidate.image}
				/>
			</div>

			<div className="flex flex-col gap-1">
				<h3 className="font-semibold text-lg tracking-tight">
					{candidate.name}
				</h3>
				<p className="text-muted-foreground text-sm">
					{candidate.description}
				</p>
			</div>

			<div className="mt-auto flex w-full flex-col gap-2 pt-2">
				{candidate.twitchUrl && (
					<CLink
						className="w-full justify-center gap-2"
						externalIcon={false}
						href={candidate.twitchUrl}
						size="sm"
						variant="outline"
					>
						<Icon className="text-base" icon="lucide:twitch" />
						Twitch
					</CLink>
				)}
				<Button
					aria-pressed={selected}
					className="w-full gap-2"
					onClick={onVote}
					size="sm"
					variant={selected ? 'primary' : 'bordered'}
				>
					<Icon
						className="text-base"
						icon={selected ? 'lucide:check' : 'lucide:vote'}
					/>
					{selected ? 'Выбран' : 'Голосовать'}
				</Button>
			</div>
		</motion.article>
	)
}
