'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import { commissionService as api } from '@/services/commission/commission.service'
import {
	type CommissionCase,
	type CommissionFile,
	parseCommissionMoney,
} from '@/types/commission.type'
import { Area, Feedback, Field, FilePicker } from './shared'

export function ArbitrationDecisionForm({
	entry,
	user,
}: {
	entry: CommissionCase
	user: number
}) {
	const t = useTranslations('commissions')
	const client = useQueryClient()
	const [content, setContent] = useState('')
	const [obligations, setObligations] = useState('')
	const [outcome, setOutcome] = useState(
		entry.kind === 'REVIEW' ? 'KEEP_REVIEW' : 'RESUME'
	)
	const [refund, setRefund] = useState('0')
	const [due, setDue] = useState('')
	const [files, setFiles] = useState<CommissionFile[]>([])
	const [busy, setBusy] = useState(false)
	const mutation = useMutation({
		mutationFn: (action: string) =>
			api.caseCommand(entry.id, {
				action,
				key: crypto.randomUUID(),
				version: entry.version,
				content,
				obligations,
				outcome,
				refund:
					refund === '0' ? 0 : (parseCommissionMoney(refund) ?? -1),
				due_at: due ? new Date(due).toISOString() : undefined,
				file_ids: files.map((file) => file.id),
			}),
		onSuccess: async () => {
			setContent('')
			setFiles([])
			await client.invalidateQueries({
				queryKey: ['commissions', user, 'case', entry.id],
			})
			void client.invalidateQueries({
				queryKey: ['commissions', user, 'order', entry.order_id],
			})
		},
		onError: () => {
			void client.invalidateQueries({
				queryKey: ['commissions', user, 'case', entry.id],
			})
		},
	})
	const outcomes =
		entry.kind === 'REVIEW'
			? ['HIDE_REVIEW', 'KEEP_REVIEW']
			: ['RESUME', 'COMPLETE', 'CANCEL']
	return (
		<Card.Root className="gap-4">
			<p className="text-muted-foreground text-sm">{t('externalOnly')}</p>
			<Area
				label={t('decisionReason')}
				minLength={10}
				onChange={setContent}
				value={content}
			/>
			<FilePicker files={files} onBusy={setBusy} onChange={setFiles} />
			<Feedback error={mutation.error} />
			{entry.status === 'OPEN' ? (
				<>
					<Button
						className="w-fit"
						disabled={busy || (!content.trim() && !files.length)}
						loading={mutation.isPending}
						onClick={() => mutation.mutate('message')}
						variant="secondary"
					>
						{t('messageArbiter')}
					</Button>
					<div className="flex flex-col gap-1.5">
						<span className="text-sm">{t('outcome')}</span>
						<Tabs.Root onValueChange={setOutcome} value={outcome}>
							<Tabs.List className="w-fit">
								{outcomes.map((value) => (
									<Tabs.Trigger key={value} value={value}>
										{t(`outcomes.${value}`)}
									</Tabs.Trigger>
								))}
							</Tabs.List>
						</Tabs.Root>
					</div>
					<Area
						label={t('obligations')}
						minLength={10}
						onChange={setObligations}
						value={obligations}
					/>
					{entry.kind !== 'REVIEW' && (
						<>
							<Field
								label={`${t('refundAmount')} (${entry.currency ?? ''})`}
								onChange={setRefund}
								value={refund}
							/>
							<Field
								label={t('deadline')}
								onChange={setDue}
								type="date"
								value={due}
							/>
						</>
					)}
					<Button
						className="w-fit"
						disabled={
							busy ||
							content.trim().length < 10 ||
							obligations.trim().length < 10 ||
							(entry.kind !== 'REVIEW' &&
								refund !== '0' &&
								!parseCommissionMoney(refund)) ||
							((outcome === 'RESUME' || refund !== '0') && !due)
						}
						loading={mutation.isPending}
						onClick={() => mutation.mutate('decide')}
					>
						{t('decision')}
					</Button>
				</>
			) : (
				<Button
					className="w-fit"
					disabled={busy || content.trim().length < 10}
					loading={mutation.isPending}
					onClick={() => mutation.mutate('reopen')}
				>
					{t('reopen')}
				</Button>
			)}
		</Card.Root>
	)
}
