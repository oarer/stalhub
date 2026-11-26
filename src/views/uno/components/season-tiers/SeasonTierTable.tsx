'use client'

import { CLink } from '@/components/ui/Link'
import { cn } from '@/lib/cn'
import { allianceColors } from '@/types/player.type'
import type { UnoSeasonTier, UnoSeasonTierClan } from '@/types/uno/uno.type'
import { normalizeUnoFaction, unoRankColor } from '../../utils/uno.utils'

function TierClan({ clan }: { clan: UnoSeasonTierClan }) {
	const faction = normalizeUnoFaction(clan.faction)
	const color = faction ? allianceColors[faction] : undefined
	const meta = [
		clan.position !== null ? `#${clan.position}` : null,
		clan.rating !== null ? String(clan.rating) : null,
	]
		.filter(Boolean)
		.join(' · ')

	return (
		<CLink
			className={cn(
				'border-primary/20 bg-card/40 hover:border-primary/50 hover:bg-primary/10 w-40 shrink-0 justify-start overflow-hidden border px-2.5 py-1.5 text-sm font-normal transition-colors',
				color
			)}
			href={`/uno/clans/${encodeURIComponent(clan.id)}`}
			title={meta || undefined}
			variant="none"
		>
			<span className="truncate">
				{clan.tag && (
					<span className="font-semibold">[{clan.tag}] </span>
				)}
				{clan.name}
			</span>
		</CLink>
	)
}

export function SeasonTierTable({ tier }: { tier: UnoSeasonTier }) {
	return (
		<div className="flex gap-2 sm:gap-4">
			<div className="flex w-8 shrink-0 items-start justify-center pt-0.5 select-none sm:w-16 sm:pt-0">
				<span
					className={cn(
						'text-3xl leading-none font-black sm:text-6xl',
						unoRankColor(tier.rank)
					)}
				>
					{tier.rank}
				</span>
			</div>
			<div className="min-w-0 flex-1 space-y-1.5">
				{tier.subtiers.map((subtier) => (
					<div className="flex gap-2" key={subtier.label}>
						<span
							className={cn(
								'w-9 shrink-0 pt-1.5 text-right text-xs font-semibold sm:w-12 sm:text-sm',
								unoRankColor(tier.rank)
							)}
						>
							{subtier.label}
						</span>
						<div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
							{subtier.clans.map((clan) => (
								<TierClan clan={clan} key={clan.id} />
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
