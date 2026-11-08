'use client'

import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import type { UnoComparisonResponse } from '@/types/uno/uno.type'
import { useUnoLocale } from '../../hooks/useUnoLocale'
import { formatUnoPercent, formatUnoValue } from '../../utils/uno.utils'

export function CompareMetricsTable({
	comparison,
}: {
	comparison: UnoComparisonResponse
}) {
	const t = useTranslations('uno')
	const locale = useUnoLocale()

	if (comparison.metrics.length === 0) return null

	return (
		<Card.Root className="overflow-hidden p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head className="px-5">
							{t('compare.metric')}
						</Table.Head>
						<Table.Head className="px-5 text-right">
							{comparison.left.name}
						</Table.Head>
						<Table.Head className="px-5 text-right">
							{comparison.right.name}
						</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{comparison.metrics.map((metric) => (
						<Table.Row key={metric.key}>
							<Table.Cell className="px-5 font-medium">
								{t(`compare.metrics.${metric.key}`)}
							</Table.Cell>
							<Table.Cell className="px-5 text-right font-mono font-semibold">
								{metric.key === 'win_rate'
									? formatUnoPercent(metric.left, locale)
									: `${formatUnoValue(metric.left, locale)}${metric.unit ?? ''}`}
							</Table.Cell>
							<Table.Cell className="px-5 text-right font-mono font-semibold">
								{metric.key === 'win_rate'
									? formatUnoPercent(metric.right, locale)
									: `${formatUnoValue(metric.right, locale)}${metric.unit ?? ''}`}
							</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table.Root>
		</Card.Root>
	)
}
