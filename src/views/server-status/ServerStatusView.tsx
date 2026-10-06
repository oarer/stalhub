'use client'

import { Icon } from '@iconify/react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import {
	type ColumnDef,
	flexRender,
	Table,
	useTableSort,
} from '@/components/ui/Table'
import { Tabs } from '@/components/ui/Tabs'
import { cn } from '@/lib/cn'
import { serverOnlineQueries } from '@/queries/server-online/server-online.queries'
import type {
	EmissionInfo,
	ServerOnlinePeak,
} from '@/types/server-online.type'
import { OnlineChart } from '@/views/server-status/components/OnlineChart'
import { formatDate } from '@/lib/date'

const REGION_LABELS: Record<string, string> = {
	RU: 'Россия / СНГ (RU)',
	OFT: 'Общий (OFT)',
	EU: 'Европа (EU)',
	NA: 'Северная Америка (NA)',
	NEA: 'Северо-Восточная Азия (NEA)',
	SEA: 'Юго-Восточная Азия (SEA)',
	GLOBAL: 'Глобальный сервер (GLOBAL)',
}

const REGION_COLORS: Record<string, string> = {
	RU: 'text-primary',
	OFT: 'text-accent',
	EU: 'text-sky-400',
	NA: 'text-emerald-400',
	NEA: 'text-amber-400',
	SEA: 'text-rose-400',
	GLOBAL: 'text-violet-400',
}

const HISTORY_RANGES = [
	{ value: '6', hours: 6, label: '6H' },
	{ value: '24', hours: 24, label: '24H' },
	{ value: '168', hours: 168, label: '7D' },
]

const EMISSION_REGION_ORDER = ['RU', 'EU', 'NA', 'NEA', 'SEA']

