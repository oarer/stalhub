'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { type ColumnDef, Table, useTableSort } from '@/components/ui/Table'
import type { GrenadeBoxEntry, GrenadeStageEvent } from '@/types/clan/clan.type'

function formatDate(raid_date: string) {
	const [y, m, d] = raid_date.split('-')
	return `${d}.${m}.${y}`
}

function BoxesSummary({ boxes }: { boxes: GrenadeBoxEntry[] }) {
	const t = useTranslations()
	if (boxes.length === 0) return null

	const grouped = boxes.reduce(
		(acc, b) => {
			acc[b.type] = (acc[b.type] ?? 0) + b.count
			return acc
		},
		{} as Record<string, number>
	)

	const totalGrenades = boxes.reduce((s, b) => s + b.count * 10, 0)

	return (
		<div className="flex flex-wrap items-center gap-2">
			{Object.entries(grouped).map(([type, count]) => (
				<Badge key={type} variant="secondary">
					{type}: {count} {t('clan.grenades.boxes')}
				</Badge>
			))}
			<Badge variant="secondary">
				{t('clan.grenades.totalGrenades', {
					count: totalGrenades,
				})}
			</Badge>
		</div>
	)
}

interface MemberRow {
	name: string
	grenades: number
	stages: number[]
	playerBoxGrenades: number
}

export function EventCard({ event }: { event: GrenadeStageEvent }) {
	const t = useTranslations()
	const members = event.total
	const maxTotal = members[0]?.grenades ?? 0

	const data = useMemo<MemberRow[]>(
		() =>
			members.map((m) => {
				const stages = event.stages.map((s) => {
					const found = s.members.find((sm) => sm.name === m.name)
					return found?.grenades ?? 0
				})
				const playerBoxGrenades = event.boxes
					.filter((b) => b.name === m.name)
					.reduce((s, b) => s + b.count * 10, 0)
				return {
					name: m.name,
					grenades: m.grenades,
					stages,
					playerBoxGrenades,
				}
			}),
		[members, event.stages, event.boxes]
	)

	const columns = useMemo<ColumnDef<MemberRow>[]>(
		() => [
			{
				accessorKey: 'name',
				header: () => t('clan.grenades.player'),
				cell: ({ row }) => (
					<div className="min-w-0 truncate">
						<span className="font-semibold text-sm">
							{row.original.name}
						</span>
						{row.original.playerBoxGrenades > 0 && (
							<span className="ml-1 text-muted-foreground text-xs">
								({row.original.playerBoxGrenades}{' '}
								{t('clan.grenades.fromBoxes')})
							</span>
						)}
					</div>
				),
				meta: { align: 'left' },
			},
			...event.stages.map((s, i) => ({
				id: `stage_${s.stage}`,
				header: () => t('clan.grenades.stage', { stage: s.stage }),
				cell: ({ row }: { row: { original: MemberRow } }) => (
					<span
						className={`${montserrat.className} font-semibold text-sm`}
					>
						{row.original.stages[i] ?? 0}
					</span>
				),
				meta: { align: 'center' as const },
			})),
			{
				accessorKey: 'grenades',
				header: () => t('clan.grenades.total'),
				cell: ({ row }) => (
					<div className="flex flex-col gap-1">
						<span
							className={`${montserrat.className} text-right font-semibold text-sm`}
						>
							{row.original.grenades}
						</span>
						<div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-linear-to-r from-muted/50 to-primary"
								style={{
									width: `${
										maxTotal > 0
											? (
													row.original.grenades /
														maxTotal
												) * 100
											: 0
									}%`,
								}}
							/>
						</div>
					</div>
				),
				meta: { align: 'right' },
			},
		],
		[event.stages, maxTotal, t]
	)

	const { table } = useTableSort(data, columns, [
		{ id: 'grenades', desc: true },
	])

	const cols = event.stages.length

	return (
		<div className="flex flex-col gap-2 rounded-xl bg-card px-5 py-4">
			<div
				className={`${montserrat.className} flex items-center gap-2 font-semibold text-lg`}
			>
				<Icon className="text-xl" icon="lucide:bomb" />
				{t(`clan.stage.${event.event_type}`) || event.event_type} —{' '}
				{formatDate(event.raid_date)}
				<Badge className={montserrat.className} variant="secondary">
					{t('clan.grenades.stageCount', { count: cols })}
				</Badge>
			</div>
			<BoxesSummary boxes={event.boxes} />
			{members.length === 0 ? (
				<p className="py-2 text-muted-foreground text-sm">
					{t('clan.grenades.noData')}
				</p>
			) : (
				<Table.Root className="mt-2">
					<Table.Header>
						{table.getHeaderGroups().map((headerGroup) => (
							<Table.Row key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									const align =
										(
											header.column.columnDef.meta as
												| { align?: string }
												| undefined
										)?.align ?? 'left'
									return (
										<Table.Head
											className={
												align === 'center'
													? 'text-center'
													: align === 'right'
														? 'text-right'
														: 'text-left'
											}
											key={header.id}
										>
											{header.isPlaceholder
												? null
												: Table.flexRender(
														header.column.columnDef
															.header,
														header.getContext()
													)}
										</Table.Head>
									)
								})}
							</Table.Row>
						))}
					</Table.Header>
					<Table.Body>
						{table.getRowModel().rows.map((row) => (
							<Table.Row key={row.id}>
								{row.getVisibleCells().map((cell) => {
									const align =
										(
											cell.column.columnDef.meta as
												| { align?: string }
												| undefined
										)?.align ?? 'left'
									return (
										<Table.Cell
											className={
												align === 'center'
													? 'text-center'
													: align === 'right'
														? 'text-right'
														: 'text-left'
											}
											key={cell.id}
										>
											{Table.flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</Table.Cell>
									)
								})}
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			)}
		</div>
	)
}
