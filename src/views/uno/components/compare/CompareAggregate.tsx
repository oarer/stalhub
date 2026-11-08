'use client'

import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { useUnoLocale } from '../../hooks/useUnoLocale'
import { formatUnoPercent, formatUnoValue } from '../../utils/uno.utils'
import { UnoStat } from '../UnoStat'

export interface AggregateRow {
	key: string
	label: string
	value: number | string | null
}

export function CompareAggregate({ rows }: { rows: AggregateRow[] }) {
	const t = useTranslations('uno')
	const locale = useUnoLocale()

	if (rows.length === 0) return null

	return (
		<Card.Root>
			<Card.Header>
				<Card.Title className="font-semibold">
					{t('compare.aggregateTitle')}
				</Card.Title>
				<Card.Description>
					{t('compare.aggregateDescription')}
				</Card.Description>
			</Card.Header>
			<div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{rows.map((row) => (
					<UnoStat
						key={row.key}
						label={row.label}
						value={
							row.key === 'winRate'
								? formatUnoPercent(row.value, locale)
								: formatUnoValue(row.value, locale)
						}
					/>
				))}
			</div>
		</Card.Root>
	)
}
