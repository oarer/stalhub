'use client'

import { Icon } from '@iconify/react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { montserrat, unbounded } from '@/app/fonts'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs } from '@/components/ui/Tabs'
import { serverOnlineQueries } from '@/queries/server-online/server-online.queries'
import { OnlineChart } from '@/views/server-status/components/OnlineChart'
import { cn } from '@/lib/cn'

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
	const activeRange =
		HISTORY_RANGES.find((r) => r.value === range) ?? HISTORY_RANGES[1]
	const { data: history, isPending: isHistoryPending } = useQuery(
		serverOnlineQueries.history(activeRange.hours)
	)

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
			<div className="flex items-center gap-3">
				<Icon className="text-3xl text-primary" icon="lucide:server" />
				<h1
					className={`${unbounded.className} font-semibold text-2xl sm:text-3xl`}
				>
					{t('servers.title')}
				</h1>
			</div>

			<div className="space-y-4 rounded-xl bg-card px-5 py-4 shadow-lg ring-2 ring-primary/50 md:bg-card/50 md:backdrop-blur-md">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<Icon
							className="text-primary text-xl"
							icon="lucide:chart-line"
						/>
						<h2 className="font-semibold text-lg">
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
							<h2 className="font-semibold text-lg">
								{REGION_LABELS[region]}
							</h2>
						</div>

						<div className="flex items-center gap-1.5 font-semibold">
							<Icon
								className="text-lg text-primary"
								icon="lucide:users"
							/>
							<span className="text-muted-foreground text-sm">
								{t('servers.online')}:
							</span>
							<span
								className={cn(
									montserrat.className,
									'text-sm',
									onlineByRegion.get(region)
										? 'text-primary'
										: 'text-muted-foreground')
								}
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
