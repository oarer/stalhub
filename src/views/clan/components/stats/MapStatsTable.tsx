'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { formatKd } from '@/views/clan/clan.utils'

export interface MapStatRow {
	map: string
	sessions: number
	wins: number
	losses: number
	winrate: number
	kills: number
	deaths: number
	kd: number
}

const MIN_SAMPLE = 3

function kdTone(kd: number, sample: number): string {
	if (sample < MIN_SAMPLE) return 'text-muted-foreground'
	if (kd >= 1) return 'text-success'
	if (kd >= 0.8) return 'text-primary'
	return 'text-destructive'
}

function winrateTone(wr: number, decided: number): string {
	if (decided < MIN_SAMPLE) return 'text-muted-foreground'
	if (wr >= 0.55) return 'text-success'
	if (wr >= 0.45) return 'text-primary'
	return 'text-destructive'
}

export function MapStatsTable({ rows }: { rows: MapStatRow[] }) {
	const t = useTranslations()
	const tc = useTranslations()

	if (rows.length === 0) return null

	const weak = rows.filter(
		(r) => r.sessions >= MIN_SAMPLE && (r.kd < 0.8 || r.winrate < 0.45)
	)
	const strong = rows.filter(
		(r) => r.sessions >= MIN_SAMPLE && r.kd >= 1 && r.winrate >= 0.55
	)

	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="font-semibold text-md">
					{t('personal.stagesMapsTitle')}
				</p>
				<div className="flex flex-wrap gap-2">
					{strong.length > 0 && (
						<Badge variant="secondary">
							<span className="text-success">
								▲ {strong.map((r) => r.map).join(', ')}
							</span>
						</Badge>
					)}
					{weak.length > 0 && (
						<Badge variant="secondary">
							<span className="text-destructive">
								▼ {weak.map((r) => r.map).join(', ')}
							</span>
						</Badge>
					)}
				</div>
			</div>
			<Table.Root className="font-mono font-semibold">
				<Table.Header>
					<Table.Row className="text-left">
						<Table.Head>{t('personal.stagesMap')}</Table.Head>
						<Table.Head className="text-center">
							{tc('clan.common.games')}
						</Table.Head>
						<Table.Head className="text-center">W/L</Table.Head>
						<Table.Head className="text-center">
							{t('personal.winrate')}
						</Table.Head>
						<Table.Head className="text-center">
							{tc('clan.sessions.kd')}
						</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{rows.map((r) => {
						const decided = r.wins + r.losses
						return (
							<Table.Row key={r.map}>
								<Table.Cell className="max-w-44 truncate">
									{r.map}
									{r.sessions < MIN_SAMPLE && (
										<span className="text-muted-foreground text-xs">
											{' '}
											· {t('personal.lowSample')}
										</span>
									)}
								</Table.Cell>
								<Table.Cell className="text-center font-medium text-foreground">
									{r.sessions}
								</Table.Cell>
								<Table.Cell className="text-center font-mono font-semibold text-foreground">
									<span className="text-primary">
										{r.wins}
									</span>
									<span className="text-muted-foreground">
										/
									</span>
									<span className="text-destructive">
										{r.losses}
									</span>
								</Table.Cell>
								<Table.Cell
									className={`text-center ${winrateTone(r.winrate, decided)}`}
								>
									{decided > 0
										? `${Math.round(r.winrate * 100)}%`
										: '—'}
								</Table.Cell>
								<Table.Cell
									className={`text-center ${kdTone(r.kd, r.sessions)}`}
								>
									{formatKd(r.kills, r.deaths)}
								</Table.Cell>
							</Table.Row>
						)
					})}
				</Table.Body>
			</Table.Root>
		</div>
	)
}
