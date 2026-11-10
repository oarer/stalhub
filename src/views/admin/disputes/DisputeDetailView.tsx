'use client'

import { Icon } from '@iconify/react'
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { mtsExtended } from '@/app/fonts'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { CLink } from '@/components/ui/Link'
import { formatDate } from '@/lib/date'
import { adminDisputeQueries } from '@/queries/admin/dispute.queries'
import { adminDisputeService } from '@/services/admin/dispute.service'
import { useAuthStore } from '@/stores/useAuth.store'
import type { CommissionFile } from '@/types/commission.type'
import { commissionMoney } from '@/types/commission.type'
import { Status } from '@/views/commissions/components/shared'
import { AdminDisputeChat } from './components/AdminDisputeChat'
import { AdminDisputeDecisionForm } from './components/AdminDisputeDecisionForm'

export default function DisputeDetailView({ caseId }: { caseId: string }) {
	const t = useTranslations()
	const tc = useTranslations('commissions')
	const user = useAuthStore((state) => state.user)
	const userId = user?.id
	const owner = user?.roles.some((role) => role.name === 'owner') ?? false
	const client = useQueryClient()
	const { data: entry } = useSuspenseQuery(adminDisputeQueries.get(caseId))
	const claim = useMutation({
		mutationFn: () =>
			adminDisputeService.command(entry.id, {
				action: 'claim',
				key: crypto.randomUUID(),
				version: entry.version,
			}),
		onSuccess: async () => {
			await client.invalidateQueries({
				queryKey: ['admin', 'dispute', entry.id],
			})
			void client.invalidateQueries({ queryKey: ['admin', 'disputes'] })
		},
	})
	const download = (file: CommissionFile) =>
		adminDisputeService.download(entry.id, file)
	const participant =
		!owner &&
		(userId === entry.order.customer_id ||
			userId === entry.order.artist_id ||
			userId === entry.opened_by)
	const mine = !participant && entry.assigned_to === userId

	return (
		<div className="flex flex-col gap-5">
			<CLink
				className="w-fit px-0 text-primary"
				href="/admin/disputes"
				variant="none"
			>
				{t('admin.disputes.title')}
			</CLink>

			<div className="flex flex-wrap items-center gap-3">
				<h1
					className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
				>
					{entry.order.title}
				</h1>
				<Status value={entry.status} />
				<Badge variant={entry.kind === 'REVIEW' ? 'media' : 'stalhub'}>
					{t(`admin.disputes.kind.${entry.kind.toLowerCase()}`)}
				</Badge>
			</div>

			<Card.Root className="gap-3">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<h2 className="flex items-center gap-2 font-semibold">
						<Icon
							className="text-muted-foreground"
							icon={
								entry.kind === 'REVIEW'
									? 'lucide:star'
									: 'lucide:scale'
							}
						/>
						{tc('caseReason')}
					</h2>
					<span className="text-muted-foreground text-xs">
						{formatDate(entry.created_at)}
					</span>
				</div>
				{entry.reason && (
					<p className="whitespace-pre-wrap text-sm">
						{entry.reason}
					</p>
				)}
				<div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
					<span>
						{t('admin.disputes.openedBy')}:{' '}
						{entry.opened_by_user ? (
							<CLink
								className="text-primary"
								href={`/admin/users/${entry.opened_by}`}
								variant="none"
							>
								{entry.opened_by_user.username}
							</CLink>
						) : (
							`#${entry.opened_by}`
						)}
					</span>
					<span>
						{t('admin.disputes.arbiter')}:{' '}
						{entry.assigned_to_user ? (
							<CLink
								className="text-primary"
								href={`/admin/users/${entry.assigned_to}`}
								variant="none"
							>
								{entry.assigned_to_user.username}
							</CLink>
						) : (
							t('admin.disputes.unassigned')
						)}
					</span>
				</div>
				{entry.kind === 'REVIEW' && entry.review && (
					<div className="flex flex-col gap-1">
						<Badge className="w-fit">{entry.review.score}/5</Badge>
						{entry.review.content && (
							<p className="whitespace-pre-wrap text-sm">
								{entry.review.content}
							</p>
						)}
					</div>
				)}
			</Card.Root>

			<Card.Root className="gap-3">
				<div className="flex flex-wrap items-center gap-2">
					<h2 className="font-semibold text-lg">
						{t('admin.disputes.order')}
					</h2>
					<Status value={entry.order.status} />
					<span className="text-muted-foreground text-sm">
						{commissionMoney(
							entry.order.total,
							entry.order.currency
						)}
					</span>
				</div>
				<div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
					<span>
						{tc('customer')}:{' '}
						<CLink
							className="text-primary"
							href={`/admin/users/${entry.order.customer_id}`}
							variant="none"
						>
							{entry.order.customer.username}
						</CLink>
					</span>
					<span>
						{tc('artist')}:{' '}
						<CLink
							className="text-primary"
							href={`/admin/users/${entry.order.artist_id}`}
							variant="none"
						>
							{entry.order.artist.username}
						</CLink>
					</span>
					{entry.order.due_at && (
						<span>
							{tc('deadline')}:{' '}
							{formatDate(entry.order.due_at, 'date')}
						</span>
					)}
				</div>
				{entry.order.brief && (
					<p className="whitespace-pre-wrap text-muted-foreground text-sm">
						{entry.order.brief}
					</p>
				)}
				{entry.order.items.length > 0 && (
					<div className="flex flex-col gap-1 text-sm">
						{entry.order.items.map((item) => (
							<div
								className="flex flex-wrap justify-between gap-2"
								key={item.id ?? item.title}
							>
								<span>
									{item.title}
									{item.description
										? ` — ${item.description}`
										: ''}
								</span>
								<span className="font-mono">
									{commissionMoney(
										item.amount,
										entry.order.currency
									)}
								</span>
							</div>
						))}
					</div>
				)}
				{entry.order.files.length > 0 && (
					<div className="flex flex-col gap-1">
						<Divider />
						<span className="text-muted-foreground text-xs">
							{tc('references')}
						</span>
						{entry.order.files.map((file) => (
							<Button
								className="w-fit justify-start p-0 text-left font-normal text-sm underline underline-offset-4"
								key={file.id}
								onClick={() => void download(file)}
								type="button"
								variant="none"
							>
								{tc('download')}: {file.name} (
								{Math.ceil(file.size / 1024)} KB)
							</Button>
						))}
					</div>
				)}
			</Card.Root>

			<div className="grid gap-5 lg:grid-cols-2">
				<Card.Root className="gap-3">
					<h2 className="font-semibold text-lg">{tc('payments')}</h2>
					{entry.order.payments.length === 0 && (
						<p className="text-muted-foreground text-sm">
							{t('admin.disputes.empty')}
						</p>
					)}
					{entry.order.payments.map((payment) => (
						<div
							className="flex flex-wrap items-center justify-between gap-2 text-sm"
							key={payment.id}
						>
							<span className="flex items-center gap-2">
								{payment.title}
								{payment.upfront && (
									<Badge variant="exbo">
										{t('admin.disputes.upfront')}
									</Badge>
								)}
							</span>
							<span className="flex items-center gap-2">
								<span className="font-mono">
									{commissionMoney(
										payment.amount,
										entry.order.currency
									)}
								</span>
								<Status value={payment.status} />
							</span>
						</div>
					))}
				</Card.Root>
				<Card.Root className="gap-3">
					<h2 className="font-semibold text-lg">{tc('refunds')}</h2>
					{entry.order.refunds.length === 0 && (
						<p className="text-muted-foreground text-sm">
							{t('admin.disputes.empty')}
						</p>
					)}
					{entry.order.refunds.map((refund) => (
						<div
							className="flex flex-wrap items-center justify-between gap-2 text-sm"
							key={refund.id}
						>
							<span className="flex items-center gap-2">
								<span className="font-mono">
									{commissionMoney(
										refund.amount,
										entry.order.currency
									)}
								</span>
								<Status value={refund.status} />
							</span>
							<span className="text-muted-foreground text-xs">
								{formatDate(refund.due_at, 'date')}
							</span>
						</div>
					))}
				</Card.Root>
			</div>

			{entry.decisions.length > 0 && (
				<Card.Root className="gap-3">
					<h2 className="font-semibold text-lg">
						{t('admin.disputes.decisions')}
					</h2>
					{entry.decisions.map((decision) => (
						<div
							className="flex flex-col gap-1 border-primary/20 border-t pt-3 first:border-t-0 first:pt-0"
							key={decision.id}
						>
							<div className="flex flex-wrap items-center justify-between gap-2">
								<h3 className="font-semibold">
									{tc(`outcomes.${decision.outcome}`)}
								</h3>
								<span className="text-muted-foreground text-xs">
									{formatDate(decision.created_at)}
								</span>
							</div>
							{decision.reason && (
								<p className="whitespace-pre-wrap text-sm">
									{decision.reason}
								</p>
							)}
							{decision.obligations && (
								<p className="whitespace-pre-wrap text-muted-foreground text-sm">
									{decision.obligations}
								</p>
							)}
						</div>
					))}
				</Card.Root>
			)}

			{participant && (
				<Alert.Root role="status" variant="warning">
					{t('admin.disputes.conflictHint')}
				</Alert.Root>
			)}

			{!participant && entry.assigned_to !== userId && (
				<Card.Root className="gap-3">
					<Alert.Root role="status" variant="warning">
						{entry.assigned_to
							? t('admin.disputes.takeOverHint')
							: t('admin.disputes.claimHint')}
					</Alert.Root>
					<Button
						className="w-fit"
						loading={claim.isPending}
						onClick={() => claim.mutate()}
					>
						{entry.assigned_to
							? t('admin.disputes.takeOver')
							: tc('claim')}
					</Button>
					{claim.error && (
						<Alert.Root role="alert" variant="destructive">
							{t('admin.disputes.actionError')}
						</Alert.Root>
					)}
				</Card.Root>
			)}

			{userId && mine && (
				<AdminDisputeDecisionForm entry={entry} key={entry.id} />
			)}

			<AdminDisputeChat
				canWrite={mine && entry.status === 'OPEN'}
				caseId={entry.id}
				downloadFile={download}
				key={entry.id}
				user={userId ?? 0}
			/>
		</div>
	)
}
