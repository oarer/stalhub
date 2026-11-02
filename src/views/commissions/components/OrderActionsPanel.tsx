'use client'

import { useTranslations } from 'next-intl'
import { Accordion } from '@/components/ui/Accordion'
import { Card } from '@/components/ui/Card'
import type { CommissionOrder } from '@/types/commission.type'
import { parseCommissionMoney } from '@/types/commission.type'
import type { OrderAction } from './OrderPayments'
import { type PaymentStage, PaymentStagesEditor } from './PaymentStagesEditor'

export function OrderActionsPanel({
	order,
	user,
	artist,
	customer,
	action,
	stages,
	onStagesChange,
	due,
	onDueChange,
	content,
	fileCount,
}: {
	order: CommissionOrder
	user: number
	artist: boolean
	customer: boolean
	action: OrderAction
	stages: PaymentStage[]
	onStagesChange: (stages: PaymentStage[]) => void
	due: string
	onDueChange: (due: string) => void
	content: string
	fileCount: number
}) {
	const t = useTranslations('commissions')
	const dispute = order.cases.some(
		(c) => c.kind === 'ORDER' && c.status === 'OPEN'
	)
	const done = ['COMPLETED', 'DECLINED', 'CANCELLED'].includes(order.status)
	const hasStages = artist && order.status === 'PENDING' && !dispute
	const hasActions =
		!dispute &&
		((artist &&
			['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(
				order.status
			)) ||
			(customer && ['REVIEW', 'COMPLETED'].includes(order.status)) ||
			(!done && !order.cancellation_by) ||
			(order.cancellation_by && order.cancellation_by !== user) ||
			(order.accepted_at && !order.cases.some((c) => c.kind === 'ORDER')))
	const hasReviewReport = customer && order.status === 'COMPLETED'
	if (!hasStages && !hasActions && !hasReviewReport) return null
	return (
		<Card.Root className="gap-4">
			{hasStages && (
				<Accordion
					defaultExpandedKeys={['stages']}
					items={[
						{
							key: 'stages',
							title: t('paymentStages'),
							content: (
								<PaymentStagesEditor
									due={due}
									onDueChange={onDueChange}
									onStagesChange={onStagesChange}
									order={order}
									stages={stages}
								/>
							),
						},
					]}
				/>
			)}
			{hasActions && (
				<div className="flex flex-wrap gap-3">
					{!dispute && (
						<>
							{artist &&
								order.status === 'PENDING' &&
								action(
									'accept',
									undefined,
									!due ||
										stages.some(
											(s) =>
												!parseCommissionMoney(
													s.amount
												) || !s.instructions.trim()
										) ||
										stages.reduce(
											(sum, s) =>
												sum +
												(parseCommissionMoney(
													s.amount
												) ?? 0),
											0
										) !== order.total ||
										!stages.some((s) => s.upfront)
								)}
							{artist &&
								order.status === 'PENDING' &&
								action('decline')}
							{artist &&
								order.status === 'ACCEPTED' &&
								action(
									'start',
									undefined,
									order.payments.some(
										(payment) =>
											payment.upfront &&
											payment.status !== 'RECEIVED'
									)
								)}
							{artist &&
								order.status === 'IN_PROGRESS' &&
								action(
									'deliver',
									undefined,
									!content.trim() && fileCount === 0
								)}
							{customer && order.status === 'REVIEW' && (
								<>
									{action(
										'revise',
										undefined,
										!content.trim() ||
											order.revisions_used >=
												order.revisions
									)}
									{action(
										'approve',
										undefined,
										order.payments
											.filter(
												(p) => p.status === 'RECEIVED'
											)
											.reduce(
												(s, p) => s + p.amount,
												0
											) !== order.total
									)}
								</>
							)}
							{!done &&
								!order.cancellation_by &&
								action('cancel')}
							{order.cancellation_by &&
								order.cancellation_by !== user && (
									<>
										{action('cancel_confirm')}
										{action('cancel_reject')}
									</>
								)}
							{order.accepted_at &&
								!order.cases.some((c) => c.kind === 'ORDER') &&
								action('dispute')}
						</>
					)}
				</div>
			)}
			{artist &&
				order.status === 'COMPLETED' &&
				!dispute &&
				action('review')}
			{hasReviewReport && action('review_report')}
		</Card.Root>
	)
}
