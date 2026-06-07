'use client'

import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import { useTranslations } from 'next-intl'
interface TTKSummaryRow {
	label: string
	color: string
	ttk0: number
	ttkMax: number
	shots0: number
	shotsMax: number
}

interface TTKSummaryTableProps {
	rows: TTKSummaryRow[]
	maxDist: number
}

export function TTKSummaryTable({ rows, maxDist }: TTKSummaryTableProps) {
	const t = useTranslations()

	return (
		<Card.Root className="z-0">
			<Table.Root className="w-full font-semibold text-sm">
				<Table.Header>
					<Table.Row className="text-left text-neutral-400 text-xs">
						<Table.Head className="pr-4 pb-2">
							{t('ttk.page.weapon')}
						</Table.Head>
						<Table.Head className="pr-4 pb-2">
							{t('ttk.page.table.ttk')} (0 {t('unit.meter')})
						</Table.Head>
						<Table.Head className="pr-4 pb-2">
							{t('ttk.page.table.hits')} (0 {t('unit.meter')})
						</Table.Head>
						<Table.Head className="pr-4 pb-2">
							{t('ttk.page.table.ttk')} ({maxDist}{' '}
							{t('unit.meter')})
						</Table.Head>
						<Table.Head className="pb-2">
							{t('ttk.page.table.hits')} ({maxDist}{' '}
							{t('unit.meter')})
						</Table.Head>
					</Table.Row>
				</Table.Header>

				<Table.Body>
					{rows.map((row) => (
						<Table.Row className="last:border-0" key={row.label}>
							<Table.Cell className="py-2 pr-4">
								<span className="flex items-center gap-2">
									<span
										className="h-2 w-2 shrink-0 rounded-full"
										style={{ background: row.color }}
									/>
									<span>{row.label}</span>
								</span>
							</Table.Cell>

							<Table.Cell className="py-2 pr-4 font-mono text-yellow-400">
								{row.ttk0.toFixed(3)}с
							</Table.Cell>

							<Table.Cell className="py-2 pr-4 font-mono text-blue-400">
								{row.shots0}
							</Table.Cell>

							<Table.Cell className="py-2 pr-4 font-mono text-yellow-400">
								{row.ttkMax.toFixed(3)}с
							</Table.Cell>

							<Table.Cell className="py-2 font-mono text-blue-400">
								{row.shotsMax}
							</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table.Root>
		</Card.Root>
	)
}
