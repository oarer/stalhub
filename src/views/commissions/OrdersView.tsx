'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Combobox } from '@/components/ui/Combobox'
import { CLink } from '@/components/ui/Link'
import { ListRowsSkeleton } from '@/components/ui/PageSkeletons'
import { Tabs } from '@/components/ui/Tabs'
import { commissionQueries as queries } from '@/queries/commission/commission.queries'
import { commissionMoney } from '@/types/commission.type'
import { Feedback, Pages, Status, usePrivateScope } from './components/shared'

const STATUSES = [
	'PENDING',
	'ACCEPTED',
	'IN_PROGRESS',
	'REVIEW',
	'COMPLETED',
	'CANCELLED',
	'DECLINED',
] as const

export default function OrdersView() {
	const t = useTranslations('commissions')
	const user = usePrivateScope()
	const [side, setSide] = useState('customer')
	const [page, setPage] = useState(1)
	const [status, setStatus] = useState('')
	const capabilities = useQuery(queries.capabilities(user))
	const query = useQuery(queries.orders(user, side, page, status))
	return (
		<div className="flex flex-col gap-5">
			<h1 className="font-semibold text-2xl">{t('orders')}</h1>
			<div className="flex flex-wrap items-center gap-3">
				<Tabs.Root
					onValueChange={(value) => {
						setSide(value)
						setPage(1)
					}}
					value={side}
				>
					<Tabs.List className="w-fit">
						<Tabs.Trigger value="customer">
							{t('customerSide')}
						</Tabs.Trigger>
						<Tabs.Trigger value="artist">
							{t('artistSide')}
						</Tabs.Trigger>
					</Tabs.List>
				</Tabs.Root>
				<Combobox
					className="w-full max-w-56"
					onValueChange={(value) => {
						setStatus(value)
						setPage(1)
					}}
					options={[
						{ label: 'commissions.allStatuses', value: '' },
						...STATUSES.map((s) => ({
							label: `commissions.statuses.${s}`,
							value: s,
						})),
					]}
					placeholder="commissions.allStatuses"
					value={status}
				/>
				<div className="ml-auto flex items-center gap-3">
					{capabilities.data?.author && (
						<CLink
							className="px-0 text-primary"
							href="/me/arts/studio"
							variant="none"
						>
							{t('studio')}
						</CLink>
					)}
					{(capabilities.data?.arbitrate ||
						capabilities.data?.owner) && (
						<CLink
							className="px-0 text-primary"
							href="/me/arbitration"
							variant="none"
						>
							{t('arbitration')}
						</CLink>
					)}
				</div>
			</div>
			<Feedback error={query.error} />
			{query.isPending && <ListRowsSkeleton count={6} />}
			{query.data?.data.map((order) => (
				<Card.Link
					className="flex-col gap-2 px-4 py-3 transition-colors md:flex-row md:items-center md:gap-4"
					href={`/me/commissions/${order.id}`}
					key={order.id}
				>
					<Status
						className="hidden shrink-0 justify-center self-center md:flex"
						value={order.status}
					/>
					<div className="min-w-0 flex-1">
						<h2 className="flex items-center gap-2 font-semibold">
							<span className="truncate">{order.title}</span>
							{order.unread && (
								<Badge className="shrink-0" variant="stalhub">
									{t('unread')}
								</Badge>
							)}
						</h2>
						<p className="truncate text-muted-foreground text-sm">
							{t(side === 'artist' ? 'customer' : 'artist')}:{' '}
							{side === 'artist'
								? order.customer.name || order.customer.username
								: order.artist.name || order.artist.username}
						</p>
						<Status
							className="mt-2 self-start md:hidden"
							value={order.status}
						/>
					</div>
					<span className="hidden shrink-0 font-medium text-sm md:block">
						{commissionMoney(order.total, order.currency)}
					</span>
					<Icon
						className="hidden shrink-0 text-muted-foreground md:block"
						icon="lucide:chevron-right"
					/>
				</Card.Link>
			))}
			{query.data?.total === 0 && (
				<div className="flex flex-col items-center gap-2 py-10 text-center">
					<Icon
						className="text-3xl text-muted-foreground"
						icon="lucide:inbox"
					/>
					<p className="text-muted-foreground">{t('empty')}</p>
				</div>
			)}
			<Pages
				onChange={setPage}
				page={page}
				size={20}
				total={query.data?.total ?? 0}
			/>
		</div>
	)
}
