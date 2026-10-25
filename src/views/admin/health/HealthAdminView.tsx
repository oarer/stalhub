'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/date'
import { adminHealthQueries } from '@/queries/admin/health.queries'
import type { AdminCronStatus } from '@/types/admin.type'
import { MetricCard, StatCard } from '../dashboard/components/Shared'

const numberFmt = new Intl.NumberFormat()

export default function HealthAdminView() {
	const t = useTranslations()

	const { data } = useSuspenseQuery(adminHealthQueries.get())

	const statuses = data.runtime.by_status
	const total = Object.values(statuses).reduce((a, b) => a + b, 0)
	const fiveXX = Object.entries(statuses)
		.filter(([code]) => code.startsWith('5'))
		.reduce((a, [, v]) => a + v, 0)
	const errorRate = total > 0 ? ((fiveXX / total) * 100).toFixed(2) : '0.00'

	const scEnabled = data.sc_nodes.filter((n) => n.enabled)
	const scHealthy = scEnabled.filter((n) => !n.last_error)

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="font-semibold text-2xl">
					{t('admin.health.title')}
				</h1>
				<p className="mt-1 text-neutral-400 text-sm">
					{t('admin.health.generatedAt', {
						date: formatDate(data.generated_at, 'time'),
					})}
				</p>
			</div>

			<section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
				<MetricCard
					accent="sky"
					icon="lucide:git-pull-request-draft"
					label={t('admin.health.requestsTotal')}
					sub={t('admin.health.sinceStart')}
					value={numberFmt.format(data.runtime.requests_total)}
				/>
				<MetricCard
					accent={fiveXX > 0 ? 'rose' : 'emerald'}
					icon="lucide:shield-x"
					label={t('admin.health.errorRate')}
					sub={t('admin.health.fiveXX', {
						count: numberFmt.format(fiveXX),
					})}
					value={`${errorRate}%`}
				/>
				<MetricCard
					accent="amber"
					icon="lucide:timer"
					label={t('admin.health.p95')}
					value={`${data.runtime.p95_seconds.toFixed(2)}s`}
				/>
				<MetricCard
					accent="violet"
					icon="lucide:server"
					label={t('admin.health.scNodes')}
					sub={t('admin.health.scHealthy', {
						count: scHealthy.length,
						total: scEnabled.length,
					})}
					value={`${scHealthy.length}/${scEnabled.length}`}
				/>
				<MetricCard
					accent="emerald"
					icon="lucide:trending-up"
					label={t('admin.health.dau')}
					sub={t('admin.health.wau', {
						count: numberFmt.format(data.users.wau_7d),
					})}
					value={numberFmt.format(data.users.dau_24h)}
				/>
			</section>

			<section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
				<StatCard
					accent="primary"
					icon="lucide:cpu"
					rows={[
						{
							label: t('admin.health.uptime'),
							value: formatUptime(data.uptime_seconds),
						},
						{
							label: t('admin.health.memHeap'),
							value: `${numberFmt.format(data.runtime.mem_heap_mb)} MB`,
						},
						{
							label: t('admin.health.dbSize'),
							value: data.db_size,
						},
					]}
					title={t('admin.health.runtime')}
				/>
				<StatCard
					accent="rose"
					icon="lucide:shield-ban"
					rows={[
						{
							label: t('admin.health.bans7d'),
							value: numberFmt.format(data.moderation.bans_7d),
							accent:
								data.moderation.bans_7d > 0 ? 'danger' : 'ok',
						},
						{
							label: t('admin.health.autoBanned'),
							value: numberFmt.format(
								data.moderation.auto_banned
							),
						},
						{
							label: t('admin.health.queuePending'),
							value: numberFmt.format(
								(data.content.articles.by_status.PENDING ?? 0) +
									(data.content.articles.by_status.REVIEW ??
										0)
							),
						},
					]}
					title={t('admin.health.unresolved')}
				/>
			</section>

			<StatusCodes statuses={statuses} />

			<CronsTable crons={data.crons} />

			<ScNodes
				dirtyLabel={t('admin.health.scLastSeen')}
				nodes={data.sc_nodes}
			/>
		</div>
	)
}

