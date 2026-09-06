'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { ColumnDef } from '@/components/ui/Table'
import { flexRender, Table, useTableSort } from '@/components/ui/Table'
import { cn } from '@/lib/cn'
import type { MapEval } from '../utils/sessions'

interface SessionsTableProps {
	rankings: MapEval[]
	bestMapId: string | null
}

const formatMatchTime = (
	matchMin: number,
	shortHours: string,
	shortMin: string
) => {
	const h = Math.floor(matchMin / 60)
	const mn = Math.round(matchMin % 60)
	return h > 0 ? `${h}${shortHours} ${mn}${shortMin}` : `${mn}${shortMin}`
}

export function SessionsTable({ rankings, bestMapId }: SessionsTableProps) {
	const t = useTranslations()

	const columns = useMemo<ColumnDef<MapEval>[]>(
		() => [
			{
				accessorFn: (row) => row.map.label,
				id: 'map',
				header: t('sessions.map'),
				cell: ({ row }) => (
					<span className="flex items-center gap-2">
						{row.original.map.id === bestMapId && (
							<Icon
								className="text-primary"
								icon="lucide:swords"
							/>
						)}
						{row.original.map.label}
					</span>
				),
			},
			{
				accessorFn: (row) => row.profile.killsTarget,
				id: 'kills',
				header: t('sessions.kills'),
				cell: ({ cell }) => (
					<span className={montserrat.className}>
						{cell.getValue<number>().toLocaleString()}
					</span>
				),
			},
			{
				accessorFn: (row) => row.profile.assists,
				id: 'assists',
				header: t('sessions.assists'),
				cell: ({ cell }) => (
					<span className={montserrat.className}>
						{cell.getValue<number>().toLocaleString()}
					</span>
				),
			},
			{
				accessorFn: (row) => row.profile.caps,
				id: 'caps',
				header: t('sessions.caps'),
				cell: ({ cell }) => (
					<span className={montserrat.className}>
						{cell.getValue<number>().toLocaleString()}
					</span>
				),
			},
			{
				accessorFn: (row) => row.matchMin,
				id: 'timeMatch',
				header: t('sessions.time_match'),
				cell: ({ cell }) => (
					<span className={montserrat.className}>
						{formatMatchTime(
							cell.getValue<number>(),
							t('sessions.hours_short'),
							t('sessions.minutes_short')
						)}
					</span>
				),
			},
			{
				accessorFn: (row) => row.matchesPerDay,
				id: 'matchesPerDay',
				header: t('sessions.matches_per_day_short'),
				cell: ({ cell }) => (
					<span className={montserrat.className}>
						{cell.getValue<number>().toLocaleString()}
					</span>
				),
			},
			{
				accessorFn: (row) => row.repPerDay,
				id: 'repPerDay',
				header: t('sessions.rep_per_day'),
				cell: ({ cell }) => (
					<span className={montserrat.className}>
						{cell.getValue<number>().toLocaleString()}
					</span>
				),
			},
			{
				accessorFn: (row) => row.repPerHour,
				id: 'repPerHour',
				header: t('sessions.rep_per_hour'),
				cell: ({ cell }) => (
					<Badge variant="secondary">
						<span className={`${montserrat.className} text-xs`}>
							{cell.getValue<number>().toLocaleString('en-US', {
								maximumFractionDigits: 1,
							})}
						</span>
					</Badge>
				),
			},
		],
		[t, bestMapId]
	)

	const { table } = useTableSort(rankings, columns, [
		{ id: 'repPerDay', desc: true },
	])

	return (
		<Card.Root className="flex flex-col gap-4">
			<Card.Header>
				<Card.Title>
					<Icon
						className="text-neutral-700 text-xl dark:text-neutral-300"
						icon="lucide:table"
					/>
					<h2>{t('sessions.comparison')}</h2>
				</Card.Title>
			</Card.Header>

			<Card.Content>
				{rankings.length === 0 ? (
					<p className="text-muted-foreground text-sm">
						{t('sessions.select_maps_hint')}
					</p>
				) : (
					<Table.Root className="font-semibold">
						<Table.Header>
							{table.getHeaderGroups().map((headerGroup) => (
								<Table.Row key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<Table.SortableHeader
											column={header.column}
											key={header.id}
										>
											{flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
										</Table.SortableHeader>
									))}
								</Table.Row>
							))}
						</Table.Header>
						<Table.Body>
							{table.getRowModel().rows.map((row) => {
								const isBest = row.original.map.id === bestMapId

								return (
									<Table.Row
										className={cn(
											isBest && 'bg-primary/10 font-bold'
										)}
										key={row.id}
									>
										{row.getVisibleCells().map((cell) => (
											<Table.Cell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext()
												)}
											</Table.Cell>
										))}
									</Table.Row>
								)
							})}
						</Table.Body>
					</Table.Root>
				)}
			</Card.Content>
		</Card.Root>
	)
}
