'use client'

import { useTranslations } from 'next-intl'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CheckBox } from '@/components/ui/CheckBox'
import type { CommissionOrder } from '@/types/commission.type'
import { commissionMoney, parseCommissionMoney } from '@/types/commission.type'
import { Area, Field } from './shared'

export type PaymentStage = {
	id: string
	title: string
	amount: string
	upfront: boolean
	instructions: string
}

export function PaymentStagesEditor({
	order,
	stages,
	onStagesChange,
	due,
	onDueChange,
}: {
	order: CommissionOrder
	stages: PaymentStage[]
	onStagesChange: (stages: PaymentStage[]) => void
	due: string
	onDueChange: (due: string) => void
}) {
	const t = useTranslations('commissions')
	const stageIssues = stages.some(
		(s) => !parseCommissionMoney(s.amount) || !s.instructions.trim()
	)
	const stageSum = stages.reduce(
		(sum, s) => sum + (parseCommissionMoney(s.amount) ?? 0),
		0
	)
	return (
		<div className="flex flex-col gap-3">
			<Field
				label={t('deadline')}
				onChange={onDueChange}
				type="date"
				value={due}
			/>
			{stages.map((stage, index) => {
				const update = (fields: Partial<PaymentStage>) =>
					onStagesChange(
						stages.map((s, i) =>
							i === index ? { ...s, ...fields } : s
						)
					)
				return (
					<Card.Root
						className="gap-3 ring-1 ring-border/40"
						key={stage.id}
					>
						<Field
							label={t('paymentTitle')}
							onChange={(title) => update({ title })}
							value={stage.title}
						/>
						<Field
							label={`${t('amount')} (${order.currency})`}
							onChange={(amount) => update({ amount })}
							value={stage.amount}
						/>
						<Area
							label={t('instructions')}
							maxLength={4000}
							onChange={(instructions) =>
								update({ instructions })
							}
							value={stage.instructions}
						/>
						<CheckBox
							checked={stage.upfront}
							id={`stage-upfront-${stage.id}`}
							label={t('upfront')}
							onCheckedChange={(upfront) => update({ upfront })}
						/>
						{stages.length > 1 && (
							<Button
								className="w-fit"
								onClick={() =>
									onStagesChange(
										stages.filter((_, i) => i !== index)
									)
								}
								type="button"
								variant="secondary"
							>
								{t('remove')}
							</Button>
						)}
					</Card.Root>
				)
			})}
			<Button
				className="w-fit"
				disabled={stages.length >= 10}
				onClick={() =>
					onStagesChange([
						...stages,
						{
							id: crypto.randomUUID(),
							title: t('payments'),
							amount: '',
							upfront: false,
							instructions: '',
						},
					])
				}
				type="button"
				variant="secondary"
			>
				{t('addPayment')}
			</Button>
			{stageIssues && (
				<Alert.Root variant="info">
					{t('errors.PAYMENT_TOTAL_MISMATCH')}
				</Alert.Root>
			)}
			{stageSum !== order.total && (
				<Alert.Root variant="info">
					{t('total')}: {commissionMoney(stageSum, order.currency)} /{' '}
					{commissionMoney(order.total, order.currency)}
				</Alert.Root>
			)}
		</div>
	)
}
