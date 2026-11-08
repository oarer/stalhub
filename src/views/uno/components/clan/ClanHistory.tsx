'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { type ReactNode, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { Table } from '@/components/ui/Table'
import { unoQueries } from '@/queries/uno/uno.queries'
import { useUnoLocale } from '../../hooks/useUnoLocale'
import { UNO_MODE_KEYS } from '../../utils/uno.const'
import {
	formatUnoMskDateTime,
	formatUnoPercent,
	formatUnoValue,
} from '../../utils/uno.utils'
import { UnoEmpty } from '../UnoEmpty'
import { UnoFeedback } from '../UnoFeedback'
import { UnoMap } from '../UnoMap'
import { UnoStat } from '../UnoStat'
import {
	buildHistoryBreakdown,
	getHistorySleeves,
	getHistoryTotals,
	type HistoryBreakdownRow,
	sortHistoryItems,
} from './clan-history.utils'

const PAGE_SIZE = 20
const MODE_VALUES = ['brawl', 'tournament', 'base_capture'] as const

function HistoryBreakdown({
	label,
	rows,
	renderKey,
	title,
}: {
	label: string
	rows: HistoryBreakdownRow[]
	renderKey: (key: string) => ReactNode
	title: string
}) {
	const t = useTranslations('uno')
	const locale = useUnoLocale()

	return (
		<Card.Root className="gap-0 overflow-hidden p-0">
			<Card.Header className="border-primary/20 border-b px-5 py-4">
				<Card.Title className="font-semibold">{title}</Card.Title>
			</Card.Header>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head className="px-3">{label}</Table.Head>
						<Table.Head className="px-3 text-right">
							{t('stats.matches')}
						</Table.Head>
						<Table.Head className="px-3 text-right">
							{t('stats.winRate')}
						</Table.Head>
						<Table.Head className="px-3 text-right">
							{t('clan.history.sleeves')}
						</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{rows.map((row) => (
						<Table.Row key={row.key}>
							<Table.Cell className="px-3 font-medium">
								{renderKey(row.key)}
							</Table.Cell>
							<Table.Cell className="px-3 text-right font-mono font-semibold text-sm">
								{formatUnoValue(row.matches, locale)}
							</Table.Cell>
							<Table.Cell className="px-3 text-right font-mono font-semibold text-sm">
								{formatUnoPercent(row.winRate, locale)}
							</Table.Cell>
							<Table.Cell className="px-3 text-right font-mono font-semibold text-sm">
								{formatUnoValue(row.sleeves, locale)}
							</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table.Root>
		</Card.Root>
	)
}

export function ClanHistory({ clanId }: { clanId: string }) {
	const t = useTranslations('uno')
	const locale = useUnoLocale()
	const query = useQuery(unoQueries.history(clanId))
	const items = query.data?.items ?? []
	const [mode, setMode] = useState('all')
	const [outcome, setOutcome] = useState('all')
	const [map, setMap] = useState('all')
	const [page, setPage] = useState(1)

	const mapIds = useMemo(() => {
		const values = items
			.map((item) => item.mapId)
			.filter((value): value is string => Boolean(value))
		return [...new Set(values)].sort()
	}, [items])

	const filtered = useMemo(
		() =>
			sortHistoryItems(items).filter(
				(item) =>
					(mode === 'all' || item.mode === mode) &&
					(outcome === 'all' || item.outcome === outcome) &&
					(map === 'all' || item.mapId === map)
			),
		[items, mode, outcome, map]
	)

	const totals = useMemo(() => getHistoryTotals(filtered), [filtered])
	const modeRows = useMemo(
		() => buildHistoryBreakdown(filtered, (item) => item.mode),
		[filtered]
	)
	const mapRows = useMemo(
		() => buildHistoryBreakdown(filtered, (item) => item.mapId),
		[filtered]
	)

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
	const activePage = Math.min(page, totalPages)
	const pageItems = filtered.slice(
		(activePage - 1) * PAGE_SIZE,
		activePage * PAGE_SIZE
	)

	const updateMode = (value: string) => {
		setMode(value)
		setPage(1)
	}
	const updateOutcome = (value: string) => {
		setOutcome(value)
		setPage(1)
	}
	const updateMap = (value: string) => {
		setMap(value)
		setPage(1)
	}

	return (
		<div className="space-y-4">
			<div className="space-y-1">
				<h2 className="font-semibold text-xl">
					{t('clan.history.title')}
				</h2>
				<p className="text-muted-foreground text-sm">
					{t('clan.history.description')}
				</p>
			</div>

			<UnoFeedback
				isError={query.isError}
				isLoading={query.isPending}
				onRetry={() => void query.refetch()}
			>
				{items.length === 0 ? (
					<UnoEmpty>{t('clan.history.empty')}</UnoEmpty>
				) : (
					<div className="space-y-4">
						<Card.Root className="gap-4">
							<div className="flex flex-wrap items-center gap-2">
								<span className="text-muted-foreground text-xs">
									{t('clan.history.mode')}
								</span>
								<Button
									onClick={() => updateMode('all')}
									size="sm"
									variant={
										mode === 'all' ? 'primary' : 'outline'
									}
								>
									{t('clan.history.allModes')}
								</Button>
								{MODE_VALUES.map((value) => (
									<Button
										key={value}
										onClick={() => updateMode(value)}
										size="sm"
										variant={
											mode === value
												? 'primary'
												: 'outline'
										}
									>
										{t(UNO_MODE_KEYS[value])}
									</Button>
								))}
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<span className="text-muted-foreground text-xs">
									{t('clan.history.result')}
								</span>
								<Button
									onClick={() => updateOutcome('all')}
									size="sm"
									variant={
										outcome === 'all'
											? 'primary'
											: 'outline'
									}
								>
									{t('clan.history.allResults')}
								</Button>
								<Button
									onClick={() => updateOutcome('win')}
									size="sm"
									variant={
										outcome === 'win'
											? 'primary'
											: 'outline'
									}
								>
									{t('clan.history.win')}
								</Button>
								<Button
									onClick={() => updateOutcome('loss')}
									size="sm"
									variant={
										outcome === 'loss'
											? 'primary'
											: 'outline'
									}
								>
									{t('clan.history.loss')}
								</Button>
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<span className="text-muted-foreground text-xs">
									{t('clan.history.map')}
								</span>
								<Button
									onClick={() => updateMap('all')}
									size="sm"
									variant={
										map === 'all' ? 'primary' : 'outline'
									}
								>
									{t('clan.history.allMaps')}
								</Button>
								{mapIds.map((mapId) => (
									<Button
										key={mapId}
										onClick={() => updateMap(mapId)}
										size="sm"
										variant={
											map === mapId
												? 'primary'
												: 'outline'
										}
									>
										<UnoMap map={mapId} />
									</Button>
								))}
							</div>
						</Card.Root>

						{filtered.length === 0 ? (
							<UnoEmpty>{t('empty.filtered')}</UnoEmpty>
						) : (
							<>
								<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
									<UnoStat
										label={t('clan.history.matches')}
										value={formatUnoValue(
											totals.matches,
											locale
										)}
									/>
									<UnoStat
										label={t('clan.history.winsLosses')}
										value={`${formatUnoValue(totals.wins, locale)} / ${formatUnoValue(totals.losses, locale)}`}
									/>
									<UnoStat
										label={t('stats.winRate')}
										value={formatUnoPercent(
											totals.winRate,
											locale
										)}
									/>
									<UnoStat
										accent
										label={t('clan.history.sleeves')}
										value={formatUnoValue(
											totals.sleeves,
											locale
										)}
									/>
									<UnoStat
										label={t('clan.history.clanMoney')}
										value={formatUnoValue(
											totals.clanMoney,
											locale
										)}
									/>
								</div>

								<div className="grid gap-4 lg:grid-cols-2">
									<HistoryBreakdown
										label={t('clan.history.mode')}
										renderKey={(key) =>
											t(UNO_MODE_KEYS[key] ?? 'unknown')
										}
										rows={modeRows}
										title={t('clan.history.byModes')}
									/>
									<HistoryBreakdown
										label={t('clan.history.map')}
										renderKey={(key) => (
											<UnoMap map={key} />
										)}
										rows={mapRows}
										title={t('clan.history.byMaps')}
									/>
								</div>

								<Card.Root className="gap-0 overflow-hidden p-0">
									<Card.Header className="border-primary/20 border-b px-5 py-4">
										<Card.Title className="font-semibold">
											{t('clan.history.title')}
										</Card.Title>
										<Card.Description>
											{t('clan.history.shownOf', {
												shown: pageItems.length,
												total: filtered.length,
											})}
										</Card.Description>
									</Card.Header>
									<Table.Root className="min-w-240">
										<Table.Header>
											<Table.Row>
												<Table.Head className="px-3">
													{t('clan.history.date')}
												</Table.Head>
												<Table.Head className="px-3">
													{t('clan.history.mode')}
												</Table.Head>
												<Table.Head className="px-3">
													{t('clan.history.map')}
												</Table.Head>
												<Table.Head className="px-3">
													{t(
														'clan.history.opponents'
													)}
												</Table.Head>
												<Table.Head className="px-3 text-right">
													{t('clan.history.score')}
												</Table.Head>
												<Table.Head className="px-3 text-right">
													{t('clan.history.sleeves')}
												</Table.Head>
												<Table.Head className="px-3 text-right">
													{t('clan.history.result')}
												</Table.Head>
											</Table.Row>
										</Table.Header>
										<Table.Body>
											{pageItems.map((item, index) => {
												const opponentNames =
													item.opponents
														.map(
															(opponent) =>
																opponent.clan
																	?.name
														)
														.filter(
															(
																name
															): name is string =>
																Boolean(name)
														)
												const opponentScores =
													item.opponents
														.map(
															(opponent) =>
																opponent.score
														)
														.filter(
															(
																score
															): score is number =>
																score !== null
														)
												return (
													<Table.Row
														key={`${item.gridId}-${item.group}-${item.stage}-${index}`}
													>
														<Table.Cell className="px-3 text-muted-foreground text-sm">
															{formatUnoMskDateTime(
																item.time ??
																	item.date,
																locale
															)}
														</Table.Cell>
														<Table.Cell className="px-3">
															<div className="truncate font-medium">
																{item.mode
																	? t(
																			UNO_MODE_KEYS[
																				item
																					.mode
																			] ??
																				'unknown'
																		)
																	: t(
																			'unknown'
																		)}
															</div>
															{item.stage !==
																null && (
																<div className="text-muted-foreground text-xs">
																	{t(
																		'clan.history.stage'
																	)}{' '}
																	{formatUnoValue(
																		item.stage +
																			1,
																		locale
																	)}
																</div>
															)}
														</Table.Cell>
														<Table.Cell className="px-3">
															<UnoMap
																className="block truncate"
																map={item.mapId}
															/>
														</Table.Cell>
														<Table.Cell className="px-3">
															<div
																className="truncate text-sm"
																title={opponentNames.join(
																	', '
																)}
															>
																{opponentNames.length >
																0
																	? opponentNames.join(
																			', '
																		)
																	: t(
																			'clan.history.bye'
																		)}
															</div>
														</Table.Cell>
														<Table.Cell className="px-3 text-right font-mono font-semibold text-sm">
															<div className="flex items-center justify-end gap-1">
																<span className="font-semibold text-primary">
																	{formatUnoValue(
																		item
																			.actor
																			?.score ??
																			null,
																		locale
																	)}
																</span>

																{opponentScores.length >
																	0 && (
																	<span className="font-semibold text-muted-foreground">
																		/{' '}
																		{opponentScores
																			.map(
																				(
																					score
																				) =>
																					formatUnoValue(
																						score,
																						locale
																					)
																			)
																			.join(
																				' / '
																			)}
																	</span>
																)}
															</div>
														</Table.Cell>
														<Table.Cell className="px-3 text-right font-mono font-semibold text-sm">
															{formatUnoValue(
																getHistorySleeves(
																	item
																),
																locale
															)}
														</Table.Cell>
														<Table.Cell className="flex justify-end px-3">
															<Badge
																className="w-fit"
																variant={
																	item.outcome ===
																	'win'
																		? 'success'
																		: item.outcome ===
																				'loss'
																			? 'danger'
																			: 'secondary'
																}
															>
																{item.outcome ===
																'win'
																	? t(
																			'clan.history.win'
																		)
																	: item.outcome ===
																			'loss'
																		? t(
																				'clan.history.loss'
																			)
																		: t(
																				'unknown'
																			)}
															</Badge>
														</Table.Cell>
													</Table.Row>
												)
											})}
										</Table.Body>
									</Table.Root>
									<div className="border-primary/20 border-t p-4">
										<Pagination
											onPageChange={setPage}
											page={activePage}
											totalPages={totalPages}
										/>
									</div>
								</Card.Root>
							</>
						)}
					</div>
				)}
			</UnoFeedback>
		</div>
	)
}
