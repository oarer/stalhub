'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { mtsExtended } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminAuctionHistoryQueries } from '@/queries/admin/auction-history.queries'
import { adminAuctionHistoryService } from '@/services/admin/auction-history.service'
import type { AdminAuctionHistoryRun } from '@/types/admin.type'

const QUERY_KEY = ['admin', 'auction-history']

const fmtInt = (n: number) => Intl.NumberFormat('ru-RU').format(n)

const fmtDateTime = (iso: string | null) => {
	if (!iso) return '—'
	const d = new Date(iso)
	if (Number.isNaN(d.getTime())) return '—'
	return d.toLocaleString('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	})
}

const fmtAgo = (ms: number) => {
	if (!ms) return '—'
	const s = Math.max(0, Math.round((Date.now() - ms) / 1000))
	if (s < 60) return `${s} c`
	const m = Math.round(s / 60)
	if (m < 60) return `${m} мин`
	const h = Math.round(m / 60)
	if (h < 48) return `${h} ч`
	return `${Math.round(h / 24)} дн`
}

const fmtDuration = (run: AdminAuctionHistoryRun) => {
	if (!run.finishedAt || run.finishedAt <= run.startedAt) return '—'
	const s = Math.round((run.finishedAt - run.startedAt) / 1000)
	if (s < 60) return `${s} c`
	return `${Math.round(s / 60)} мин`
}

function RunCard({
	title,
	run,
	icon,
}: {
	title: string
	run: AdminAuctionHistoryRun | null
	icon: string
}) {
	const t = useTranslations()
	return (
		<Card.Root>
			<Card.Header>
				<Card.Title className="text-foreground text-sm">
					<Icon className="text-lg" icon={icon} />
					{title}
				</Card.Title>
			</Card.Header>
			<Card.Content className="flex flex-col gap-1 p-4 pt-0 text-sm">
				{!run ? (
					<p className="text-muted-foreground">
						{t('admin.auctionHistory.notRunYet')}
					</p>
				) : (
					<>
						<StatRow
							label={t('admin.auctionHistory.inserted')}
							value={fmtInt(run.inserted)}
						/>
						<StatRow
							label={t('admin.auctionHistory.itemsSeen')}
							value={fmtInt(run.items)}
						/>
						<StatRow
							label={t('admin.auctionHistory.requests')}
							value={fmtInt(run.pages)}
						/>
						<StatRow
							label={t('admin.auctionHistory.failed')}
							value={fmtInt(run.failed)}
						/>
						<StatRow
							label={t('admin.auctionHistory.duration')}
							value={fmtDuration(run)}
						/>
						<StatRow
							label={t('admin.auctionHistory.finishedAgo')}
							value={fmtAgo(run.finishedAt)}
						/>
					</>
				)}
			</Card.Content>
		</Card.Root>
	)
}

function StatRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between gap-2">
			<span className="text-muted-foreground">{label}</span>
			<span className="font-mono font-semibold text-foreground">
				{value}
			</span>
		</div>
	)
}

