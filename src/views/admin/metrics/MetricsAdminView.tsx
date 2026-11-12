'use client'

import { Icon } from '@iconify/react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Component, type ReactNode, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/date'
import {
	type PromMetricFamily,
	type PromMetricType,
	parsePrometheus,
} from '@/lib/prometheus'
import { adminMetricsQueries } from '@/queries/admin/metrics.queries'
import { MetricCard } from '../dashboard/components/Shared'

const numberFmt = new Intl.NumberFormat()
const valueFmt = new Intl.NumberFormat(undefined, {
	maximumFractionDigits: 6,
})

const TYPE_BADGES: Record<PromMetricType, string> = {
	counter: 'bg-sky-500/10 text-sky-400',
	gauge: 'bg-emerald-500/10 text-emerald-400',
	histogram: 'bg-violet-500/10 text-violet-400',
	summary: 'bg-cyan-500/10 text-cyan-400',
	untyped: 'bg-neutral-500/10 text-neutral-400',
}

const TYPE_FILTERS = ['all', 'counter', 'gauge', 'histogram'] as const

type TypeFilter = (typeof TYPE_FILTERS)[number]

const INITIAL_FAMILIES = 25

export default function MetricsAdminView() {
	const queryClient = useQueryClient()
	const [attempt, setAttempt] = useState(0)

	const retry = () => {
		void queryClient.invalidateQueries({
			queryKey: ['admin', 'metrics'],
		})
		setAttempt((a) => a + 1)
	}

	return (
		<MetricsErrorBoundary onRetry={retry}>
			<MetricsContent key={attempt} />
		</MetricsErrorBoundary>
	)
}

