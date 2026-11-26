'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { CLink } from '@/components/ui/Link'
import { cn } from '@/lib/cn'
import { resolveImageUrl } from '@/lib/imageUrl'
import type { AwardNominee } from '@/types/awards.type'

interface UpdateCardProps {
	candidate: AwardNominee
	onVote: () => void
	selected: boolean
	disabled?: boolean
}

export function UpdateCard({
	candidate,
	onVote,
	selected,
	disabled = false,
}: UpdateCardProps) {
	const t = useTranslations('awards')
	const avatar = resolveImageUrl(candidate.avatar_url)

	return (
		<article
			className={cn(
				'bg-card ring-primary/20 grid overflow-hidden rounded-2xl shadow-lg ring-2 transition-all duration-300 md:grid-cols-[minmax(0,280px)_1fr]',
				selected && 'bg-primary/10 ring-primary'
			)}
		>
			<div className="bg-muted relative aspect-16/10 overflow-hidden md:aspect-auto md:min-h-56">
				{avatar ? (
					<Image
						alt={candidate.name}
						className="object-cover"
						fill
						sizes="(max-width: 768px) 100vw, 280px"
						src={avatar}
					/>
				) : (
					<div className="bg-primary/10 flex h-full min-h-56 items-center justify-center">
						<Icon
							className="text-primary text-5xl"
							icon="lucide:package-open"
						/>
					</div>
				)}
				<div className="from-card/70 absolute inset-0 bg-linear-to-t via-transparent to-transparent md:bg-linear-to-r" />
				<span className="bg-background/80 absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur">
					<Icon
						className="text-primary text-sm"
						icon="lucide:package-open"
					/>
					{t('kind.updates')}
				</span>
			</div>

			<div className="flex flex-col gap-3 p-5">
				<div className="flex flex-wrap items-center gap-2">
					{candidate.date && (
						<span className="text-muted-foreground inline-flex items-center gap-1 text-xs font-medium">
							<Icon className="text-sm" icon="lucide:calendar" />
							{candidate.date}
						</span>
					)}
					{selected && (
						<span className="bg-primary text-primary-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
							<Icon className="text-sm" icon="lucide:check" />
							{t('alreadyVoted')}
						</span>
					)}
				</div>

				<h3 className="text-xl font-semibold tracking-tight">
					{candidate.name}
				</h3>
				<p className="text-muted-foreground max-w-2xl text-sm">
					{candidate.description}
				</p>

				<div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
					{candidate.patch_url && (
						<CLink
							className="gap-2"
							externalIcon={false}
							href={candidate.patch_url}
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
						disabled={disabled}
						onClick={onVote}
						size="sm"
						variant={selected ? 'primary' : 'bordered'}
					>
						<Icon
							className="text-base"
							icon={selected ? 'lucide:check' : 'lucide:vote'}
						/>
						{selected ? t('alreadyVoted') : t('vote')}
					</Button>
				</div>
			</div>
		</article>
	)
}
