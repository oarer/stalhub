'use client'

import { Icon } from '@iconify/react'
import type { ChartOptions, TooltipItem } from 'chart.js'
import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	Title,
	Tooltip,
} from 'chart.js'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import {
	alignClass,
	type ColumnAlign,
	type ColumnDef,
	flexRender,
	getColumnAlign,
	Table,
	useTableSort,
} from '@/components/ui/Table'
import { formatDate, mskDate } from '@/lib/date'
import type { GrenadeStagesResponse } from '@/types/clan/clan.type'
import { STAGE_TYPE_COLORS } from '@/views/clan/clan.const'
import {
	formatKd,
	formatKda,
	kdaValue,
	kdClass,
	kdValue,
} from '@/views/clan/clan.utils'
import { Section } from '../../../me/components/Section'
import type { PlayerAgg, StageEntry } from './stats.utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface PlayerListProps {
	players: PlayerAgg[]
	grenades: Map<string, number>
	grenadeStages: GrenadeStagesResponse
	selected: string | null
	onSelect: (name: string | null) => void
}

function stageGrenades(
	playerStages: StageEntry[],
	playerName: string,
	grenadeStages: GrenadeStagesResponse
): Map<number, number> {
	const playerKey = playerName.trim().toLowerCase()
	const byDate = new Map<string, Array<Map<string, number>>>()
	for (const event of grenadeStages.events) {
		const stages = event.stages.map((s) => {
			const map = new Map<string, number>()
			for (const m of s.members) {
				map.set(m.name.trim().toLowerCase(), m.grenades)
			}
			return map
		})
		byDate.set(event.raid_date, stages)
	}

	const byPlayerDate = new Map<string, StageEntry[]>()
	for (const s of playerStages) {
		const date = mskDate(new Date(s.started_at))
		const arr = byPlayerDate.get(date) ?? []
		arr.push(s)
		byPlayerDate.set(date, arr)
	}

	const result = new Map<number, number>()
	for (const [date, arr] of byPlayerDate) {
		const gStages = byDate.get(date) ?? []
		arr.forEach((s, i) => {
			result.set(s.session_id, gStages[i]?.get(playerKey) ?? 0)
		})
	}
	return result
}