function MetricsContent() {
	const t = useTranslations()
	const { data, refetch, isFetching } = useSuspenseQuery(
		adminMetricsQueries.raw()
	)

	const families = useMemo(() => parsePrometheus(data.text), [data.text])

	const [search, setSearch] = useState('')
	const [query, setQuery] = useState('')
	const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
	const [showRaw, setShowRaw] = useState(false)
	const [showAll, setShowAll] = useState(false)

	useEffect(() => {
		const timer = setTimeout(() => setQuery(search), 300)
		return () => clearTimeout(timer)
	}, [search])

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase()
		return families.filter((family) => {
			if (typeFilter !== 'all' && family.type !== typeFilter) {
				return false
			}
			if (!q) return true
			if (family.name.toLowerCase().includes(q)) return true
			if (family.help.toLowerCase().includes(q)) return true
			return family.samples.some((sample) =>
				Object.values(sample.labels).some((label) =>
					label.toLowerCase().includes(q)
				)
			)
		})
	}, [families, query, typeFilter])

	const visible = showAll ? filtered : filtered.slice(0, INITIAL_FAMILIES)

	const httpFamily = families.find(
		(family) => family.name === 'http_requests_total'
	)
	const httpTotal = httpFamily
		? httpFamily.samples.reduce((acc, sample) => acc + sample.value, 0)
		: null
	const http5xx = httpFamily
		? httpFamily.samples
				.filter((sample) =>
					(sample.labels.status ?? '').startsWith('5')
				)
				.reduce((acc, sample) => acc + sample.value, 0)
		: null
	const errorRate =
		httpTotal !== null && http5xx !== null && httpTotal > 0
			? ((http5xx / httpTotal) * 100).toFixed(2)
			: null

	const sumFamily = (name: string): number | null => {
		const family = families.find((item) => item.name === name)
		if (!family) return null
		return family.samples.reduce((acc, sample) => acc + sample.value, 0)
	}

	const unoRequests = sumFamily('uno_upstream_requests_total')
	const unoErrors = sumFamily('uno_upstream_errors_total')
	const ipBlocks = sumFamily('ip_blocks_total')

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h1 className="font-semibold text-2xl">
						{t('admin.metrics.title')}
					</h1>
					<p className="mt-1 text-neutral-400 text-sm">
						{t('admin.metrics.updatedAt', {
							date: formatDate(data.fetchedAt, 'time'),
						})}
						{' · '}
						{t('admin.metrics.autoRefresh')}
					</p>
				</div>
				<Button
					disabled={isFetching}
					onClick={() => refetch()}
					size="sm"
					variant="outline"
				>
					<Icon
						className={cn('text-lg', isFetching && 'animate-spin')}
						icon="lucide:refresh-cw"
					/>
					{t('admin.metrics.refresh')}
				</Button>
			</div>

			<section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
				<MetricCard
					accent="sky"
					icon="lucide:activity"
					label={t('admin.metrics.requestsTotal')}
					sub={
						http5xx === null
							? undefined
							: t('admin.metrics.fiveXX', {
									count: numberFmt.format(http5xx),
								})
					}
					value={
						httpTotal === null ? '—' : numberFmt.format(httpTotal)
					}
				/>
				<MetricCard
					accent={
						http5xx !== null && http5xx > 0 ? 'rose' : 'emerald'
					}
					icon="lucide:shield-x"
					label={t('admin.metrics.errorRate')}
					value={errorRate === null ? '—' : `${errorRate}%`}
				/>
				<MetricCard
					accent="violet"
					icon="lucide:arrow-right-left"
					label={t('admin.metrics.unoRequests')}
					sub={
						unoErrors === null
							? undefined
							: t('admin.metrics.upstreamErrors', {
									count: numberFmt.format(unoErrors),
								})
					}
					value={
						unoRequests === null
							? '—'
							: numberFmt.format(unoRequests)
					}
				/>
				<MetricCard
					accent={
						unoErrors !== null && unoErrors > 0 ? 'rose' : 'emerald'
					}
					icon="lucide:triangle-alert"
					label={t('admin.metrics.unoErrors')}
					value={
						unoErrors === null ? '—' : numberFmt.format(unoErrors)
					}
				/>
				<MetricCard
					accent="amber"
					icon="lucide:shield-ban"
					label={t('admin.metrics.ipBlocks')}
					value={ipBlocks === null ? '—' : numberFmt.format(ipBlocks)}
				/>
			</section>

			<section className="flex flex-wrap items-center gap-2">
				<Input
					className="w-full md:w-72"
					onChange={(e) => setSearch(e.target.value)}
					placeholder={t('admin.metrics.search')}
					value={search}
				/>
				<div className="flex flex-wrap gap-1.5">
					{TYPE_FILTERS.map((filter) => (
						<button
							className={cn(
								'cursor-pointer rounded-lg px-3 py-1.5 font-medium text-sm ring-2 transition-all duration-400',
								typeFilter === filter
									? 'bg-primary text-primary-foreground ring-primary'
									: 'bg-transparent text-muted-foreground ring-primary/40 hover:bg-muted'
							)}
							key={filter}
							onClick={() => setTypeFilter(filter)}
							type="button"
						>
							{t(`admin.metrics.filter.${filter}`)}
						</button>
					))}
				</div>
				<Button
					onClick={() => setShowRaw((v) => !v)}
					size="sm"
					variant="outline"
				>
					<Icon
						className={cn(
							'text-lg transition-transform duration-200',
							showRaw && 'rotate-90'
						)}
						icon="lucide:code"
					/>
					{t('admin.metrics.raw')}
				</Button>
			</section>

			{showRaw && (
				<pre className="max-h-96 overflow-auto rounded-lg border border-border bg-card/50 p-3 font-mono text-xs leading-relaxed">
					{data.text}
				</pre>
			)}

			<section className="flex flex-col gap-2">
				<h2 className="flex items-center gap-2 font-semibold text-lg">
					<Icon icon="lucide:list" />
					{t('admin.metrics.familiesTitle')}
					<span className="font-normal text-neutral-400 text-sm">
						{numberFmt.format(filtered.length)}
					</span>
				</h2>
				{visible.map((family) => (
					<FamilyCard family={family} key={family.name} />
				))}
				{filtered.length > INITIAL_FAMILIES && !showAll && (
					<Button
						className="self-center"
						onClick={() => setShowAll(true)}
						size="sm"
						variant="outline"
					>
						{t('admin.metrics.showAll', {
							count: numberFmt.format(filtered.length),
						})}
					</Button>
				)}
				{filtered.length === 0 && (
					<Card.Root className="items-center text-muted-foreground text-sm">
						{t('admin.metrics.empty')}
					</Card.Root>
				)}
			</section>
		</div>
	)
}

