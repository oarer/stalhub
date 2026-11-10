'use client'

import { Icon } from '@iconify/react'
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { CLink } from '@/components/ui/Link'
import { Pagination } from '@/components/ui/Pagination'
import { Table } from '@/components/ui/Table'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate } from '@/lib/date'
import { adminDisputeQueries } from '@/queries/admin/dispute.queries'
import { adminDisputeService } from '@/services/admin/dispute.service'
import { useAuthStore } from '@/stores/useAuth.store'
import type { AdminDispute } from '@/types/admin.type'
import { commissionMoney } from '@/types/commission.type'
import { Status } from '@/views/commissions/components/shared'
import { AdminEmptyRow, AdminTableHeader } from '../components/AdminTable'

const KINDS = ['ORDER', 'REVIEW'] as const
const STATUSES = ['OPEN', 'RESOLVED'] as const
const ASSIGNED = ['all', 'unassigned', 'me'] as const

export default function DisputesAdminView() {
	const t = useTranslations()
	const tc = useTranslations('commissions')
	const client = useQueryClient()
	const user = useAuthStore((state) => state.user)
	const userId = user?.id
	const owner = user?.roles.some((role) => role.name === 'owner') ?? false
	const [search, setSearch] = useState('')
	const [kind, setKind] = useState<string>('')
	const [status, setStatus] = useState<string>('')
	const [assigned, setAssigned] = useState<string>('all')
	const [page, setPage] = useState(1)
	const take = 24
	const debouncedSearch = useDebounce(search)
	const claim = useMutation({
		mutationFn: (entry: AdminDispute) =>
			adminDisputeService.command(entry.id, {
				action: 'claim',
				key: crypto.randomUUID(),
				version: entry.version,
			}),
		onSuccess: async () => {
			await client.invalidateQueries({ queryKey: ['admin', 'disputes'] })
		},
	})

	const { data } = useSuspenseQuery(
		adminDisputeQueries.list({
			take,
			page,
			status: status || undefined,
			kind: kind || undefined,
			assigned: assigned as 'all' | 'unassigned' | 'me',
			search: debouncedSearch || undefined,
		})
	)
	const { data: stats } = useSuspenseQuery(adminDisputeQueries.stats())
	const totalPages = data ? Math.ceil(data.total_count / take) : 1

	return (
		<div className="flex flex-col gap-6">
			<h1
				className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
			>
				{t('admin.disputes.title')}
			</h1>

			{stats && (
				<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
					<Card.Root>
						<Card.Content className="flex items-center gap-3 py-4">
							<div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
								<Icon
									className="size-5 text-amber-400"
									icon="lucide:scale"
								/>
							</div>
							<div>
								<p className="font-medium font-mono text-2xl">
									{stats.open}
								</p>
								<p className="font-medium text-foreground text-xs">
									{t('admin.disputes.stats.open')}
								</p>
							</div>
						</Card.Content>
					</Card.Root>
					<Card.Root>
						<Card.Content className="flex items-center gap-3 py-4">
							<div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
								<Icon
									className="size-5 text-emerald-400"
									icon="lucide:check-check"
								/>
							</div>
							<div>
								<p className="font-medium font-mono text-2xl">
									{stats.resolved}
								</p>
								<p className="font-medium text-foreground text-xs">
									{t('admin.disputes.stats.resolved')}
								</p>
							</div>
						</Card.Content>
					</Card.Root>
					<Card.Root>
						<Card.Content className="flex items-center gap-3 py-4">
							<div className="flex size-10 items-center justify-center rounded-lg bg-sky-500/10">
								<Icon
									className="size-5 text-sky-400"
									icon="lucide:inbox"
								/>
							</div>
							<div>
								<p className="font-medium font-mono text-2xl">
									{stats.unassigned}
								</p>
								<p className="font-medium text-foreground text-xs">
									{t('admin.disputes.stats.unassigned')}
								</p>
							</div>
						</Card.Content>
					</Card.Root>
					<Card.Root>
						<Card.Content className="flex items-center gap-3 py-4">
							<div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10">
								<Icon
									className="size-5 text-violet-400"
									icon="lucide:user-check"
								/>
							</div>
							<div>
								<p className="font-medium font-mono text-2xl">
									{stats.assigned_to_me}
								</p>
								<p className="font-medium text-foreground text-xs">
									{t('admin.disputes.stats.assignedToMe')}
								</p>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			)}

			{claim.error && (
				<Alert.Root role="alert" variant="destructive">
					{t('admin.disputes.actionError')}
				</Alert.Root>
			)}

			<div className="flex flex-wrap items-end gap-3">
				<div className="w-full flex-1 md:w-80">
					<Input
						label="admin.disputes.search"
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setSearch(e.target.value)
							setPage(1)
						}}
						value={search}
					/>
				</div>
				<div className="flex gap-1">
					{[undefined, ...KINDS].map((value) => (
						<Button
							className={
								kind === (value ?? '')
									? 'bg-sky-500/10 text-sky-400 text-xs ring-sky-500'
									: 'text-xs'
							}
							key={value ?? 'all'}
							onClick={() => {
								setKind(value ?? '')
								setPage(1)
							}}
							size="sm"
							variant="outline"
						>
							{value
								? t(
										`admin.disputes.kind.${value.toLowerCase()}`
									)
								: t('admin.disputes.filter.allKinds')}
						</Button>
					))}
				</div>
				<div className="flex gap-1">
					{[undefined, ...STATUSES].map((value) => (
						<Button
							className={
								status === (value ?? '')
									? 'bg-sky-500/10 text-sky-400 text-xs ring-sky-500'
									: 'text-xs'
							}
							key={value ?? 'all'}
							onClick={() => {
								setStatus(value ?? '')
								setPage(1)
							}}
							size="sm"
							variant="outline"
						>
							{value
								? t(
										`admin.disputes.status.${value.toLowerCase()}`
									)
								: t('admin.disputes.filter.allStatuses')}
						</Button>
					))}
				</div>
				<div className="flex gap-1">
					{ASSIGNED.map((value) => (
						<Button
							className={
								assigned === value
									? 'bg-sky-500/10 text-sky-400 text-xs ring-sky-500'
									: 'text-xs'
							}
							key={value}
							onClick={() => {
								setAssigned(value)
								setPage(1)
							}}
							size="sm"
							variant="outline"
						>
							{t(`admin.disputes.filter.${value}`)}
						</Button>
					))}
				</div>
			</div>

			<Card.Root className="overflow-hidden p-0">
				<div className="overflow-x-auto">
					<Table.Root>
						<AdminTableHeader
							columns={[
								{
									key: 'order',
									label: t('admin.disputes.table.order'),
								},
								{
									key: 'kind',
									label: t('admin.disputes.table.kind'),
								},
								{
									key: 'status',
									label: t('admin.disputes.table.status'),
								},
								{
									key: 'arbiter',
									label: t('admin.disputes.table.arbiter'),
								},
								{
									key: 'created',
									label: t('admin.disputes.table.created'),
								},
							]}
						/>
						<Table.Body>
							{data?.data.map((entry) => {
								const participant =
									!owner &&
									(userId === entry.order.customer.id ||
										userId === entry.order.artist.id ||
										userId === entry.opened_by)
								const mine =
									!participant && entry.assigned_to === userId
								const claiming =
									claim.isPending &&
									claim.variables?.id === entry.id

								return (
									<Table.Row key={entry.id}>
										<Table.Cell>
											<span className="font-mono text-neutral-400 text-xs">
												{entry.id}
											</span>
										</Table.Cell>
										<Table.Cell>
											<div className="flex flex-col">
												<span className="font-medium text-sm">
													{entry.order.title}
												</span>
												<span className="text-muted-foreground text-xs">
													{
														entry.order.customer
															.username
													}{' '}
													·{' '}
													{
														entry.order.artist
															.username
													}
												</span>
												<span className="font-mono text-muted-foreground text-xs">
													{commissionMoney(
														entry.order.total,
														entry.order.currency
													)}
												</span>
											</div>
										</Table.Cell>
										<Table.Cell>
											<Badge
												variant={
													entry.kind === 'REVIEW'
														? 'media'
														: 'stalhub'
												}
											>
												{t(
													`admin.disputes.kind.${entry.kind.toLowerCase()}`
												)}
											</Badge>
										</Table.Cell>
										<Table.Cell>
											<Status value={entry.status} />
										</Table.Cell>
										<Table.Cell>
											<span className="text-sm">
												{entry.assigned_to_user
													?.username ??
													t(
														'admin.disputes.unassigned'
													)}
											</span>
										</Table.Cell>
										<Table.Cell>
											<span className="text-muted-foreground text-xs">
												{formatDate(
													entry.created_at,
													'date'
												)}
											</span>
										</Table.Cell>
										<Table.Cell>
											<div className="flex items-center gap-3">
												{!participant &&
													entry.assigned_to !==
														userId && (
														<Button
															loading={claiming}
															onClick={() =>
																claim.mutate(
																	entry
																)
															}
															size="sm"
															variant="outline"
														>
															{entry.assigned_to
																? t(
																		'admin.disputes.takeOver'
																	)
																: tc('claim')}
														</Button>
													)}
												{mine && (
													<CLink
														className="px-0 text-primary"
														href={`/admin/disputes/${entry.id}`}
														variant="none"
													>
														{tc(
															entry.status ===
																'OPEN'
																? 'decision'
																: 'reopen'
														)}
													</CLink>
												)}
												<CLink
													className="px-0 text-primary"
													href={`/admin/disputes/${entry.id}`}
													variant="none"
												>
													{t('admin.disputes.open')}
												</CLink>
											</div>
										</Table.Cell>
									</Table.Row>
								)
							})}
							{(!data || data.data.length === 0) && (
								<AdminEmptyRow
									colCount={7}
									message={t('admin.disputes.empty')}
								/>
							)}
						</Table.Body>
					</Table.Root>
				</div>
			</Card.Root>

			<Pagination
				onPageChange={setPage}
				page={page}
				totalPages={totalPages}
			/>
		</div>
	)
}
