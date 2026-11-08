'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { CLink } from '@/components/ui/Link'
import { unoQueries } from '@/queries/uno/uno.queries'
import { CompareAggregate } from './components/compare/CompareAggregate'
import { CompareClanCard } from './components/compare/CompareClanCard'
import { CompareMetricsTable } from './components/compare/CompareMetricsTable'
import { aggregateFields } from './components/compare/compare.const'
import { UnoEmpty } from './components/UnoEmpty'
import { UnoFeedback } from './components/UnoFeedback'
import { UnoPageHeader } from './components/UnoPageHeader'

export default function UnoCompareView({
	leftClanId = '',
	rightClanId = '',
}: {
	leftClanId?: string
	rightClanId?: string
}) {
	const t = useTranslations('uno')
	const [left, setLeft] = useState(leftClanId)
	const [right, setRight] = useState(rightClanId)
	const comparisonQuery = useQuery({
		...unoQueries.vs({ leftClanId, rightClanId }),
		enabled: Boolean(leftClanId && rightClanId),
	})
	const comparison = comparisonQuery.data
	const aggregateRows = comparison
		? aggregateFields.flatMap(([key, field]) => {
				const value = comparison.aggregate[key]
				return value === null
					? []
					: [{ key, label: t(`compare.metrics.${field}`), value }]
			})
		: []

	return (
		<section className="mx-auto max-w-380 space-y-8 px-4 pt-32 pb-12 sm:px-6">
			<UnoPageHeader
				backHref="/uno"
				description={t('compare.description')}
				title={t('compare.title')}
			/>

			<Card.Root className="gap-4">
				<div className="grid gap-3 md:grid-cols-2">
					<Input
						label="uno.compare.leftLabel"
						onChange={(event) => setLeft(event.target.value)}
						placeholder={t('compare.idPlaceholder')}
						value={left}
					/>
					<Input
						label="uno.compare.rightLabel"
						onChange={(event) => setRight(event.target.value)}
						placeholder={t('compare.idPlaceholder')}
						value={right}
					/>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<CLink
						className="gap-2"
						href={
							left.trim() && right.trim()
								? `/uno/compare?left=${encodeURIComponent(left.trim())}&right=${encodeURIComponent(right.trim())}`
								: '/uno/compare'
						}
					>
						<Icon icon="lucide:scale" />
						{t('compare.run')}
					</CLink>
				</div>
			</Card.Root>

			{!leftClanId || !rightClanId ? (
				<UnoEmpty>{t('compare.hint')}</UnoEmpty>
			) : (
				<UnoFeedback
					isError={comparisonQuery.isError}
					isLoading={comparisonQuery.isPending}
					onRetry={() => void comparisonQuery.refetch()}
				>
					{!comparison ? (
						<UnoEmpty>{t('compare.empty')}</UnoEmpty>
					) : (
						<div className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<CompareClanCard clan={comparison.left} />
								<CompareClanCard clan={comparison.right} />
							</div>

							<CompareMetricsTable comparison={comparison} />
							<CompareAggregate rows={aggregateRows} />
						</div>
					)}
				</UnoFeedback>
			)}
		</section>
	)
}