export default function ServerStatusView() {
	const t = useTranslations()
	const { data: online } = useSuspenseQuery(serverOnlineQueries.latest())
	const [range, setRange] = useState('24')
	const [peakDays, setPeakDays] = useState(30)
	const activeRange =
		HISTORY_RANGES.find((r) => r.value === range) ?? HISTORY_RANGES[1]
	const { data: history, isPending: isHistoryPending } = useQuery(
		serverOnlineQueries.history(activeRange.hours)
	)
	const { data: peaks } = useQuery(serverOnlineQueries.peaks(peakDays))
	const { data: emissions } = useQuery(serverOnlineQueries.emissions())

	const onlineByRegion = new Map<string, number>()
	for (const entry of online ?? []) {
		if (entry.online == null || isNaN(entry.online)) continue
		onlineByRegion.set(
			entry.region,
			(onlineByRegion.get(entry.region) ?? 0) + entry.online
		)
	}

	const displayRegions = Object.keys(REGION_LABELS).filter(
		(r) => onlineByRegion.has(r) || r === 'RU'
	)

	const emissionList = useMemo<EmissionInfo[]>(() => {
		if (!emissions?.length) {
			return EMISSION_REGION_ORDER.map((region) => ({ region }))
		}
		return [...emissions].sort((a, b) => {
			const aIndex = EMISSION_REGION_ORDER.indexOf(a.region)
			const bIndex = EMISSION_REGION_ORDER.indexOf(b.region)
			if (aIndex === -1 && bIndex === -1) return a.region.localeCompare(b.region)
			if (aIndex === -1) return 1
			if (bIndex === -1) return -1
			return aIndex - bIndex
		})
	}, [emissions])

	const peakRows = useMemo<ServerOnlinePeak[]>(
		() => (peaks ?? []).slice(-14).reverse(),
		[peaks]
	)

	const peakColumns = useMemo<ColumnDef<ServerOnlinePeak>[]>(
		() => [
			{
				accessorKey: 'date',
				header: t('servers.peakDate'),
				cell: ({ row }) => (
					<span className="font-mono font-semibold">
						{row.original.date}
					</span>
				),
			},
			{
				accessorKey: 'region',
				header: t('servers.peakRegion'),
				cell: ({ row }) => row.original.region,
			},
			{
				accessorKey: 'peak',
				header: t('servers.peakOnline'),
				cell: ({ row }) => (
					<span className="font-mono font-semibold text-primary">
						{row.original.peak.toLocaleString()}
					</span>
				),
				meta: { align: 'right' },
			},
		],
		[t]
	)

	const { table: peaksTable } = useTableSort(peakRows, peakColumns)

	return (
		<section className="mx-auto max-w-380 space-y-8 px-4 pt-32 pb-12 sm:px-6">
			<h1
				className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
			>
				{t('servers.title')}
			</h1>

			<div className="space-y-4 rounded-xl bg-card px-5 py-4 shadow-lg ring-2 ring-primary/50 md:bg-card/50 md:backdrop-blur-md">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<Icon
							className="text-primary text-xl"
							icon="lucide:chart-line"
						/>
						<h2 className="font-medium text-lg">
							{t('servers.charts')}
						</h2>
					</div>
					<Tabs.Root onValueChange={setRange} value={range}>
						<Tabs.List className="ring-2 ring-primary/30">
							{HISTORY_RANGES.map((r) => (
								<Tabs.Trigger key={r.value} value={r.value}>
									{r.label}
								</Tabs.Trigger>
							))}
						</Tabs.List>
					</Tabs.Root>
				</div>

				{isHistoryPending ? (
					<Skeleton className="h-72 w-full" />
				) : (
					<OnlineChart history={history ?? []} />
				)}
			</div>

			<div className="space-y-4 rounded-xl bg-card px-5 py-4 shadow-lg ring-2 ring-primary/50 md:bg-card/50 md:backdrop-blur-md">
				<div className="flex items-center gap-2">
					<Icon
						className="text-primary text-xl"
						icon="lucide:radiation"
					/>
					<h2 className="font-medium text-lg">
						{t('servers.emissions')}
					</h2>
				</div>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{emissionList.map((data) => {
						const isActive = Boolean(data.currentStart)
						return (
							<div
								className="rounded-lg bg-accent/40 p-3 text-sm"
								key={data.region}
							>
								<div className="flex items-center justify-between gap-2">
									<div className="font-mono font-semibold">
										{data.region}
									</div>
									<Badge
										variant={
											isActive ? 'success' : 'secondary'
										}
									>
										{emissions
											? t(
													isActive
														? 'servers.emissionActive'
														: 'servers.emissionInactive'
												)
											: '…'}
									</Badge>
								</div>
								{emissions ? (
									<div className="mt-2 flex flex-col gap-1 text-text-accent">
										{isActive && data.currentStart ? (
											<span>
												{t('servers.emissionStarted')}:{' '}
												{formatDate(data.currentStart)}
											</span>
										) : null}
										<span className="font-medium text-text">
											{t('servers.emissionPrev')}:
										</span>
										<span>
											{t('servers.emissionStarted')}:{' '}
											{formatDate(data.previousStart)}
										</span>
										<span>
											{t('servers.emissionEnded')}:{' '}
											{formatDate(data.previousEnd)}
										</span>
									</div>
								) : (
									<span className="text-text-accent">…</span>
								)}
							</div>
						)
					})}
				</div>
			</div>

			<div className="space-y-4 rounded-xl bg-card px-5 py-4 shadow-lg ring-2 ring-primary/50 md:bg-card/50 md:backdrop-blur-md">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<Icon
							className="text-primary text-xl"
							icon="lucide:trophy"
						/>
						<h2 className="font-medium text-lg">
							{t('servers.peaks')}
						</h2>
					</div>
					<Tabs.Root
						onValueChange={(v) => setPeakDays(Number(v))}
						value={String(peakDays)}
					>
						<Tabs.List className="ring-2 ring-primary/30">
							<Tabs.Trigger value="7">7D</Tabs.Trigger>
							<Tabs.Trigger value="30">30D</Tabs.Trigger>
						</Tabs.List>
					</Tabs.Root>
				</div>
				<Table.Root>
					<Table.Header>
						{peaksTable.getHeaderGroups().map((headerGroup) => (
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
						{peaksTable.getRowModel().rows.map((row) => (
							<Table.Row
								key={`${row.original.region}-${row.original.date}`}
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
						))}
					</Table.Body>
				</Table.Root>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{displayRegions.map((region) => (
					<div
						className="flex flex-col gap-2 rounded-xl bg-card px-5 py-4 shadow-lg ring-2 ring-primary/50 md:bg-card/50 md:backdrop-blur-md"
						key={region}
					>
						<div className="flex items-center gap-2">
							<Icon
								className={`text-xl ${REGION_COLORS[region] ?? 'text-primary'}`}
								icon="lucide:map-pin"
							/>
							<h2 className="font-medium text-lg">
								{REGION_LABELS[region]}
							</h2>
						</div>

						<div className="flex items-center gap-1.5 font-medium">
							<Icon
								className="text-lg text-primary"
								icon="lucide:users"
							/>
							<span className="text-muted-foreground text-sm">
								{t('servers.online')}:
							</span>
							<span
								className={cn(
									'font-mono',
									'text-sm',
									onlineByRegion.get(region)
										? 'text-primary'
										: 'text-muted-foreground'
								)}
							>
								{onlineByRegion.get(region)?.toLocaleString() ??
									'—'}
							</span>
						</div>
					</div>
				))}
			</div>
		</section>
	)
}