function FamilyCard({ family }: { family: PromMetricFamily }) {
	const t = useTranslations()
	const [open, setOpen] = useState(false)

	const histLike = family.type === 'histogram' || family.type === 'summary'
	const unlabeled = family.samples.filter(
		(sample) => Object.keys(sample.labels).length === 0
	)
	const derived =
		histLike && unlabeled.length >= 2
			? { count: unlabeled[1].value, sum: unlabeled[0].value }
			: null

	return (
		<div className="rounded-lg border border-border bg-card/50">
			<button
				className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left"
				onClick={() => setOpen((v) => !v)}
				type="button"
			>
				<Icon
					className={cn(
						'shrink-0 text-neutral-400 transition-transform duration-200',
						open && 'rotate-90'
					)}
					icon="lucide:chevron-right"
				/>
				<span className="truncate font-mono text-sm">
					{family.name}
				</span>
				<span
					className={cn(
						'shrink-0 rounded px-1.5 py-0.5 font-semibold text-[10px] uppercase',
						TYPE_BADGES[family.type]
					)}
				>
					{t(`admin.metrics.type.${family.type}`)}
				</span>
				<span className="ml-auto shrink-0 text-neutral-400 text-xs">
					{t('admin.metrics.samplesCount', {
						count: numberFmt.format(family.samples.length),
					})}
				</span>
			</button>
			{open && (
				<div className="flex flex-col gap-2 border-border/60 border-t px-3 py-2">
					{family.help && (
						<p className="text-neutral-400 text-xs">
							{family.help}
						</p>
					)}
					<div className="flex flex-col gap-1">
						{derived && (
							<>
								<DerivedRow
									label={t('admin.metrics.sum')}
									value={valueFmt.format(derived.sum)}
								/>
								<DerivedRow
									label={t('admin.metrics.count')}
									value={valueFmt.format(derived.count)}
								/>
								<DerivedRow
									label={t('admin.metrics.avg')}
									value={valueFmt.format(
										derived.count > 0
											? derived.sum / derived.count
											: 0
									)}
								/>
							</>
						)}
						{family.samples.map((sample, index) => {
							const labels = Object.entries(sample.labels)
							if (derived && labels.length === 0) return null
							return (
								<div
									className="flex items-center justify-between gap-3 text-sm"
									key={index}
								>
									<div className="flex min-w-0 flex-wrap gap-1">
										{labels.map(([key, label]) => (
											<span
												className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-neutral-300"
												key={`${key}=${label}`}
											>
												{`${key}=${label}`}
											</span>
										))}
									</div>
									<span className="shrink-0 text-right font-mono">
										{valueFmt.format(sample.value)}
									</span>
								</div>
							)
						})}
					</div>
				</div>
			)}
		</div>
	)
}

function DerivedRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between gap-3 text-sm">
			<span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] text-primary">
				{label}
			</span>
			<span className="shrink-0 text-right font-mono">{value}</span>
		</div>
	)
}

function MetricsError({
	message,
	onRetry,
}: {
	message: string
	onRetry: () => void
}) {
	const t = useTranslations()

	return (
		<Card.Root className="items-start">
			<div className="flex items-center gap-2 font-semibold text-rose-400">
				<Icon icon="lucide:triangle-alert" />
				{t('admin.metrics.loadError')}
			</div>
			<p className="font-mono text-neutral-400 text-xs">{message}</p>
			<Button onClick={onRetry} size="sm" variant="outline">
				{t('admin.metrics.retry')}
			</Button>
		</Card.Root>
	)
}

class MetricsErrorBoundary extends Component<
	{ children: ReactNode; onRetry: () => void },
	{ error: Error | null }
> {
	state: { error: Error | null } = { error: null }

	static getDerivedStateFromError(error: Error) {
		return { error }
	}

	render() {
		if (this.state.error) {
			return (
				<MetricsError
					message={this.state.error.message}
					onRetry={() => {
						this.setState({ error: null })
						this.props.onRetry()
					}}
				/>
			)
		}
		return this.props.children
	}
}
