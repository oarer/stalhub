'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { CLink } from '@/components/ui/Link'
import type { UnoClanSummary } from '@/types/uno/uno.type'
import { useUnoLocale } from '../../hooks/useUnoLocale'
import { formatUnoValue } from '../../utils/uno.utils'
import { UnoFaction } from '../UnoFaction'

export function CompareClanCard({ clan }: { clan: UnoClanSummary }) {
	const t = useTranslations('uno')
	const locale = useUnoLocale()

	return (
		<Card.Root>
			<Card.Header>
				<p className="font-mono font-semibold text-muted-foreground text-xs">
					{clan.tag ? `[${clan.tag}]` : clan.id}
				</p>
				<Card.Title className="font-semibold text-xl">
					{clan.name}
				</Card.Title>
				<Card.Description className="mt-1">
					<UnoFaction faction={clan.faction} size={18} />
				</Card.Description>
			</Card.Header>
			<div className="mt-4 grid grid-cols-2 gap-3 text-sm">
				<span>
					{t('stats.rating')}:{' '}
					<strong>{formatUnoValue(clan.rating, locale)}</strong>
				</span>
				<span>
					{t('stats.rank')}:{' '}
					<strong>{formatUnoValue(clan.position, locale)}</strong>
				</span>
			</div>
			<CLink
				className="mt-3 w-fit gap-1 px-0"
				href={`/uno/clans/${encodeURIComponent(clan.id)}`}
				size="sm"
				variant="ghost"
			>
				{t('compare.openClan')}
				<Icon icon="lucide:arrow-up-right" />
			</CLink>
		</Card.Root>
	)
}
