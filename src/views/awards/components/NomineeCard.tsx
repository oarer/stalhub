'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { CLink } from '@/components/ui/Link'
import { cn } from '@/lib/cn'
import { resolveImageUrl } from '@/lib/imageUrl'
import type { AwardNominee } from '@/types/awards.type'

interface NomineeCardProps {
	candidate: AwardNominee
	onVote: () => void
	selected: boolean
	disabled?: boolean
}

export function NomineeCard({
	candidate,
	onVote,
	selected,
	disabled = false,
}: NomineeCardProps) {
	const t = useTranslations('awards')
	const socialLinks = Array.isArray(candidate.social_links)
		? candidate.social_links
		: []
	const avatar = resolveImageUrl(candidate.avatar_url)

	return (
		<article
			className={cn(
				'bg-card ring-primary/20 relative flex h-full flex-col items-center gap-4 rounded-2xl p-5 text-center shadow-lg ring-2 transition-all duration-300',
				selected && 'bg-primary/10 ring-primary'
			)}
		>
			{avatar ? (
				<div className="bg-muted ring-primary/30 relative size-28 overflow-hidden rounded-full ring-4">
					<Image
						alt={candidate.name}
						className="object-cover"
						fill
						sizes="112px"
						src={avatar}
					/>
				</div>
			) : (
				<div className="bg-primary/20 text-primary ring-primary/30 flex size-28 items-center justify-center rounded-full text-4xl font-semibold ring-4">
					{candidate.name.slice(0, 1).toUpperCase()}
				</div>
			)}

			<div className="flex flex-col gap-1">
				<h3 className="text-lg font-semibold tracking-tight">
					{candidate.name}
				</h3>
				<p className="text-muted-foreground text-sm">
					{candidate.description}
				</p>
			</div>

			<div className="mt-auto flex w-full flex-col gap-2 pt-2">
				{socialLinks.map((link) => (
					<CLink
						className="w-full justify-center gap-2"
						externalIcon={false}
						href={link.url}
						key={`${link.label}-${link.url}`}
						size="sm"
						variant="outline"
					>
						<Icon className="text-base" icon="lucide:link" />
						{link.label}
					</CLink>
				))}
				<Button
					aria-pressed={selected}
					className="w-full gap-2"
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
		</article>
	)
}
