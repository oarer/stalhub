'use client'

import { Icon } from '@iconify/react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs } from '@/components/ui/Tabs'
import { cn } from '@/lib/cn'
import { serverOnlineQueries } from '@/queries/server-online/server-online.queries'
import { OnlineChart } from '@/views/server-status/components/OnlineChart'

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
	const { data: emissionRU } = useQuery(serverOnlineQueries.emissions('RU'))
	const { data: emissionEU } = useQuery(serverOnlineQueries.emissions('EU'))

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
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{[
						{ label: 'RU', data: emissionRU },
						{ label: 'EU', data: emissionEU },
					].map(({ label, data }) => (
						<div
							className="rounded-lg bg-accent/40 p-3 text-sm"
							key={label}
						>
							<div className="font-mono font-semibold">
								{label}
							</div>
							{data ? (
								<div className="mt-1 flex flex-col gap-1 text-text-accent">
									<span>
										{t('servers.emissionCurrent')}:{' '}
										{data.currentStart
											? new Date(
													data.currentStart
												).toLocaleString()
											: '—'}
									</span>
									<span>
										{t('servers.emissionPrev')}:{' '}
										{data.previousStart
											? new Date(
													data.previousStart
												).toLocaleString()
											: '—'}
									</span>
								</div>
							) : (
								<span className="text-text-accent">…</span>
							)}
						</div>
					))}
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
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="text-left text-text-accent">
								<th className="py-1 pr-4 font-medium">
									{t('servers.peakDate')}
								</th>
								<th className="py-1 pr-4 font-medium">
									{t('servers.peakRegion')}
								</th>
								<th className="py-1 font-medium">
									{t('servers.peakOnline')}
								</th>
							</tr>
						</thead>
						<tbody>
							{(peaks ?? [])
								.slice(-14)
								.reverse()
								.map((p) => (
									<tr
										className="border-border/50 border-t"
										key={`${p.region}-${p.date}`}
									>
										<td className="py-1 pr-4 font-mono">
											{p.date}
										</td>
										<td className="py-1 pr-4">
											{p.region}
										</td>
										<td className="py-1 font-mono text-primary">
											{p.peak.toLocaleString()}
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
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
