'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/date'
import { adminDashboardQueries } from '@/queries/admin/dashboard.queries'
import type { AdminDashboardRange } from '@/types/admin.type'
import {
	ArticleStatusesChart,
	ContentCreatedChart,
	RegistrationsChart,
	ServerOnlineChart,
	ViewsChart,
} from './components/DashboardCharts'
import { ChartShell, MetricCard, StatCard } from './components/Shared'

const RANGES: AdminDashboardRange[] = [7, 14, 30, 90]

const ARTICLE_STATUSES = ['PENDING', 'APPROVED', 'REVIEW', 'DENIED', 'BANNED']

const numberFmt = new Intl.NumberFormat()

export default function DashboardAdminView() {
	const t = useTranslations()
	const [range, setRange] = useState<AdminDashboardRange>(30)

	const { data } = useSuspenseQuery(adminDashboardQueries.summary(range))

	return (
		<div className="flex flex-col gap-6">
			<DashboardHeader
				generatedAt={data.generated_at}
				onRangeChange={setRange}
				range={range}
			/>

			<section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
				<MetricCard
					accent="primary"
					icon="lucide:users"
					label={t('admin.dashboard.users.total')}
					value={numberFmt.format(data.users.total)}
				/>
				<MetricCard
					accent="emerald"
					icon="lucide:user-plus"
					label={t('admin.dashboard.users.newToday')}
					sub={t('admin.dashboard.users.newPeriod', {
						days: 7,
						count: numberFmt.format(data.users.new_7d),
					})}
					value={numberFmt.format(data.users.new_today)}
				/>
				<MetricCard
					accent="sky"
					icon="lucide:activity"
					label={t('admin.dashboard.users.activeSessions')}
					sub={t('admin.dashboard.users.newPeriod', {
						days: 7,
						count: numberFmt.format(data.users.active_sessions_7d),
					})}
					value={numberFmt.format(data.users.active_sessions_24h)}
				/>
				<MetricCard
					accent="rose"
					icon="lucide:ban"
					label={t('admin.dashboard.users.banned')}
					sub={t('admin.dashboard.users.autoWarnedShort', {
						count: numberFmt.format(data.users.auto_warned),
					})}
					value={numberFmt.format(data.users.banned)}
				/>
				<MetricCard
					accent="violet"
					icon="lucide:check-circle-2"
					label={t('admin.dashboard.users.onboarded')}
					value={numberFmt.format(data.users.onboarded)}
				/>
			</section>

			<section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
				<RegistrationsChart trend={data.users.registration_trend} />
				<ServerOnlineChart history={data.server_online.history_24h} />
			</section>

			<section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
				<MetricCard
					accent="emerald"
					icon="lucide:box"
					label={t('admin.dashboard.content.builds')}
					sub={t('admin.dashboard.viewsShort', {
						count: numberFmt.format(data.content.builds.views),
					})}
					value={numberFmt.format(data.content.builds.total)}
				/>
				<MetricCard
					accent="amber"
					icon="lucide:book-open"
					label={t('admin.dashboard.content.articles')}
					sub={t('admin.dashboard.viewsShort', {
						count: numberFmt.format(data.content.articles.views),
					})}
					value={numberFmt.format(data.content.articles.total)}
				/>
				<MetricCard
					accent="violet"
					icon="lucide:palette"
					label={t('admin.dashboard.content.arts')}
					sub={t('admin.dashboard.viewsShort', {
						count: numberFmt.format(data.content.arts.views),
					})}
					value={numberFmt.format(data.content.arts.total)}
				/>
				<MetricCard
					accent="cyan"
					icon="lucide:list-ordered"
					label={t('admin.dashboard.content.tierLists')}
					sub={t('admin.dashboard.viewsShort', {
						count: numberFmt.format(data.content.tier_lists.views),
					})}
					value={numberFmt.format(data.content.tier_lists.total)}
				/>
				<MetricCard
					accent="sky"
					icon="lucide:message-circle"
					label={t('admin.dashboard.content.comments')}
					sub={t('admin.dashboard.content.new7d', {
						count: numberFmt.format(data.content.comments.new_7d),
					})}
					value={numberFmt.format(data.content.comments.total)}
				/>
				<MetricCard
					accent="rose"
					icon="lucide:heart"
					label={t('admin.dashboard.content.stars')}
					value={numberFmt.format(data.content.stars.total)}
				/>
			</section>

			<section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
				<ContentCreatedChart trend={data.content.creation_trend} />
				<ViewsChart
					labels={[
						t('admin.dashboard.content.builds'),
						t('admin.dashboard.content.articles'),
						t('admin.dashboard.content.arts'),
						t('admin.dashboard.content.tierLists'),
					]}
					views={[
						data.content.builds.views,
						data.content.articles.views,
						data.content.arts.views,
						data.content.tier_lists.views,
					]}
				/>
			</section>

			<section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
				<StatCard
					accent="rose"
					icon="lucide:shield-ban"
					rows={[
						{
							label: t('admin.dashboard.moderation.banLogs'),
							value: numberFmt.format(
								data.moderation.ban_logs_total
							),
						},
						{
							label: t('admin.dashboard.moderation.bans7d'),
							value: numberFmt.format(data.moderation.bans_7d),
							accent:
								data.moderation.bans_7d > 0 ? 'danger' : 'ok',
						},
						{
							label: t('admin.dashboard.moderation.warnings7d'),
							value: numberFmt.format(
								data.moderation.warnings_7d
							),
						},
						{
							label: t('admin.dashboard.users.autoBannedShort'),
							value: numberFmt.format(
								data.moderation.auto_banned
							),
						},
					]}
					title={t('admin.dashboard.moderation.title')}
				/>
				<StatCard
					accent="emerald"
					icon="lucide:flag"
					rows={[
						{
							label: t('admin.dashboard.clans.total'),
							value: numberFmt.format(data.clans.total),
						},
						{
							label: t('admin.dashboard.clans.members'),
							value: numberFmt.format(data.clans.members_total),
						},
						{
							label: t('admin.dashboard.clans.recruiting'),
							value: numberFmt.format(data.clans.recruiting),
							accent: 'ok',
						},
						{
							label: t('admin.dashboard.clans.blocked'),
							value: numberFmt.format(data.clans.blocked),
							accent:
								data.clans.blocked > 0 ? 'danger' : undefined,
						},
					]}
					title={t('admin.dashboard.clans.title')}
				/>
				<StatCard
					accent="sky"
					icon="lucide:gamepad-2"
					rows={[
						{
							label: t('admin.dashboard.players.popular'),
							value: numberFmt.format(
								data.players.popular_players
							),
						},
						{
							label: t('admin.dashboard.players.blacklist'),
							value: numberFmt.format(
								data.players.blacklist_size
							),
							accent: 'danger',
						},
						{
							label: t('admin.dashboard.players.notes'),
							value: numberFmt.format(data.players.player_notes),
						},
					]}
					title={t('admin.dashboard.players.title')}
				/>
				<StatCard
					accent="violet"
					icon="lucide:settings-2"
					rows={[
						{
							label: t('admin.dashboard.system.roles'),
							value: numberFmt.format(data.system.roles),
						},
						{
							label: t('admin.dashboard.system.permissions'),
							value: numberFmt.format(data.system.permissions),
						},
						{
							label: t('admin.dashboard.system.badges'),
							value: numberFmt.format(data.system.badges),
						},
						{
							label: t('admin.dashboard.system.notifications'),
							value: numberFmt.format(data.system.notifications),
						},
					]}
					title={t('admin.dashboard.system.title')}
				/>
			</section>

			<section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
				<ArticleStatusesChart
					labels={ARTICLE_STATUSES.map((s) =>
						t(`admin.dashboard.status.${s.toLowerCase()}`)
					)}
					statuses={ARTICLE_STATUSES.map(
						(s) => data.content.articles.by_status[s] ?? 0
					)}
				/>
				<BanRulesCard byRule={data.moderation.by_rule} />
			</section>

			<section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
				<TopListCard
					icon="lucide:box"
					items={data.top.builds.map((b) => ({
						id: b.external_id,
						title: b.title,
						views: b.views,
					}))}
					title={t('admin.dashboard.content.builds')}
				/>
				<TopListCard
					icon="lucide:book-open"
					items={data.top.articles.map((a) => ({
						id: a.external_id,
						title: a.title,
						views: a.views,
					}))}
					title={t('admin.dashboard.content.articles')}
				/>
				<TopListCard
					icon="lucide:palette"
					items={data.top.arts.map((a) => ({
						id: `${a.id}`,
						title: a.title ?? t('admin.dashboard.top.untitled'),
						views: a.views,
					}))}
					title={t('admin.dashboard.content.arts')}
				/>
				<TopListCard
					icon="lucide:gamepad-2"
					items={data.top.players.map((p) => ({
						id: p.uuid,
						title: p.username,
						views: p.views,
					}))}
					title={t('admin.dashboard.players.popular')}
				/>
			</section>
		</div>
	)
}