function formatUptime(seconds: number): string {
	const d = Math.floor(seconds / 86_400)
	const h = Math.floor((seconds % 86_400) / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	if (d > 0) return `${d}d ${h}h`
	if (h > 0) return `${h}h ${m}m`
	return `${m}m`
}

function StatusCodes({ statuses }: { statuses: Record<string, number> }) {
	const t = useTranslations()
	const total = Object.values(statuses).reduce((a, b) => a + b, 0)
	if (total === 0) return null
	const entries = Object.entries(statuses).sort((a, b) => b[1] - a[1])

	return (
		<section className="flex flex-col gap-2">
			<h2 className="flex items-center gap-2 font-semibold text-lg">
				<Icon icon="lucide:pie-chart" />
				{t('admin.health.byStatus')}
			</h2>
			<div className="flex flex-col gap-1.5">
				{entries.map(([code, count]) => {
					const pct = ((count / total) * 100).toFixed(2)
					const isError = code.startsWith('5')
					return (
						<div
							className="flex items-center gap-3 text-sm"
							key={code}
						>
							<span
								className={cn(
									'w-14 text-right font-mono font-semibold',
									isError && 'text-rose-400'
								)}
							>
								{code}
							</span>
							<div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
								<div
									className={cn(
										'h-full rounded-full',
										isError ? 'bg-rose-500' : 'bg-sky-500'
									)}
									style={{
										width: `${Math.max(Number(pct), 1)}%`,
									}}
								/>
							</div>
							<span className="w-16 text-right font-mono text-xs">
								{pct}%
							</span>
							<span className="w-20 text-right font-mono text-neutral-400 text-xs">
								{count}
							</span>
						</div>
					)
				})}
			</div>
		</section>
	)
}

function CronsTable({ crons }: { crons: AdminCronStatus[] }) {
	const t = useTranslations()

	return (
		<section className="flex flex-col gap-2">
			<h2 className="flex items-center gap-2 font-semibold text-lg">
				<Icon icon="lucide:watch" />
				{t('admin.health.cronsTitle')}
			</h2>
			<div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2 xl:grid-cols-3">
				{crons.map((cron) => (
					<div
						className="flex items-center justify-between gap-3 rounded-lg border border-primary/40 bg-card/50 px-3 py-2"
						key={cron.name}
					>
						<div className="flex min-w-0 flex-col">
							<span className="truncate font-mono text-sm">
								{cron.name}
							</span>
							<span className="text-neutral-400 text-xs">
								{cron.pattern}
								{cron.timezone ? ` · ${cron.timezone}` : ''}
							</span>
						</div>
						<div className="flex shrink-0 flex-col items-end gap-0.5">
							<span
								className={cn(
									'flex items-center gap-1 font-semibold text-xs',
									cron.last_status === 'ok' &&
										'text-emerald-400',
									cron.last_status === 'error' &&
										'text-rose-400',
									cron.last_status === 'unknown' &&
										'text-neutral-500'
								)}
							>
								<Icon icon={statusIcon(cron.last_status)} />
								{t(`admin.health.cron.${cron.last_status}`)}
							</span>
							<span className="text-neutral-400 text-xs">
								{cron.last_run_at
									? formatDate(cron.last_run_at, 'time')
									: '—'}
								{cron.last_duration_ms !== null &&
									` · ${cron.last_duration_ms}ms`}
							</span>
						</div>
					</div>
				))}
			</div>
		</section>
	)
}

function statusIcon(status: 'ok' | 'error' | 'unknown'): string {
	if (status === 'ok') return 'lucide:check'
	if (status === 'error') return 'lucide:x'
	return 'lucide:minus'
}

function ScNodes({
	nodes,
	dirtyLabel,
}: {
	nodes: {
		id: number
		name: string
		base_url: string
		enabled: boolean
		last_seen_at: string | null
		last_error: string | null
	}[]
	dirtyLabel: string
}) {
	const t = useTranslations()

	return (
		<section className="flex flex-col gap-2">
			<h2 className="flex items-center gap-2 font-semibold text-lg">
				<Icon icon="lucide:server" />
				{t('admin.health.scTitle')}
			</h2>
			<div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
				{nodes.map((node) => (
					<div
						className={cn(
							'flex items-center justify-between gap-3 rounded-lg border border-border bg-card/50 px-3 py-2',
							!node.enabled && 'opacity-50'
						)}
						key={node.id}
					>
						<div className="flex min-w-0 flex-col">
							<span className="truncate font-semibold">
								{node.name}
							</span>
							<span className="truncate text-neutral-400 text-xs">
								{node.base_url}
							</span>
						</div>
						<div className="flex shrink-0 flex-col items-end gap-0.5">
							<span
								className={cn(
									'flex items-center gap-1 font-semibold text-xs',
									!node.last_error && 'text-emerald-400',
									node.last_error && 'text-rose-400'
								)}
							>
								<Icon
									icon={
										node.last_error
											? 'lucide:x'
											: 'lucide:check'
									}
								/>
								{node.last_error
									? t('admin.health.nodeError')
									: t('admin.health.nodeOk')}
							</span>
							<span
								className="text-neutral-400 text-xs"
								title={dirtyLabel}
							>
								{node.last_seen_at
									? formatDate(node.last_seen_at, 'datetime')
									: '—'}
							</span>
						</div>
					</div>
				))}
				{nodes.length === 0 && (
					<span className="text-neutral-400 text-sm">—</span>
				)}
			</div>
		</section>
	)
}
