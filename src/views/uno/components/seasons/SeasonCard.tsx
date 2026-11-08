'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/date'
import { useUnoLocale } from '../../hooks/useUnoLocale'
import type { SeasonEntry } from './seasons.utils'

export function SeasonCard({ season }: { season: SeasonEntry }) {
	const t = useTranslations('uno')
	const locale = useUnoLocale()
	const title = t.has(season.title) ? t(season.title) : season.title

	return (
		<Card.Root
			className={
				season.isCurrent ? 'border-primary/70 ring-primary/60' : ''
			}
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
		</Card.Root>
	)
}
