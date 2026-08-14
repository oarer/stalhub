'use client'

import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Table } from '@/components/ui/Table'
import { Section } from '../../../me/components/Section'
import { formatKd, kdClass } from '../../clan.utils'

export interface TopPlayer {
	name: string
	kills: number
	deaths: number
}

interface TopPlayersTableProps {
	topPlayers: TopPlayer[]
}

export function TopPlayersTable({ topPlayers }: TopPlayersTableProps) {
	const t = useTranslations()

	if (topPlayers.length === 0) {
		return (
			<Section
				icon="lucide:bar-chart-3"
				title={t('clan.dashboard.topPlayers.title')}
			>
				<p className="font-semibold text-sm text-text-accent">
					{t('clan.dashboard.topPlayers.empty')}
				</p>
			</Section>
		)
	}

	return (
		<Section
			icon="lucide:bar-chart-3"
			title={t('clan.dashboard.topPlayers.title')}
		>
			<div className="flex flex-col rounded-lg bg-accent/50 p-3">
				<Table.Root className={`${montserrat.className} font-semibold`}>
					<Table.Header>
						<Table.Row className="text-left text-text-accent">
							<Table.Head>{t('clan.common.player')}</Table.Head>
							<Table.Head className="text-center">
								{t('clan.common.killsShort')}
							</Table.Head>
							<Table.Head className="text-center">
								{t('clan.common.deathsShort')}
							</Table.Head>
							<Table.Head className="text-center">
								{t('clan.common.kd')}
							</Table.Head>
						</Table.Row>
					</Table.Header>

					<Table.Body>
						{topPlayers.map((p) => (
							<Table.Row key={p.name}>
								<Table.Cell>{p.name}</Table.Cell>
								<Table.Cell className="text-center font-medium text-text-accent">
									{p.kills}
								</Table.Cell>
								<Table.Cell className="text-center font-medium text-text-accent">
									{p.deaths}
								</Table.Cell>
								<Table.Cell
									className={`text-center ${kdClass(p.kills, p.deaths)}`}
								>
									{formatKd(p.kills, p.deaths)}
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			</div>
		</Section>
	)
}
