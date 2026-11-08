'use client'

import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { ClanRow } from './ClanRow'
import type { ResultGroup } from './grid-detail.types'
import { MatchHeader } from './MatchHeader'

export function ResultCard({
	group,
	accent,
	cardKey,
	dimmed,
	highlighted,
	onHoverCard,
	onHoverClan,
	onLeaveClan,
}: {
	group: ResultGroup
	accent: boolean
	cardKey: string
	dimmed: boolean
	highlighted?: boolean
	onHoverCard: (key: string | null) => void
	onHoverClan: (clanId: string) => void
	onLeaveClan: () => void
}) {
	return (
		<div
			className={cn(
				'relative z-10 transition-all duration-200',
				dimmed && 'opacity-30 blur-[2px]'
			)}
			data-card-key={cardKey}
			onMouseEnter={() => onHoverCard(cardKey)}
			onMouseLeave={() => onHoverCard(null)}
		>
			<Card.Root
				className={cn(
					'gap-0 overflow-hidden p-0 ring-1 transition-all duration-200',
					highlighted
						? 'shadow-lg shadow-primary/30 ring-primary/60'
						: 'hover:shadow-lg hover:shadow-primary/30 hover:ring-primary/60'
				)}
			>
				<MatchHeader
					accent={accent}
					losses={group.losses}
					wins={group.wins}
				/>
				<div className="divide-y divide-border-secondary/50">
					{group.clans.map((clan) => (
						<ClanRow
							clan={clan}
							key={clan.id}
							onHover={onHoverClan}
							onLeave={onLeaveClan}
						/>
					))}
				</div>
			</Card.Root>
		</div>
	)
}
