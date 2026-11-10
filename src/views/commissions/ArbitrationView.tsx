'use client'

import { Icon } from '@iconify/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CLink } from '@/components/ui/Link'
import { ListRowsSkeleton } from '@/components/ui/PageSkeletons'
import { formatDate } from '@/lib/date'
import { commissionQueries as queries } from '@/queries/commission/commission.queries'
import { commissionService as api } from '@/services/commission/commission.service'
import type { CommissionCase } from '@/types/commission.type'
import { ArbitrationDecisionForm } from './components/ArbitrationDecisionForm'
import { Feedback, Pages, Status, usePrivateScope } from './components/shared'

export function ArbitrationView() {
	const t = useTranslations('commissions')
	const user = usePrivateScope()
	const [page, setPage] = useState(1)
	const capabilities = useQuery(queries.capabilities(user))
	const query = useQuery({
		...queries.cases(user, page),
		enabled:
			!!user &&
			(!!capabilities.data?.arbitrate || !!capabilities.data?.owner),
	})
	const client = useQueryClient()
	const claim = useMutation({
		mutationFn: (entry: CommissionCase) =>
			api.caseCommand(entry.id, {
				action: 'claim',
				key: crypto.randomUUID(),
				version: entry.version,
			}),
		onSettled: () =>
			client.invalidateQueries({
				queryKey: ['commissions', user, 'cases'],
			}),
	})
	return (
		<div className="flex flex-col gap-5">
			<h1 className="font-semibold text-2xl">{t('arbitration')}</h1>
			<p className="max-w-2xl text-muted-foreground text-sm">
				{t('externalOnly')}
			</p>
			<Feedback
				error={query.error || capabilities.error || claim.error}
			/>
			{capabilities.data &&
				!capabilities.data.arbitrate &&
				!capabilities.data.owner && <p>{t('accessDenied')}</p>}
			{query.isPending && <ListRowsSkeleton count={5} />}
			{query.data?.data.map((entry) => (
				<Card.Root className="gap-3" key={entry.id}>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<span className="flex items-center gap-2">
							<Icon
								className="text-muted-foreground"
								icon={
									entry.kind === 'REVIEW'
										? 'lucide:star'
										: 'lucide:scale'
								}
							/>
							{entry.kind === 'REVIEW' ? t('review') : t('case')}{' '}
							· {formatDate(entry.created_at, 'date')}
						</span>
						<Status value={entry.status} />
					</div>
					{entry.assigned_to === user ? (
						<CLink
							className="w-fit px-0 text-primary"
							href={`/me/arbitration/${entry.id}`}
							variant="none"
						>
							{t('caseAssigned')}
						</CLink>
					) : (
						<Button
							className="w-fit"
							disabled={!entry.claimable}
							loading={claim.isPending}
							onClick={() => claim.mutate(entry)}
						>
							{t('claim')}
						</Button>
					)}
				</Card.Root>
			))}
			{query.data?.total === 0 && (
				<div className="flex flex-col items-center gap-2 py-10 text-center">
					<Icon
						className="text-3xl text-muted-foreground"
						icon="lucide:scale"
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

export function ArbitrationCaseView({ id }: { id: string }) {
	const t = useTranslations('commissions')
	const user = usePrivateScope()
	const query = useQuery(queries.case(user, id))
	const capabilities = useQuery(queries.capabilities(user))
	return (
		<div className="flex flex-col gap-5">
			<h1 className="font-semibold text-2xl">{t('arbitration')}</h1>
			<Feedback error={query.error} />
			{query.isPending && <ListRowsSkeleton />}
			{query.data && (
				<>
					<Status value={query.data.status} />
					<Card.Root className="gap-3">
						<h2 className="font-semibold">{t('caseReason')}</h2>
						{query.data.reason && (
							<p className="whitespace-pre-wrap text-sm">
								{query.data.reason}
							</p>
						)}
						{query.data.order_id && (
							<CLink
								className="w-fit px-0 text-primary"
								href={`/me/commissions/${query.data.order_id}`}
								variant="none"
							>
								{t('briefStep')} · {t('chat')}
							</CLink>
						)}
						{query.data.review && (
							<>
								<Badge className="w-fit">
									{query.data.review.score}/5
								</Badge>
								{query.data.review.content && (
									<p className="whitespace-pre-wrap text-sm">
										{query.data.review.content}
									</p>
								)}
							</>
						)}
					</Card.Root>
					{query.data.decisions?.map((decision) => (
						<Card.Root className="gap-3" key={decision.id}>
							<h2 className="font-semibold">
								{t(`outcomes.${decision.outcome}`)}
							</h2>
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
							<time className="text-muted-foreground text-xs">
								{formatDate(decision.created_at)}
							</time>
						</Card.Root>
					))}
					{user &&
						query.data.assigned_to === user &&
						(capabilities.data?.arbitrate ||
							capabilities.data?.owner) && (
							<ArbitrationDecisionForm
								entry={query.data}
								user={user}
							/>
						)}
				</>
			)}
		</div>
	)
}
