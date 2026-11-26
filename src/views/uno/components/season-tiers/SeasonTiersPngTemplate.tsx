'use client'

import { forwardRef } from 'react'
import { unbounded } from '@/app/fonts'
import { cn } from '@/lib/cn'
import type { UnoSeasonTier, UnoSeasonTierClan } from '@/types/uno/uno.type'
import { normalizeUnoFaction, unoRankColor } from '../../utils/uno.utils'

const FACTION_EXPORT_COLORS: Record<string, string> = {
	merc: '#38bdf8',
	covenant: '#a855f7',
	freedom: '#4ade80',
	duty: '#dc2626',
	bandits: '#a3a3a3',
	stalkers: '#f59e0b',
}

interface SeasonTiersPngTemplateProps {
	tiers: UnoSeasonTier[]
	seasonTitle: string
	tierLabel: string
	periodLabel: string | null
	totalLabel: string | null
}

export const SeasonTiersPngTemplate = forwardRef<
	HTMLDivElement,
	SeasonTiersPngTemplateProps
>(function SeasonTiersPngTemplate(
	{ tiers, seasonTitle, tierLabel, periodLabel, totalLabel },
	ref
) {
	return (
		<div className="dark bg-background w-7xl p-8 text-white" ref={ref}>
			<h1
				className={`${unbounded.className} text-primary text-2xl font-bold tracking-[3px] uppercase`}
			>
				stalhub.dev
			</h1>
			<header className="mb-4 flex items-end justify-between gap-8">
				<h2
					className={`${unbounded.className} max-w-190 text-3xl text-white`}
				>
					{seasonTitle}
				</h2>
				<div className="flex flex-col items-end gap-1 text-right">
					<span className="text-foreground text-lg font-semibold">
						{tierLabel}
					</span>
					{periodLabel && (
						<span className="text-muted-foreground text-sm">
							{periodLabel}
						</span>
					)}
				</div>
			</header>

			<div className="flex flex-col gap-4">
				{tiers.map((tier) => (
					<section className="flex gap-5" key={tier.rank}>
						<div className="flex w-16 shrink-0 items-start justify-center">
							<span
								className={cn(
									'text-5xl leading-none font-black',
									unoRankColor(tier.rank)
								)}
							>
								{tier.rank}
							</span>
						</div>
						<div className="flex min-w-0 flex-1 flex-col gap-1.5">
							{tier.subtiers.map((subtier) => (
								<div className="flex gap-2" key={subtier.label}>
									<span
										className={cn(
											'w-9 shrink-0 pt-2 text-right text-xs font-semibold',
											unoRankColor(tier.rank)
										)}
									>
										{subtier.label}
									</span>
									<div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
										{subtier.clans.map((clan) => (
											<TierClanChip
												clan={clan}
												key={clan.id}
											/>
										))}
									</div>
								</div>
							))}
						</div>
					</section>
				))}
			</div>

			<footer className="text-muted-foreground mt-4 flex items-center justify-between text-sm">
				<span>stalhub.dev</span>
				{totalLabel && <span>{totalLabel}</span>}
			</footer>
		</div>
	)
})

function TierClanChip({ clan }: { clan: UnoSeasonTierClan }) {
	const faction = normalizeUnoFaction(clan.faction)
	const accent = faction ? FACTION_EXPORT_COLORS[faction] : '#3a4150'

	return (
		<div
			className="border-primary/50 bg-card/40 flex h-10 w-52 items-center gap-1 overflow-hidden rounded-lg border px-3"
			style={{ color: accent }}
		>
			<span className="shrink-0 text-xs font-bold">
				{clan.tag ? `[${clan.tag}]` : ''}
			</span>
			<span className="truncate text-sm font-semibold">{clan.name}</span>
		</div>
	)
}
