'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { CLink } from '@/components/ui/Link'
import { formatDate } from '@/lib/date'
import { useUnoLocale } from '../../hooks/useUnoLocale'
import type { SeasonEntry } from './seasons.utils'

export function SeasonCard({ season }: { season: SeasonEntry }) {
	const t = useTranslations('uno')
	const locale = useUnoLocale()
	const router = useRouter()
	const title = t.has(season.title) ? t(season.title) : season.title
	const gridsQuery = new URLSearchParams({
		from: season.period[0],
		to: season.period[1],
	})

	if (!season.isInterSeason) {
		gridsQuery.set('season', season.id)
	}

	const gridsHref = `/uno/grids?${gridsQuery.toString()}`

	const openGrids = () => {
		router.push(gridsHref)
	}

	const handleCardKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			openGrids()
		}
	}

	return (
		<Card.Root
			className={`cursor-pointer transition-all hover:ring-primary/60 ${
				season.isCurrent ? 'border-primary/70 ring-primary/60' : ''
			}`}
			onClick={openGrids}
			onKeyDown={handleCardKeyDown}
			role="link"
			tabIndex={0}
		>
			<div className="flex items-start justify-between gap-3">
				<h2 className="mt-1 font-semibold text-xl">{title}</h2>
				{season.isCurrent && (
					<Badge variant="success">{t('seasons.current')}</Badge>
				)}
			</div>
			<div className="mt-5 grid grid-cols-2 gap-3 text-sm">
				<div>
					<p className="text-muted-foreground text-xs">
						{t('seasons.starts')}
					</p>
					<p className="mt-1 font-medium">
						{formatDate(season.period[0], 'date', locale)}
					</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">
						{t('seasons.ends')}
					</p>
					<p className="mt-1 font-medium">
						{formatDate(season.period[1], 'date', locale)}
					</p>
				</div>
			</div>
			{!season.isInterSeason && (
				<div className="mt-4 flex flex-wrap gap-2">
					<CLink
						className="w-fit gap-2"
						href={`/uno?season=${encodeURIComponent(season.id)}`}
						onClick={(event) => {
							event.preventDefault()
							event.stopPropagation()
							router.push(
								`/uno?season=${encodeURIComponent(season.id)}`
							)
						}}
						size="sm"
						variant="outline"
					>
						{t('seasons.leaderboard')}
					</CLink>
					<CLink
						className="w-fit gap-2"
						href={`/uno/seasons/tiers?season=${encodeURIComponent(season.id)}`}
						onClick={(event) => {
							event.preventDefault()
							event.stopPropagation()
							router.push(
								`/uno/seasons/tiers?season=${encodeURIComponent(season.id)}`
							)
						}}
						size="sm"
						variant="outline"
					>
						{t('seasons.tiers')}
					</CLink>
				</div>
			)}
		</Card.Root>
	)
}
