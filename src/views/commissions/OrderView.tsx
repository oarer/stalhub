'use client'

import { Icon } from '@iconify/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { CLink } from '@/components/ui/Link'
import { Modal } from '@/components/ui/Modal'
import { FormSkeleton } from '@/components/ui/PageSkeletons'
import Slider from '@/components/ui/Slider'
import Avatar from '@/components/ui/user/Avatar'
import Username from '@/components/ui/user/Username'
import { formatDate } from '@/lib/date'
import { commissionQueries as queries } from '@/queries/commission/commission.queries'
import { commissionService as api } from '@/services/commission/commission.service'
import {
	type CommissionCommand,
	type CommissionFile,
	type CommissionOrder,
	parseCommissionMoney,
} from '@/types/commission.type'
import CommissionChat from './components/CommissionChat'
import { OrderActionsPanel } from './components/OrderActionsPanel'
import { OrderBriefCard } from './components/OrderBriefCard'
import {
	type OrderAction,
	OrderPaymentsCard,
	OrderRefundsCard,
} from './components/OrderPayments'
import { OrderReputation } from './components/OrderReputation'
import type { PaymentStage } from './components/PaymentStagesEditor'
import { Area, Feedback, Status, usePrivateScope } from './components/shared'

export default function OrderView({ id }: { id: string }) {
	const t = useTranslations('commissions')
	const user = usePrivateScope()
	const query = useQuery(queries.order(user, id))
	return (
		<div className="flex min-w-0 flex-col gap-5">
			<CLink
				className="w-fit px-0 text-primary"
				href="/me/commissions"
				variant="none"
			>
				{t('orders')}
			</CLink>
			<Feedback error={query.error} />
			{query.isPending && <FormSkeleton />}
			{query.data && user && <OrderBody order={query.data} user={user} />}
		</div>
	)
}

