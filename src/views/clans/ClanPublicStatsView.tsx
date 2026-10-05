'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { mtsExtended } from '@/app/fonts'
import { Skeleton } from '@/components/ui/Skeleton'
import { Table } from '@/components/ui/Table'
import { clanQueries } from '@/queries/clan/clan.queries'
import { StatCard } from '@/views/clan/components/dashboard/StatCard'
import { formatKd, kdClass } from '@/views/clan/clan.utils'

export default function ClanPublicStatsView() {
	const t = useTranslations()
	const { data, isLoading } = useSuspenseQuery(
		clanQueries.getPublicClansStats()
	)

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-64 w-full" />
			</div>
		)
	}

	const rows = data.clans
	const total = data.total

	return (
		<section className="mx-auto max-w-380 space-y-6 px-4 pt-32 pb-12 sm:px-6">
			<h1
				className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
			>
				{t('clans.statsTitle')}
			</h1>

			{total && (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
					<StatCard
						icon="lucide:users"
						label={t('clans.statsClans')}
						value={total.clans}
					/>
					<StatCard
						icon="lucide:swords"
						label={t('clan.common.games')}
						value={total.battles}
					/>
					<StatCard
						icon="lucide:crown"
						label={t('clans.winrateAvg')}
						value={`${Math.round(total.winrate * 100)}%`}
					/>
					<StatCard
						icon="lucide:crosshair"
						label={t('clan.stats.clanKd')}
						value={formatKd(total.kills, total.deaths)}
					/>
					<StatCard
						icon="lucide:skull"
						label={t('clans.statsKills')}
						value={total.kills}
					/>
				</div>
			)}

			{rows.length === 0 ? (
				<div className="flex flex-col items-center gap-2 rounded-xl bg-card px-5 py-6">
					<Icon className="text-4xl" icon="lucide:bar-chart-3" />
					<h3 className="font-semibold text-lg">{t('clans.statsEmpty')}</h3>
				</div>
			) : (
				<div className="rounded-xl bg-card px-5 py-4">
					<Table.Root className="font-mono font-semibold">
						<Table.Header>
							<Table.Row className="text-left text-text-accent">
								<Table.Head>{t('clans.statsClan')}</Table.Head>
								<Table.Head className="text-center">
									{t('clan.common.games')}
								</Table.Head>
								<Table.Head className="text-center">W-L</Table.Head>
								<Table.Head className="text-center">
									{t('personal.winrate')}
								</Table.Head>
								<Table.Head className="text-center">
									{t('clan.sessions.kd')}
								</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{rows.map((r) => (
								<Table.Row key={r.clan_id}>
									<Table.Cell className="max-w-48 truncate">
										{r.tag ? (
											<span className="text-text-accent">[{r.tag}] </span>
										) : null}
										{r.name}
									</Table.Cell>
									<Table.Cell className="text-center font-medium text-text-accent">
										{r.battles}
									</Table.Cell>
									<Table.Cell className="text-center font-medium text-text-accent">
										<span className="text-success">{r.wins}</span>
										<span className="text-muted-foreground">–</span>
										<span className="text-destructive">{r.losses}</span>
									</Table.Cell>
									<Table.Cell className="text-center">
										{r.battles > 0
											? `${Math.round(r.winrate * 100)}%`
											: '—'}
									</Table.Cell>
									<Table.Cell
										className={`text-center ${kdClass(r.kills, r.deaths)}`}
									>
										{formatKd(r.kills, r.deaths)}
									</Table.Cell>
								</Table.Row>
							))}
						</Table.Body>
					</Table.Root>
				</div>
			)}
		</section>
	)
}
