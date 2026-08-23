'use client'

import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Table } from '@/components/ui/Table'
import type { StageSummary } from '@/types/clan/clan.type'
import { formatKd, kdClass } from '@/views/clan/clan.utils'

export function SessionSummary({ summary }: { summary: StageSummary }) {
	const t = useTranslations()
	const summaryTeams = summary.teams ?? []
	const playerTeam = summaryTeams.find((t) => t.is_player_clan)
	const opponents = summaryTeams.filter((t) => !t.is_player_clan)

	return (
		<>
			<div className="flex items-center justify-between">
				<p className="font-semibold text-md">
					{t('clan.sessions.summary')}
				</p>
				<span
					className={`rounded px-1.5 py-0.5 font-semibold text-xs ${
					summary.victory
						? 'bg-green-500/20 text-success'
						: 'bg-red-500/20 text-destructive'
					}`}
				>
					{summary.victory
						? t('clan.common.victory')
						: t('clan.common.defeat')}
				</span>
			</div>
			{summary.total_score && (
				<div className="flex flex-col">
					<p className="font-semibold text-sm text-text-accent">
						{t('clan.sessions.stageScore', {
							score: summary.total_score,
						})}
						{playerTeam?.name && ` (${playerTeam.name})`}
					</p>
					<p className="font-semibold text-sm text-text-accent">
						{opponents.length === 1
							? t('clan.sessions.opponentsOne', {
									names: opponents
										.map(
											(o) =>
												`${o.name}${o.score != null ? ` (${o.score})` : ''}`
										)
										.join(', '),
								})
							: t('clan.sessions.opponentsMany', {
									names: opponents
										.map(
											(o) =>
												`${o.name}${o.score != null ? ` (${o.score})` : ''}`
										)
										.join(', '),
								})}
					</p>
				</div>
			)}
			<div className="flex flex-col gap-2 p-3">
				<Table.Root className={`${montserrat.className} font-semibold`}>
					<Table.Header>
						<Table.Row className="text-left text-text-accent">
							<Table.Head>{t('clan.common.player')}</Table.Head>
							<Table.Head className="text-center">
								{t('clan.sessions.killsShort')}
							</Table.Head>
							<Table.Head className="text-center">
								{t('clan.sessions.deathsShort')}
							</Table.Head>
							<Table.Head className="text-center">
								{t('clan.sessions.assistsShort')}
							</Table.Head>
							<Table.Head className="text-center">
								{t('clan.sessions.kd')}
							</Table.Head>
							<Table.Head className="text-center">
								{t('clan.sessions.scoreShort')}
							</Table.Head>
						</Table.Row>
					</Table.Header>

					<Table.Body>
						{summary.players.map((p) => (
							<Table.Row key={p.name}>
								<Table.Cell>{p.name}</Table.Cell>
								<Table.Cell className="text-center font-medium text-text-accent">
									{p.kills}
								</Table.Cell>
								<Table.Cell className="text-center font-medium text-text-accent">
									{p.deaths}
								</Table.Cell>
								<Table.Cell className="text-center font-medium text-text-accent">
									{p.assists}
								</Table.Cell>
								<Table.Cell
									className={`text-center ${kdClass(p.kills, p.deaths)}`}
								>
									{formatKd(p.kills, p.deaths)}
								</Table.Cell>
								<Table.Cell className="py-2 text-center font-medium text-muted-foreground">
									{p.score > 0 ? p.score : ''}
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			</div>
		</>
	)
}