function OrderBody({ order, user }: { order: CommissionOrder; user: number }) {
	const t = useTranslations('commissions')
	const client = useQueryClient()
	const artist = order.artist_id === user
	const customer = order.customer_id === user
	const dispute = order.cases.some(
		(c) => c.kind === 'ORDER' && c.status === 'OPEN'
	)
	const [content, setContent] = useState('')
	const [files, setFiles] = useState<CommissionFile[]>([])
	const [busy, setBusy] = useState(false)
	const [due, setDue] = useState('')
	const [prompt, setPrompt] = useState<{
		action: string
		target?: string
	} | null>(null)
	const [promptContent, setPromptContent] = useState('')
	const [score, setScore] = useState(5)
	const [stages, setStages] = useState<PaymentStage[]>(() => [
		{
			id: crypto.randomUUID(),
			title: t('payments'),
			amount: (order.total / 100).toFixed(2),
			upfront: true,
			instructions: '',
		},
	])
	const pending = useRef<{
		signature: string
		input: CommissionCommand
	} | null>(null)
	const mutation = useMutation({
		mutationFn: async (
			fields: Omit<CommissionCommand, 'version' | 'key'>
		) => {
			const signature = JSON.stringify(fields)
			if (pending.current?.signature !== signature) {
				const refreshVersion =
					fields.action === 'message' ||
					fields.action === 'start' ||
					fields.action.startsWith('payment_') ||
					fields.action.startsWith('refund_')
				const version = refreshVersion
					? (await api.order(order.id)).version
					: order.version
				pending.current = {
					signature,
					input: { ...fields, key: crypto.randomUUID(), version },
				}
			}
			return api.command(order.id, pending.current.input)
		},
		onSuccess: async () => {
			pending.current = null
			setContent('')
			setFiles([])
			await client.invalidateQueries({
				queryKey: ['commissions', user, 'order', order.id],
			})
			void client.invalidateQueries({
				queryKey: ['commissions', user, 'orders'],
			})
			void client.invalidateQueries({
				queryKey: ['commissions', user, 'reputation'],
			})
		},
		onError: (error) => {
			if (isAxiosError(error) && error.response?.status === 409)
				pending.current = null
			void client.invalidateQueries({
				queryKey: ['commissions', user, 'order', order.id],
			})
		},
	})
	const run = (action: string, target_id?: string, text?: string) => {
		mutation.mutate({
			action,
			content: text ?? content,
			file_ids: action === 'review' ? [] : files.map((f) => f.id),
			...(target_id ? { target_id } : {}),
			...(action === 'accept'
				? {
						due_at: due ? new Date(due).toISOString() : '',
						payments: stages.map((stage) => ({
							...stage,
							amount: parseCommissionMoney(stage.amount) ?? 0,
						})),
					}
				: {}),
			...(action === 'review' ? { score } : {}),
		})
	}
	const promptActions = [
		'decline',
		'cancel',
		'dispute',
		'payment_reject',
		'refund_contest',
		'review',
		'review_report',
	]
	const confirmActions = [
		'accept',
		'cancel_confirm',
		'approve',
		'payment_received',
		'refund_received',
	]
	const action: OrderAction = (name, target, disabled = false) => (
		<Button
			disabled={busy || disabled || mutation.isPending}
			key={`${name}-${target ?? ''}`}
			onClick={() => {
				if (
					promptActions.includes(name) ||
					confirmActions.includes(name)
				) {
					setPromptContent('')
					setPrompt({ action: name, target })
					return
				}
				run(name, target)
			}}
			type="button"
			variant={
				['cancel', 'decline', 'dispute', 'refund_contest'].includes(
					name
				)
					? 'danger'
					: 'secondary'
			}
		>
			{t(`actions.${name}`)}
		</Button>
	)
	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-4">
				<div className="flex items-center gap-2">
					<h1
						className={`${mtsExtended.className} wrap-break-word font-medium text-2xl`}
					>
						{order.title}
					</h1>
					<Status
						className="shrink-0 self-center"
						value={order.status}
					/>
					{order.due_at && (
						<span className="flex items-center gap-1.5 text-muted-foreground text-sm">
							<Icon icon="lucide:calendar" />
							{t('deadline')}: {formatDate(order.due_at, 'date')}
						</span>
					)}
				</div>
				<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
					<span className="flex items-center gap-2">
						<Avatar
							className="size-8"
							height={32}
							id={order.customer_id}
							username={order.customer.username}
							width={32}
						/>
						<span className="text-muted-foreground">
							{t('customer')}:
						</span>
						<Username user={order.customer} withRemoteBadges />
					</span>
					<span className="flex items-center gap-2">
						<Avatar
							className="size-8"
							height={32}
							id={order.artist_id}
							username={order.artist.username}
							width={32}
						/>
						<span className="text-muted-foreground">
							{t('artist')}:
						</span>
						<Username user={order.artist} withRemoteBadges />
					</span>
				</div>
				{dispute && (
					<Alert.Root role="status" variant="warning">
						{t('disputeOpen')}
					</Alert.Root>
				)}
				{order.cancellation_by && (
					<p className="text-sm">{t('cancelPending')}</p>
				)}
			</div>
			<div className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
				<div className="flex min-w-0 flex-col gap-5">
					<CommissionChat
						busy={busy}
						canRead={artist || customer}
						content={content}
						error={mutation.error}
						files={files}
						key={order.id}
						onBusy={setBusy}
						onContentChange={setContent}
						onFilesChange={setFiles}
						onSend={() => run('message')}
						orderId={order.id}
						sending={mutation.isPending}
						user={user}
					/>
					{(artist || customer) && (
						<div className="flex min-w-0 flex-col gap-5">
							<OrderPaymentsCard
								action={action}
								artist={artist}
								customer={customer}
								order={order}
							/>
							<OrderRefundsCard
								action={action}
								artist={artist}
								customer={customer}
								hasFiles={files.length > 0}
								order={order}
							/>
							<OrderActionsPanel
								action={action}
								artist={artist}
								content={content}
								customer={customer}
								due={due}
								fileCount={files.length}
								onDueChange={setDue}
								onStagesChange={setStages}
								order={order}
								stages={stages}
								user={user}
							/>
						</div>
					)}
				</div>
				<aside className="flex min-w-0 flex-col gap-5">
					<div className="flex min-w-0 flex-col gap-5">
						<OrderBriefCard order={order} />
						{artist && (
							<OrderReputation
								customer={order.customer_id}
								user={user}
							/>
						)}
					</div>
				</aside>
			</div>
			<Modal.Root
				onOpenChange={(open) => {
					if (!open) setPrompt(null)
				}}
				open={prompt !== null}
			>
				<Modal.Content fullScreen={false}>
					<Modal.Header>
						<Modal.Title>
							{prompt ? t(`actions.${prompt.action}`) : ''}
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{prompt && promptActions.includes(prompt.action) ? (
							<>
								<Area
									label={t('explanation')}
									maxLength={2000}
									onChange={setPromptContent}
									value={promptContent}
								/>
								{prompt.action === 'review' && (
									<div className="flex flex-col gap-1.5">
										<span className="text-sm">
											{t('score')}: {score}
										</span>
										<Slider
											max={5}
											min={1}
											onValueChange={setScore}
											value={score}
										/>
									</div>
								)}
							</>
						) : (
							<p className="text-muted-foreground text-sm">
								{t('confirm')}
							</p>
						)}
					</Modal.Body>
					<Modal.Footer>
						<Button
							disabled={
								promptActions.includes(prompt?.action ?? '') &&
								promptContent.trim().length <
									([
										'dispute',
										'refund_contest',
										'review_report',
									].includes(prompt?.action ?? '')
										? 10
										: 1)
							}
							onClick={() => {
								const current = prompt
								setPrompt(null)
								if (current)
									run(
										current.action,
										current.target,
										promptActions.includes(current.action)
											? promptContent
											: undefined
									)
							}}
							type="button"
						>
							{t('submit')}
						</Button>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
			{order.cases.map((entry) => (
				<Card.Root className="gap-3" key={entry.id}>
					<CLink
						className="w-fit px-0 font-semibold text-primary"
						href={`/me/arbitration/${entry.id}`}
						variant="none"
					>
						{t('case')} ·{' '}
						{entry.kind === 'REVIEW' ? t('review') : order.title}
					</CLink>
					<Status value={entry.status} />
					{entry.reason && (
						<p className="whitespace-pre-wrap text-sm">
							{entry.reason}
						</p>
					)}
					{entry.decisions?.map((decision) => (
						<div className="flex flex-col gap-2" key={decision.id}>
							<Divider />
							<p className="font-medium">
								{t(`outcomes.${decision.outcome}`)}
							</p>
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
			))}
		</div>
	)
}
