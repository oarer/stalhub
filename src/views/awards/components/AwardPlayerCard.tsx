'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { CLink } from '@/components/ui/Link'
import { cn } from '@/lib/cn'
import { resolveImageUrl } from '@/lib/imageUrl'
import { allianceColors } from '@/types/player.type'
import { normalizeUnoFaction } from '@/views/uno/utils/uno.utils'

interface AwardPlayerCardProps {
	name: string
	avatarUrl?: string | null
	alliance?: string | null
	region?: string | null
	selected?: boolean
	disabled?: boolean
	onVote: () => void
	compact?: boolean
	showVote?: boolean
}

export function AwardPlayerCard({
	name,
	avatarUrl,
	alliance,
	region,
	selected = false,
	disabled = false,
	onVote,
	compact = false,
	showVote = true,
}: AwardPlayerCardProps) {
	const t = useTranslations()
	const ta = useTranslations('awards')
	const faction = normalizeUnoFaction(alliance)
	const factionColor = faction ? allianceColors[faction] : undefined
	const avatar = resolveImageUrl(avatarUrl)
	const profileHref =
		region && name ? `/player/${region}/${encodeURIComponent(name)}` : null

	return (
		<article
			className={cn(
				'bg-card ring-primary/20 relative flex w-full items-center gap-3 rounded-2xl p-3 shadow-lg ring-2 transition-all duration-300',
				selected
					? 'bg-primary/10 ring-primary'
					: 'hover:ring-primary/40'
			)}
		>
			{avatar ? (
				<div className="bg-muted ring-primary/30 relative size-12 shrink-0 overflow-hidden rounded-full ring-2">
					<Image
						alt={name}
						className="object-cover"
						fill
						sizes="48px"
						src={avatar}
					/>
				</div>
			) : (
				<div
					className={cn(
						'flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold ring-2',
						factionColor ?? 'text-primary',
						selected ? 'ring-primary' : 'ring-primary/30'
					)}
				>
					{name.slice(0, 1).toUpperCase()}
				</div>
			)}

			<div className="flex min-w-0 flex-1 flex-col">
				<span className="truncate font-semibold">{name}</span>
				<span className="text-muted-foreground flex items-center gap-2 truncate text-xs">
					{region && <span>{region}</span>}
					{faction && (
						<>
							<span>·</span>
							<span className={factionColor}>
								{t(`player.alliance.${faction}`)}
							</span>
						</>
					)}
				</span>
			</div>

			<div className="flex shrink-0 items-center gap-1">
				{profileHref && (
					<CLink
						aria-label={ta('player.openProfile')}
						className="size-9 justify-center"
						href={profileHref}
						size="sm"
						variant="outline"
					>
						<Icon
							className="text-base"
							icon="lucide:external-link"
						/>
					</CLink>
				)}
				{showVote && (
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
						<span
							className={compact ? 'hidden sm:inline' : undefined}
						>
							{selected ? ta('alreadyVoted') : ta('vote')}
						</span>
					</Button>
				)}
			</div>
		</article>
	)
}