function DashboardHeader({
	generatedAt,
	range,
	onRangeChange,
}: {
	generatedAt: string
	range: AdminDashboardRange
	onRangeChange: (range: AdminDashboardRange) => void
}) {
	const t = useTranslations()

	return (
		<div className="flex flex-wrap items-end justify-between gap-4">
			<div>
				<h1 className="font-semibold text-2xl">
					{t('admin.dashboard.title')}
				</h1>
				<p className="mt-1 text-neutral-400 text-sm">
					{t('admin.dashboard.generatedAt', {
						date: formatDate(generatedAt, 'datetime'),
					})}
				</p>
			</div>
			<div className="flex items-center gap-1 rounded-xl bg-muted p-1">
				{RANGES.map((r) => (
					<Button
						className={cn(
							'text-sm',
							range === r && 'bg-primary/40 font-semibold'
						)}
						key={r}
						onClick={() => onRangeChange(r)}
						size="sm"
						type="button"
						variant="ghost"
					>
						{t('admin.dashboard.range', { n: r })}
					</Button>
				))}
			</div>
		</div>
	)
}

function BanRulesCard({
	byRule,
}: {
	byRule: { rule: string; severity: 'WARN' | 'BAN'; count: number }[]
}) {
	const t = useTranslations()

	return (
		<ChartShell title={t('admin.dashboard.moderation.byRule')}>
			<div className="flex h-full flex-wrap content-start gap-2 overflow-y-auto">
				{byRule.length === 0 && (
					<p className="self-center text-neutral-500 text-sm">—</p>
				)}
				{byRule.map((row) => (
					<div
						className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2"
						key={`${row.rule}-${row.severity}`}
					>
						<Icon
							className={
								row.severity === 'BAN'
									? 'text-rose-400'
									: 'text-amber-400'
							}
							icon={
								row.severity === 'BAN'
									? 'lucide:shield-ban'
									: 'lucide:triangle-alert'
							}
						/>
						<span className="text-sm">{row.rule}</span>
						<span className="font-mono font-semibold text-sm">
							{numberFmt.format(row.count)}
						</span>
					</div>
				))}
			</div>
		</ChartShell>
	)
}

function TopListCard({
	title,
	icon,
	items,
}: {
	title: string
	icon: string
	items: { id: string; title: string; views: number }[]
}) {
	return (
		<StatCard
			accent="primary"
			icon={icon}
			rows={items.map((item, i) => ({
				label: `${i + 1}. ${item.title}`,
				value: numberFmt.format(item.views),
			}))}
			title={title}
		/>
	)
}
