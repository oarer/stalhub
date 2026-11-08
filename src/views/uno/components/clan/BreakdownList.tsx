'use client'

import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import type { UnoBreakdown } from '@/types/uno/uno.type'
import { useUnoLocale } from '../../hooks/useUnoLocale'
import { formatUnoPercent, formatUnoValue } from '../../utils/uno.utils'
import { UnoEmpty } from '../UnoEmpty'

export function BreakdownList({
	title,
	items,
}: {
	title: string
	items: UnoBreakdown[]
}) {
	const t = useTranslations('uno')
	const locale = useUnoLocale()
	if (items.length === 0) return <UnoEmpty>{t('empty.section')}</UnoEmpty>
	return (
		<Card.Root className="gap-0 overflow-hidden p-0">
			<Card.Header className="border-primary/20 border-b px-5 py-4">
				<Card.Title className="font-semibold">{title}</Card.Title>
			</Card.Header>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head className="px-5">
							{t('compare.metric')}
						</Table.Head>
						<Table.Head className="px-5 text-right">
							{t('stats.winRate')}
						</Table.Head>
						<Table.Head className="hidden px-5 text-right sm:table-cell">
							{t('stats.matches')}
						</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{items.map((item) => (
						<Table.Row key={item.key}>
							<Table.Cell className="px-5 font-medium">
								{item.label}
							</Table.Cell>
							<Table.Cell className="px-5 text-right font-mono font-semibold text-sm">
								{formatUnoPercent(item.winRate, locale)}
							</Table.Cell>
							<Table.Cell className="hidden px-5 text-right font-mono font-semibold text-muted-foreground text-sm sm:table-cell">
								{formatUnoValue(item.matches, locale)}
							</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table.Root>
		</Card.Root>
	)
}
