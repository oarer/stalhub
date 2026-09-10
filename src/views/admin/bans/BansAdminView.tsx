'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Table } from '@/components/ui/Table'
import { useDebounce } from '@/hooks/useDebounce'
import { adminBanQueries } from '@/queries/admin/ban.queries'

const BAN_RULES = [
	{ value: 'login_bruteforce', label: 'Login Bruteforce' },
	{ value: 'request_abuse', label: 'Request Abuse' },
	{ value: 'content_spam', label: 'Content Spam' },
] as const

export default function BansAdminView() {
	const t = useTranslations()
	const [search, setSearch] = useState('')
	const [rule, setRule] = useState<string>('')
	const [auto, setAuto] = useState<'all' | 'auto' | 'manual'>('all')
	const [page, setPage] = useState(1)
	const take = 24
	const debouncedSearch = useDebounce(search)

	const { data } = useSuspenseQuery(
		adminBanQueries.list({
			take,
			page,
			search: debouncedSearch || undefined,
			rule: rule || undefined,
			auto: auto === 'all' ? undefined : auto === 'auto',
		})
	)

	const { data: stats } = useSuspenseQuery(adminBanQueries.stats())

	const totalPages = data ? Math.ceil(data.total_count / take) : 1

	return (
		<div className="flex flex-col gap-6">
			<h1 className="font-semibold text-2xl">
				{t('admin.bans.title')}
			</h1>

			{stats && (
				<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
					<Card.Root>
						<Card.Content className="flex items-center gap-3 py-4">
							<div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
								<Icon
									className="size-5 text-amber-400"
									icon="lucide:alert-triangle"
								/>
							</div>
							<div>
								<p className="font-bold text-2xl">
									{stats.total_warnings}
								</p>
								<p className="text-text-accent text-xs">
									{t('admin.bans.stats.warnings')}
								</p>
							</div>
						</Card.Content>
					</Card.Root>
					<Card.Root>
						<Card.Content className="flex items-center gap-3 py-4">
							<div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10">
								<Icon
									className="size-5 text-red-400"
									icon="lucide:ban"
								/>
							</div>
							<div>
								<p className="font-bold text-2xl">
									{stats.total_bans}
								</p>
								<p className="text-text-accent text-xs">
									{t('admin.bans.stats.bans')}
								</p>
							</div>
						</Card.Content>
					</Card.Root>
					<Card.Root>
						<Card.Content className="flex items-center gap-3 py-4">
							<div className="flex size-10 items-center justify-center rounded-lg bg-orange-500/10">
								<Icon
									className="size-5 text-orange-400"
									icon="lucide:bot"
								/>
							</div>
							<div>
								<p className="font-bold text-2xl">
									{stats.auto_banned_users}
								</p>
								<p className="text-text-accent text-xs">
									{t('admin.bans.stats.autoBanned')}
								</p>
							</div>
						</Card.Content>
					</Card.Root>
					<Card.Root>
						<Card.Content className="flex items-center gap-3 py-4">
							<div className="flex size-10 items-center justify-center rounded-lg bg-yellow-500/10">
								<Icon
									className="size-5 text-yellow-400"
									icon="lucide:shield-alert"
								/>
							</div>
							<div>
								<p className="font-bold text-2xl">
									{stats.auto_warned_users}
								</p>
								<p className="text-text-accent text-xs">
									{t('admin.bans.stats.autoWarned')}
								</p>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			)}

			{stats && stats.by_rule.length > 0 && (
				<Card.Root>
					<Card.Header>
						<Card.Title>
							<Icon icon="lucide:bar-chart-3" />
							{t('admin.bans.stats.byRule')}
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<div className="flex flex-wrap gap-3">
							{stats.by_rule.map((entry) => (
								<div
									className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2"
									key={`${entry.rule}-${entry.severity}`}
								>
									<Badge
										variant={
											entry.severity === 'BAN'
												? 'danger'
												: 'secondary'
										}
									>
										{entry.severity}
									</Badge>
									<span className="text-sm">
										{entry.rule}
									</span>
									<span className="font-bold text-sm text-text-accent">
										{entry._count._all}
									</span>
								</div>
							))}
						</div>
					</Card.Content>
				</Card.Root>
			)}

			<div className="flex flex-wrap items-end gap-3">
				<div className="w-full flex-1 md:w-80">
					<Input
						label="admin.bans.search"
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setSearch(e.target.value)
							setPage(1)
						}}
						value={search}
					/>
				</div>
				<div className="flex gap-1">
					{(['all', 'auto', 'manual'] as const).map((opt) => (
						<button
							className={`rounded-lg border-2 px-3 py-1.5 font-semibold text-xs transition-colors ${
								auto === opt
									? 'border-sky-500 bg-sky-500/10 text-sky-400'
									: 'border-primary hover:border-sky-500/30'
							}`}
							key={opt}
							onClick={() => {
								setAuto(opt)
								setPage(1)
							}}
							type="button"
						>
							{opt === 'all'
								? t('admin.bans.filter.all')
								: opt === 'auto'
									? t('admin.bans.filter.auto')
									: t('admin.bans.filter.manual')}
						</button>
					))}
				</div>
				<div className="flex gap-1">
					<button
						className={`rounded-lg border-2 px-3 py-1.5 font-semibold text-xs transition-colors ${
							rule === ''
								? 'border-sky-500 bg-sky-500/10 text-sky-400'
								: 'border-primary hover:border-sky-500/30'
						}`}
						onClick={() => {
							setRule('')
							setPage(1)
						}}
						type="button"
					>
						{t('admin.bans.filter.allRules')}
					</button>
					{BAN_RULES.map((r) => (
						<button
							className={`rounded-lg border-2 px-3 py-1.5 font-semibold text-xs transition-colors ${
								rule === r.value
									? 'border-sky-500 bg-sky-500/10 text-sky-400'
									: 'border-primary hover:border-sky-500/30'
							}`}
							key={r.value}
							onClick={() => {
								setRule(r.value)
								setPage(1)
							}}
							type="button"
						>
							{r.label}
						</button>
					))}
				</div>
			</div>

			<Card.Root className="overflow-hidden p-0">
				<div className="overflow-x-auto">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>ID</Table.Head>
								<Table.Head>
									{t('admin.bans.table.user')}
								</Table.Head>
								<Table.Head>
									{t('admin.bans.table.rule')}
								</Table.Head>
								<Table.Head>
									{t('admin.bans.table.severity')}
								</Table.Head>
								<Table.Head>
									{t('admin.bans.table.type')}
								</Table.Head>
								<Table.Head>
									{t('admin.bans.table.reason')}
								</Table.Head>
								<Table.Head>
									{t('admin.bans.table.date')}
								</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{data?.data.map((ban) => (
								<Table.Row key={ban.id}>
									<Table.Cell>
										<span className="font-mono text-neutral-400 text-xs">
											{ban.id}
										</span>
									</Table.Cell>
									<Table.Cell>
										<span className="font-semibold text-sm">
											{ban.user?.username ?? `#${ban.user_id}`}
										</span>
										{ban.user?.name && (
											<span className="ml-1 text-text-accent text-xs">
												({ban.user.name})
											</span>
										)}
									</Table.Cell>
									<Table.Cell>
										<span className="text-xs">
											{ban.rule}
										</span>
									</Table.Cell>
									<Table.Cell>
										<Badge
											variant={
												ban.severity === 'BAN'
													? 'danger'
													: 'secondary'
											}
										>
											{ban.severity}
										</Badge>
									</Table.Cell>
									<Table.Cell>
										<Badge
											variant={
												ban.auto
													? 'secondary'
													: 'primary'
											}
										>
											{ban.auto
												? t('admin.bans.type.auto')
												: t('admin.bans.type.manual')}
										</Badge>
									</Table.Cell>
									<Table.Cell>
										<span className="max-w-48 truncate text-neutral-400 text-xs">
											{ban.reason || '—'}
										</span>
									</Table.Cell>
									<Table.Cell>
										<span className="text-neutral-400 text-xs">
											{new Date(
												ban.created_at
											).toLocaleDateString()}
										</span>
									</Table.Cell>
								</Table.Row>
							))}
							{(!data || data.data.length === 0) && (
								<Table.Row>
									<Table.Cell>
										<span className="text-neutral-400 text-sm">
											{t('admin.bans.empty')}
										</span>
									</Table.Cell>
									<Table.Cell />
									<Table.Cell />
									<Table.Cell />
									<Table.Cell />
									<Table.Cell />
									<Table.Cell />
								</Table.Row>
							)}
						</Table.Body>
					</Table.Root>
				</div>
			</Card.Root>

			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-2">
					<Button
						disabled={page <= 1}
						onClick={() => setPage((p) => p - 1)}
						size="sm"
						variant="outline"
					>
						<Icon icon="lucide:chevron-left" />
					</Button>
					<span className="text-neutral-400 text-sm">
						{page} / {totalPages}
					</span>
					<Button
						disabled={page >= totalPages}
						onClick={() => setPage((p) => p + 1)}
						size="sm"
						variant="outline"
					>
						<Icon icon="lucide:chevron-right" />
					</Button>
				</div>
			)}
		</div>
	)
}