export default function AuctionHistoryAdminView() {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const { data } = useSuspenseQuery(adminAuctionHistoryQueries.progress())

	const deepenMutation = useMutation({
		mutationFn: () => adminAuctionHistoryService.deepen(),
		onSuccess: () => {
			toast.success(t('admin.auctionHistory.deepenStarted'))
			queryClient.invalidateQueries({ queryKey: QUERY_KEY })
		},
		onError: () => toast.error(t('admin.auctionHistory.deepenFailed')),
	})

	const censusMutation = useMutation({
		mutationFn: () => adminAuctionHistoryService.census(),
		onSuccess: () => {
			toast.success(t('admin.auctionHistory.censusStarted'))
			queryClient.invalidateQueries({ queryKey: QUERY_KEY })
		},
		onError: () => toast.error(t('admin.auctionHistory.censusFailed')),
	})

	const pct = data.items.backfillPct
	const busy = data.running || data.deepening

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h1
					className={`${mtsExtended.className} font-semibold text-xl`}
				>
					{t('admin.auctionHistory.title')}
				</h1>
				<div className="flex items-center gap-2">
					<Badge variant={busy ? 'primary' : 'secondary'}>
						{data.deepening
							? t('admin.auctionHistory.deepening')
							: data.running
								? t('admin.auctionHistory.running')
								: t('admin.auctionHistory.idle')}
					</Badge>
					<Button
						onClick={() =>
							queryClient.invalidateQueries({
								queryKey: QUERY_KEY,
							})
						}
						variant="ghost"
					>
						<Icon className="text-lg" icon="lucide:refresh-cw" />
						{t('admin.auctionHistory.refresh')}
					</Button>
				</div>
			</div>

			<Card.Root>
				<Card.Header>
					<Card.Title className="text-foreground text-sm">
						<Icon className="text-lg" icon="lucide:database-zap" />
						{t('admin.auctionHistory.backfill')}
					</Card.Title>
				</Card.Header>
				<Card.Content className="flex flex-col gap-2 p-4 pt-0">
					<div className="h-2.5 overflow-hidden rounded-full bg-border/20">
						<div
							className="h-full rounded-full bg-primary transition-all"
							style={{ width: `${pct}%` }}
						/>
					</div>
					<div className="flex flex-wrap justify-between gap-2 text-sm">
						<span className="font-mono font-semibold text-foreground">
							{fmtInt(data.items.backfilled)} /{' '}
							{fmtInt(data.items.total)} ({pct}%)
						</span>
						<span className="text-muted-foreground">
							{t('admin.auctionHistory.pending', {
								count: fmtInt(data.items.pending),
							})}
							{' · '}
							{t('admin.auctionHistory.capped', {
								count: fmtInt(data.items.capped),
							})}
						</span>
					</div>
					<Button
						disabled={
							busy ||
							data.items.capped === 0 ||
							deepenMutation.isPending
						}
						loading={deepenMutation.isPending}
						onClick={() => deepenMutation.mutate()}
					>
						<Icon
							className="text-lg"
							icon="lucide:arrow-down-wide-narrow"
						/>
						{t('admin.auctionHistory.deepen')}
					</Button>
					<p className="text-muted-foreground text-xs">
						{t('admin.auctionHistory.deepenHint')}
					</p>
				</Card.Content>
			</Card.Root>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<Card.Root>
					<Card.Header>
						<Card.Title className="text-foreground text-sm">
							{t('admin.auctionHistory.dealsTotal')}
						</Card.Title>
					</Card.Header>
					<Card.Content className="p-4 pt-0">
						<p className="font-bold font-mono text-2xl text-foreground">
							{fmtInt(data.deals.total)}
						</p>
						<p className="mt-1 text-muted-foreground text-xs">
							{t('admin.auctionHistory.depth', {
								from: fmtDateTime(data.deals.oldest),
								to: fmtDateTime(data.deals.newest),
							})}
						</p>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title className="text-foreground text-sm">
							{t('admin.auctionHistory.dbSize')}
						</Card.Title>
					</Card.Header>
					<Card.Content className="p-4 pt-0">
						<p className="font-bold font-mono text-2xl text-foreground">
							{data.size.db}
						</p>
						<p className="mt-1 font-mono text-muted-foreground text-xs">
							{t('admin.auctionHistory.dealsSize', {
								size: data.size.deals,
							})}
						</p>
					</Card.Content>
				</Card.Root>

				<RunCard
					icon="lucide:radar"
					run={data.lastSweep}
					title={t('admin.auctionHistory.lastSweep')}
				/>
				<RunCard
					icon="lucide:history"
					run={data.lastBackfill}
					title={t('admin.auctionHistory.lastBackfill')}
				/>
				<RunCard
					icon="lucide:arrow-down-wide-narrow"
					run={data.lastDeepen}
					title={t('admin.auctionHistory.lastDeepen')}
				/>
			</div>

			<Card.Root>
				<Card.Header>
					<Card.Title className="text-foreground text-sm">
						<Icon
							className="text-lg"
							icon="lucide:clipboard-list"
						/>
						{t('admin.auctionHistory.census')}
					</Card.Title>
				</Card.Header>
				<Card.Content className="flex flex-col gap-3 p-4 pt-0">
					<Button
						disabled={
							data.censusRunning || censusMutation.isPending
						}
						loading={censusMutation.isPending}
						onClick={() => censusMutation.mutate()}
					>
						<Icon
							className="text-lg"
							icon="lucide:clipboard-list"
						/>
						{t('admin.auctionHistory.censusRun')}
					</Button>
					{data.censusRunning && (
						<p className="text-muted-foreground text-sm">
							{t('admin.auctionHistory.censusRunning')}
						</p>
					)}
					{data.lastCensus && (
						<>
							<div className="flex flex-col gap-1 text-sm">
								<StatRow
									label={t(
										'admin.auctionHistory.censusWithHistory'
									)}
									value={`${fmtInt(data.lastCensus.withHistory)} / ${fmtInt(data.lastCensus.items)}`}
								/>
								<StatRow
									label={t(
										'admin.auctionHistory.censusTotal'
									)}
									value={fmtInt(data.lastCensus.exboDeals)}
								/>
								<StatRow
									label={t('admin.auctionHistory.failed')}
									value={fmtInt(data.lastCensus.failed)}
								/>
							</div>
							<div className="flex flex-col gap-1">
								{data.lastCensus.buckets.map((b) => {
									const max = Math.max(
										1,
										...data.lastCensus!.buckets.map(
											(x) => x.count
										)
									)
									return (
										<div
											className="flex items-center gap-2 text-xs"
											key={b.label}
										>
											<span className="w-20 shrink-0 font-mono text-muted-foreground">
												{b.label}
											</span>
											<div className="h-2 flex-1 overflow-hidden rounded-full bg-border/20">
												<div
													className="h-full rounded-full bg-primary"
													style={{
														width: `${Math.round((b.count / max) * 100)}%`,
													}}
												/>
											</div>
											<span className="w-16 shrink-0 text-right font-mono text-foreground">
												{fmtInt(b.count)}
											</span>
										</div>
									)
								})}
							</div>
						</>
					)}
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title className="text-foreground text-sm">
						<Icon className="text-lg" icon="lucide:trophy" />
						{t('admin.auctionHistory.top')}
					</Card.Title>
				</Card.Header>
				<Card.Content className="p-4 pt-0">
					<div className="overflow-x-auto">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>
										{t('admin.auctionHistory.item')}
									</Table.Head>
									<Table.Head>
										{t('admin.auctionHistory.dealsCol')}
									</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{data.top.map((row) => (
									<Table.Row key={row.dataPath}>
										<Table.Cell>
											<span className="font-mono text-foreground text-xs">
												{row.dataPath}
											</span>
										</Table.Cell>
										<Table.Cell>
											<span className="font-mono font-semibold text-foreground text-sm">
												{fmtInt(row.deals)}
											</span>
										</Table.Cell>
									</Table.Row>
								))}
								{data.top.length === 0 && (
									<Table.Row>
										<Table.Cell>
											<span className="text-muted-foreground text-sm">
												{t('modals.builds.no_data')}
											</span>
										</Table.Cell>
										<Table.Cell />
									</Table.Row>
								)}
							</Table.Body>
						</Table.Root>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	)
}
