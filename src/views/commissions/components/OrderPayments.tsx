'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { formatDate } from '@/lib/date'
import type { CommissionOrder } from '@/types/commission.type'
import { commissionMoney } from '@/types/commission.type'
import { Status } from './shared'

export type OrderAction = (
	name: string,
	target_id?: string,
	disabled?: boolean
) => ReactNode

export function OrderPaymentsCard({
	order,
	artist,
	customer,
	action,
}: {
	order: CommissionOrder
	artist: boolean
	customer: boolean
	action: OrderAction
}) {
	const t = useTranslations('commissions')
	if (!order.payments.length) return null
	const paid = order.payments
		.filter((p) => p.status === 'RECEIVED')
		.reduce((s, p) => s + p.amount, 0)
	const sent = order.payments
		.filter((p) => p.status === 'SENT')
		.reduce((s, p) => s + p.amount, 0)
	return (
		<Card.Root className="gap-4">
			<h2 className="font-semibold text-xl">{t('payments')}</h2>
			<p className="text-muted-foreground text-sm">{t('paymentHint')}</p>
			<dl className="grid gap-2 text-sm">
				<div className="flex justify-between">
					<dt>{t('paid')}</dt>
					<dd>{commissionMoney(paid, order.currency)}</dd>
				</div>
				<div className="flex justify-between">
					<dt>{t('pendingPayment')}</dt>
					<dd>{commissionMoney(sent, order.currency)}</dd>
				</div>
				<div className="flex justify-between">
					<dt>{t('remaining')}</dt>
					<dd>
						{commissionMoney(order.total - paid, order.currency)}
					</dd>
				</div>
			</dl>
			{order.payments.map((payment) => (
				<div className="flex flex-col gap-2" key={payment.id}>
					<Divider />
					<div className="flex flex-wrap items-center justify-between gap-2">
						<h3 className="font-medium">{payment.title}</h3>
						<span>
							{commissionMoney(payment.amount, order.currency)}
						</span>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Status value={payment.status} />
						{payment.upfront && (
							<Badge variant="exbo">{t('upfront')}</Badge>
						)}
					</div>
					{payment.instructions && (
						<p className="wrap-break-word whitespace-pre-wrap text-sm">
							{payment.instructions}
						</p>
					)}
					{payment.note && (
						<p className="whitespace-pre-wrap text-muted-foreground text-sm">
							{payment.note}
						</p>
					)}
					<div className="flex flex-wrap gap-2">
						{customer &&
							payment.status === 'EXPECTED' &&
							action('payment_sent', payment.id)}
						{artist &&
							payment.status !== 'RECEIVED' &&
							action('payment_received', payment.id)}
						{artist &&
							payment.status === 'SENT' &&
							action('payment_reject', payment.id)}
					</div>
				</div>
			))}
		</Card.Root>
	)
}

export function OrderRefundsCard({
	order,
	artist,
	customer,
	hasFiles,
	action,
}: {
	order: CommissionOrder
	artist: boolean
	customer: boolean
	hasFiles: boolean
	action: OrderAction
}) {
	const t = useTranslations('commissions')
	if (!order.refunds.length) return null
	return (
		<Card.Root className="gap-3">
			<h2 className="font-semibold text-xl">{t('refunds')}</h2>
			<p className="text-muted-foreground text-sm">{t('refundHint')}</p>
			{order.refunds.map((refund) => (
				<div className="flex flex-col gap-2" key={refund.id}>
					<Divider />
					<div className="flex flex-wrap items-center justify-between gap-2">
						<span>
							{commissionMoney(refund.amount, order.currency)}
						</span>
						<Status value={refund.status} />
					</div>
					<span className="flex items-center gap-1.5 text-muted-foreground text-xs">
						<Icon icon="lucide:calendar" />
						{formatDate(refund.due_at, 'date')}
					</span>
					{refund.note && (
						<p className="whitespace-pre-wrap text-sm">
							{refund.note}
						</p>
					)}
					<div className="flex flex-wrap gap-2">
						{artist &&
							['EXPECTED', 'CONTESTED'].includes(refund.status) &&
							action('refund_sent', refund.id, !hasFiles)}
						{customer && refund.status === 'SENT' && (
							<>
								{action('refund_received', refund.id)}
								{action('refund_contest', refund.id)}
							</>
						)}
					</div>
				</div>
			))}
		</Card.Root>
	)
}
