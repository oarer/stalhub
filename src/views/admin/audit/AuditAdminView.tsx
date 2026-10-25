'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/date'
import { adminAuditQueries } from '@/queries/admin/audit.queries'
import type { AdminAuditEntry } from '@/types/admin.type'

const numberFmt = new Intl.NumberFormat()

const ACTION_COLORS: Record<string, string> = {
	DELETE: 'bg-rose-500/10 text-rose-400',
	POST: 'bg-emerald-500/10 text-emerald-400',
	PATCH: 'bg-amber-500/10 text-amber-400',
	PUT: 'bg-sky-500/10 text-sky-400',
}

export default function AuditAdminView() {
	const t = useTranslations()
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState('')
	const [entity, setEntity] = useState<string | undefined>(undefined)
	const debounced = useDebounce(search)

	const { data } = useSuspenseQuery(
		adminAuditQueries.list({
			page,
			search: debounced || undefined,
			entity,
		})
	)

	const entities = Object.entries(data.facets.entities).sort(
		(a, b) => b[1] - a[1]
	)

	const onPageChange = (nextPage: number) => {
		setPage(nextPage)
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-semibold text-2xl">
						{t('admin.audit.title')}
					</h1>
					<p className="mt-1 text-neutral-400 text-sm">
						{t('admin.audit.total', {
							count: numberFmt.format(data.total_count),
						})}
					</p>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<Input
					className="w-full md:w-72"
					onChange={(e) => {
						setSearch(e.target.value)
						setPage(1)
					}}
					placeholder={t('admin.audit.search')}
					value={search}
				/>
				<EntityToggles
					entities={entities}
					onChange={(value) => {
						setEntity(value || undefined)
						setPage(1)
					}}
					value={entity}
				/>
			</div>

			<div className="flex flex-col gap-2">
				{data.data.map((entry) => (
					<Row entry={entry} key={entry.id} />
				))}
				{data.data.length === 0 && (
					<p className="py-12 text-center text-neutral-500 text-sm">
						{t('admin.audit.empty')}
					</p>
				)}
			</div>

			<Pagination
				onPageChange={onPageChange}
				page={data.page}
				totalPages={Math.ceil(data.total_count / data.take)}
			/>
		</div>
	)
}

function EntityToggles({
	entities,
	value,
	onChange,
}: {
	entities: [string, number][]
	value: string | undefined
	onChange: (value: string) => void
}) {
	const t = useTranslations()

	return (
		<div className="flex flex-wrap gap-2">
			<Button
				className={cn(
					'text-xs',
					!value
						? 'bg-sky-500/10 text-sky-400 ring-sky-500'
						: 'text-muted-foreground'
				)}
				onClick={() => onChange('')}
				size="sm"
				variant="outline"
			>
				{t('admin.audit.all')}
			</Button>
			{entities.map(([name, count]) => (
				<Button
					className={cn(
						'text-xs',
						value === name
							? 'bg-sky-500/10 text-sky-400 ring-sky-500'
							: 'text-muted-foreground'
					)}
					key={name}
					onClick={() => onChange(name)}
					size="sm"
					variant="outline"
				>
					{name}
					<span className="font-mono opacity-70">{count}</span>
				</Button>
			))}
		</div>
	)
}

function Row({ entry }: { entry: AdminAuditEntry }) {
	const t = useTranslations()
	const [method, entity] = entry.action.split(' ')

	const details = entry.meta?.body
		? Object.fromEntries(
				Object.entries(entry.meta.body).filter(
					([key]) => !['reason', 'content'].includes(key)
				)
			)
		: null
	const error = entry.meta?.status && entry.meta.status >= 400

	return (
		<Card.Root
			className={cn(
				'flex-row flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3',
				error && 'ring-rose-500/40'
			)}
		>
			<span
				className={cn(
					'rounded-md px-2 py-0.5 font-mono font-semibold text-[11px]',
					ACTION_COLORS[method] ?? 'bg-muted text-foreground'
				)}
			>
				{method}
			</span>
			<div className="flex min-w-0 flex-col">
				<span className="text-sm">
					<span className="font-semibold">{entity}</span>
					{entry.entity_id && (
						<span className="font-mono text-neutral-400 text-xs">
							{' '}
							#{entry.entity_id}
						</span>
					)}
				</span>
				{details && (
					<span className="truncate font-mono text-neutral-500 text-xs">
						{JSON.stringify(details)}
					</span>
				)}
			</div>
			<div className="ml-auto flex items-center gap-3">
				<span className="text-neutral-400 text-xs">
					{entry.actor_name}
					{entry.actor_id ? ` (#${entry.actor_id})` : ''}
				</span>
				<span
					className={cn(
						'flex items-center gap-1',
						error ? 'text-rose-400' : 'text-emerald-400'
					)}
					title={t('admin.audit.status')}
				>
					<Icon
						icon={
							error ? 'lucide:x-circle' : 'lucide:check-circle-2'
						}
					/>
					<span className="font-mono text-xs">
						{entry.meta?.status ?? 200}
					</span>
				</span>
				<Badge className="shrink-0" variant="secondary">
					{formatDate(entry.created_at, 'datetime')}
				</Badge>
			</div>
		</Card.Root>
	)
}
