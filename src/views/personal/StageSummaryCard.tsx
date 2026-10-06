'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import { Tabs } from '@/components/ui/Tabs'
import type { PersonalStageStats } from '@/types/personal/personal.type'
import { formatKd, formatKda, kdClass } from '@/views/clan/clan.utils'
import { MapStatsTable } from '@/views/clan/components/stats/MapStatsTable'

export function StageSummaryCard({
	stageStats,
}: {
	stageStats: Omit<PersonalStageStats, 'per_stage'>
}) {
	const t = useTranslations('personal')
	const tc = useTranslations()

	if (!stageStats || stageStats.appearances === 0) {
		return (
			<Card.Root className="flex flex-col gap-2 p-5">
				<h3 className="font-semibold">{t('stagesTitle')}</h3>
				<p className="text-muted-foreground text-sm">
					{t('stagesEmpty')}
				</p>
			</Card.Root>
		)
	}

	return (
		<Card.Root className="flex flex-col gap-3 p-5">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h3 className="font-semibold">{t('stagesTitle')}</h3>
				<div className="flex flex-wrap items-center gap-2">
					<Badge variant="secondary">
						K/D{' '}
						<span
							className={kdClass(
								stageStats.kills,
								stageStats.deaths
							)}
						>
							{formatKd(stageStats.kills, stageStats.deaths)}
						</span>
					</Badge>
					<Badge variant="secondary">
						KDA{' '}
						{formatKda(
							stageStats.kills,
							stageStats.deaths,
							stageStats.assists
						)}
					</Badge>
				</div>
			</div>
			<p className="text-muted-foreground text-sm">
				{t('stagesHint', {
					sessions: stageStats.sessions,
					appearances: stageStats.appearances,
					kills: stageStats.kills,
				})}
			</p>
			<Tabs.Root defaultValue="clans">
				<Tabs.List className="grid grid-cols-2">
					<Tabs.Trigger value="clans">{t('tabClans')}</Tabs.Trigger>
					<Tabs.Trigger value="maps">{t('tabMaps')}</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="clans">
					{stageStats.per_clan.length > 0 ? (
						<Table.Root className="font-mono font-semibold">
							<Table.Header>
								<Table.Row className="text-left text-foreground">
									<Table.Head>{t('stagesClan')}</Table.Head>
									<Table.Head className="text-center">
										{tc('clan.sessions.stage')}
									</Table.Head>
									<Table.Head className="text-center">
										{tc('clan.sessions.killsShort')}
									</Table.Head>
									<Table.Head className="text-center">
										{tc('clan.sessions.deathsShort')}
									</Table.Head>
									<Table.Head className="text-center">
										{tc('clan.sessions.assistsShort')}
									</Table.Head>
									<Table.Head className="text-center">
										{tc('clan.sessions.kd')}
									</Table.Head>
									<Table.Head className="text-center">
										KDA
									</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{stageStats.per_clan.map((c) => (
									<Table.Row
										key={c.clan_id ?? c.name ?? 'personal'}
									>
										<Table.Cell className="max-w-40 truncate">
											{c.tag
												? `[${c.tag}] ${c.name ?? ''}`
												: (c.name ??
													t('stagesPersonal'))}
										</Table.Cell>
										<Table.Cell className="text-center font-medium text-foreground">
											{c.sessions}
										</Table.Cell>
										<Table.Cell className="text-center font-medium text-foreground">
											{c.kills}
										</Table.Cell>
										<Table.Cell className="text-center font-medium text-foreground">
											{c.deaths}
										</Table.Cell>
										<Table.Cell className="text-center font-medium text-foreground">
											{c.assists}
										</Table.Cell>
										<Table.Cell
											className={`text-center ${kdClass(c.kills, c.deaths)}`}
										>
											{formatKd(c.kills, c.deaths)}
										</Table.Cell>
										<Table.Cell className="text-center text-muted-foreground">
											{formatKda(
												c.kills,
												c.deaths,
												c.assists
											)}
										</Table.Cell>
									</Table.Row>
								))}
							</Table.Body>
						</Table.Root>
					) : (
						<p className="text-muted-foreground text-sm">
							{t('stagesEmpty')}
						</p>
					)}
				</Tabs.Content>
				<Tabs.Content value="maps">
					{stageStats.per_map.length > 0 ? (
						<MapStatsTable rows={stageStats.per_map} />
					) : (
						<p className="text-muted-foreground text-sm">
							{t('stagesEmpty')}
						</p>
					)}
				</Tabs.Content>
			</Tabs.Root>
		</Card.Root>
	)
}