export function PlayerList({
	players,
	grenades,
	grenadeStages,
	selected,
	onSelect,
}: PlayerListProps) {
	const selectedPlayer = players.find((p) => p.name === selected) ?? null
	const t = useTranslations()

	const { resolvedTheme } = useTheme()
	const isDark = resolvedTheme === 'dark'
	const axisColor = isDark ? '#a3a3a3' : '#525252'
	const gridColor = isDark ? '#3f3f46' : '#e5e5e5'

	const chartRows = useMemo(() => {
		if (!selectedPlayer) return []
		const stages = selectedPlayer.stages
			.slice()
			.sort((a, b) => a.started_at.localeCompare(b.started_at))
		const grenadeByStage = stageGrenades(
			stages,
			selectedPlayer.name,
			grenadeStages
		)
		return stages.map((s) => ({
			label: formatDate(s.started_at),
			kd: kdValue(s.kills, s.deaths),
			grenades: grenadeByStage.get(s.session_id) ?? 0,
		}))
	}, [selectedPlayer, grenadeStages])

	const chartData = {
		labels: chartRows.map((r) => r.label),
		datasets: [
			{
				label: t('clan.charts.kdShort'),
				data: chartRows.map((r) => r.kd),
				backgroundColor: '#0092D1',
				borderRadius: 4,
			},
			{
				label: t('clan.metrics.grenades'),
				data: chartRows.map((r) => r.grenades),
				backgroundColor: '#84cc16',
				borderRadius: 4,
			},
		],
	}

	const barOptions: ChartOptions<'bar'> = {
		maintainAspectRatio: false,
		responsive: true,
		plugins: {
			legend: {
				display: true,
				position: 'top',
				labels: {
					usePointStyle: true,
					pointStyle: 'rectRounded',
					boxWidth: 10,
					boxHeight: 10,
					padding: 12,
					color: isDark ? '#c2c2c2' : '#404040',
					font: {
						size: 12,
						weight: 'bold',
						family: montserrat.style.fontFamily,
					},
				},
			},
			title: { display: false },
			tooltip: {
				backgroundColor: isDark ? '#080808' : '#fff',
				titleColor: isDark ? '#fbfbfe' : '#171717',
				bodyColor: isDark ? '#d4d4d4' : '#525252',
				borderColor: isDark ? '#3d4a52' : '#e5e5e5',
				borderWidth: 1,
				titleFont: { size: 13, weight: 'bold' },
				bodyFont: { size: 12, weight: 'bold' },
				padding: 10,
				callbacks: {
					label: (item: TooltipItem<'bar'>) =>
						`${item.dataset.label}: ${Number(item.raw ?? 0).toFixed(2)}`,
				},
			},
		},
		scales: {
			x: {
				ticks: {
					color: axisColor,
					maxRotation: 45,
					font: { size: 11, weight: 'bold' },
				},
				grid: { display: false },
			},
			y: {
				beginAtZero: true,
				ticks: {
					color: axisColor,
					font: { size: 11, weight: 'bold' },
				},
				grid: { color: gridColor },
			},
		},
	}

	const columns = useMemo<ColumnDef<PlayerAgg>[]>(
		() => [
			{
				accessorKey: 'name',
				header: t('clan.common.player'),
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						<span>{row.original.name}</span>
						<Badge variant="secondary">
							{t('clan.stats.stageCount', {
								count: row.original.stages.length,
							})}
						</Badge>
					</div>
				),
			},
			{
				accessorKey: 'kills',
				header: t('clan.common.killsShort'),
				meta: { align: 'center' satisfies ColumnAlign },
				cell: ({ row }) => row.original.kills,
			},
			{
				accessorKey: 'deaths',
				header: t('clan.common.deathsShort'),
				meta: { align: 'center' satisfies ColumnAlign },
				cell: ({ row }) => row.original.deaths,
			},
			{
				accessorKey: 'assists',
				header: t('clan.common.assistsShort'),
				meta: { align: 'center' satisfies ColumnAlign },
				cell: ({ row }) => row.original.assists,
			},
			{
				id: 'kda',
				accessorFn: (p) => kdaValue(p.kills, p.deaths, p.assists),
				header: t('clan.common.kda'),
				meta: { align: 'center' satisfies ColumnAlign },
				cell: ({ row }) => (
					<span
						className={kdClass(
							row.original.kills,
							row.original.deaths
						)}
					>
						{formatKda(
							row.original.kills,
							row.original.deaths,
							row.original.assists
						)}
					</span>
				),
			},
			{
				id: 'kd',
				accessorFn: (p) => kdValue(p.kills, p.deaths),
				header: t('clan.common.kd'),
				meta: { align: 'center' satisfies ColumnAlign },
				cell: ({ row }) => (
					<span
						className={kdClass(
							row.original.kills,
							row.original.deaths
						)}
					>
						{formatKd(row.original.kills, row.original.deaths)}
					</span>
				),
			},
			{
				id: 'grenades',
				accessorFn: (p) =>
					grenades.get(p.name.trim().toLowerCase()) ?? 0,
				header: t('clan.common.grenadesShort'),
				meta: { align: 'center' satisfies ColumnAlign },
				cell: ({ row }) => (
					<span>
						{(
							grenades.get(
								row.original.name.trim().toLowerCase()
							) ?? 0
						).toLocaleString()}
					</span>
				),
			},
			{
				id: 'expand',
				header: '',
				enableSorting: false,
				meta: { align: 'center' satisfies ColumnAlign },
				cell: () => (
					<Icon
						className="text-text-accent"
						icon="lucide:chevron-right"
					/>
				),
			},
		],
		[grenades, t]
	)

	const { table } = useTableSort(players, columns, [
		{ id: 'kills', desc: true },
	])

	return (
		<Section title={t('clan.stats.title')}>
			<div className="rounded-lg p-3">
				<Table.Root className="font-semibold">
					<Table.Header>
						{table.getHeaderGroups().map((headerGroup) => (
							<Table.Row
								className={`${montserrat.className} text-xs`}
								key={headerGroup.id}
							>
								{headerGroup.headers.map((header) => {
									const align = getColumnAlign(header.column)
									return header.column.getCanSort() ? (
										<Table.SortableHeader
											align={align}
											column={header.column}
											key={header.id}
										>
											{flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
										</Table.SortableHeader>
									) : (
										<Table.Head
											className={alignClass(align)}
											key={header.id}
										>
											{flexRender(
												header.column.columnDef.header,
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
							<Table.Row
								className={`${montserrat.className} cursor-pointer hover:bg-accent/50`}
								key={row.id}
								onClick={() => onSelect(row.original.name)}
							>
								{row.getVisibleCells().map((cell) => (
									<Table.Cell
										className={alignClass(
											getColumnAlign(cell.column)
										)}
										key={cell.id}
									>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext()
										)}
									</Table.Cell>
								))}
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			</div>

			<Modal.Root
				onOpenChange={(open) => {
					if (!open) onSelect(null)
				}}
				open={selected != null}
			>
				<Modal.Content className="max-w-xl" fullScreen={false}>
					<Modal.Header>
						<Modal.Title>{selectedPlayer?.name}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{selectedPlayer ? (
							<div className="flex flex-col gap-3">
								{chartRows.length > 0 && (
									<div className="h-48">
										<Bar
											data={chartData}
											options={barOptions}
										/>
									</div>
								)}
								<div className="flex flex-col gap-2">
									{selectedPlayer.stages
										.slice()
										.sort((a, b) =>
											b.started_at.localeCompare(
												a.started_at
											)
										)
										.map((s) => (
											<div
												className="flex items-center justify-between rounded-lg bg-accent/50 px-3 py-2"
												key={`${s.session_id}-${s.map_name}`}
											>
												<div className="flex flex-col gap-2">
													<div className="flex items-center gap-2">
														<Badge
															className={
																STAGE_TYPE_COLORS[
																	s.type
																] ?? ''
															}
															variant="secondary"
														>
															{t(
																`clan.stage.${s.type}`
															)}
														</Badge>
														<span className="font-semibold">
															{s.map_name || '—'}
														</span>
														<span
															className={`rounded px-1.5 py-0.5 font-semibold text-xs ${
																s.victory
																	? 'bg-green-500/20 text-success'
																	: 'bg-red-500/20 text-destructive'
															}`}
														>
															{s.victory
																? t(
																		'clan.common.victory'
																	)
																: t(
																		'clan.common.defeat'
																	)}
														</span>
													</div>
													<span
														className={`${montserrat.className} font-semibold text-text-accent text-xs`}
													>
														{formatDate(
															s.started_at
														)}
													</span>
												</div>
												<span
													className={`${montserrat.className} font-semibold text-sm text-text-accent`}
												>
													{s.kills}{' '}
													{t(
														'clan.common.killsShort'
													)}
													. · {s.deaths}{' '}
													{t(
														'clan.common.deathsShort'
													)}
													. |{' '}
													<span
														className={`font-semibold ${kdClass(s.kills, s.deaths)}`}
													>
														{formatKd(
															s.kills,
															s.deaths
														)}
													</span>
												</span>
											</div>
										))}
								</div>
							</div>
						) : null}
					</Modal.Body>
					<Modal.Footer>
						<Modal.Close>{t('clan.common.close')}</Modal.Close>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</Section>
	)
}
