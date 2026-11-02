'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { ListRowsSkeleton } from '@/components/ui/PageSkeletons'
import { commissionQueries as queries } from '@/queries/commission/commission.queries'
import { commissionService as api } from '@/services/commission/commission.service'
import { Area, Feedback, Pages } from './shared'

export function OrderReputation({
	user,
	customer,
}: {
	user: number
	customer: number
}) {
	const t = useTranslations('commissions')
	const [page, setPage] = useState(1)
	const [reason, setReason] = useState('')
	const capabilities = useQuery(queries.capabilities(user))
	const query = useQuery(
		queries.reputation(user, customer, !!capabilities.data?.author, page)
	)
	const report = useMutation({
		mutationFn: (id: string) =>
			api.command(id, {
				key: crypto.randomUUID(),
				version: 1,
				action: 'review_report',
				content: reason,
			}),
		onSuccess: () => setReason(''),
	})
	if (!capabilities.data?.author) return null
	return (
		<Card.Root className="gap-3">
			<h2 className="font-semibold">{t('rating')}</h2>
			<p className="text-muted-foreground text-xs">
				{t('ratingPrivate')}
			</p>
			<Feedback error={query.error || report.error} />
			{query.data ? (
				<>
					<p>
						{query.data.total
							? t('ratingSummary', {
									average:
										query.data.average?.toFixed(1) ?? '—',
									count: query.data.total,
								})
							: t('noRatings')}
					</p>
					{query.data.data.map((review) => (
						<article
							className="flex flex-col gap-2"
							key={review.id}
						>
							<Divider />
							<Badge className="w-fit" variant="primary">
								{review.score}/5
							</Badge>
							{review.content && (
								<p className="whitespace-pre-wrap text-sm">
									{review.content}
								</p>
							)}
							{review.artist_id !== user && (
								<Button
									className="w-fit"
									disabled={reason.trim().length < 10}
									loading={report.isPending}
									onClick={() =>
										report.mutate(review.order_id)
									}
									size="sm"
									variant="secondary"
								>
									{t('report')}
								</Button>
							)}
						</article>
					))}
					{query.data.total > 0 && (
						<Area
							label={t('reportHint')}
							onChange={setReason}
							value={reason}
						/>
					)}
					<Pages
						onChange={setPage}
						page={page}
						size={20}
						total={query.data.total}
					/>
				</>
			) : (
				<ListRowsSkeleton count={2} />
			)}
		</Card.Root>
	)
}
