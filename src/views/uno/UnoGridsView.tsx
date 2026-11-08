'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { unoQueries } from '@/queries/uno/uno.queries'
import type { UnoDateRangeParams } from '@/types/uno/uno.type'
import { GridsInfiniteGrid } from './components/grids/GridsInfiniteGrid'
import { UnoDateRangeForm } from './components/UnoDateRangeForm'
import { UnoEmpty } from './components/UnoEmpty'
import { UnoFeedback } from './components/UnoFeedback'
import { UnoPageHeader } from './components/UnoPageHeader'
import { useUnoLocale } from './hooks/useUnoLocale'
import { formatUnoValue } from './utils/uno.utils'

export default function UnoGridsView({
	params,
}: {
	params: UnoDateRangeParams
}) {
	const t = useTranslations('uno')
	const locale = useUnoLocale()
	const query = useQuery(unoQueries.grids(params))
	const items = query.data?.items ?? []

	return (
		<section className="mx-auto max-w-380 space-y-8 px-4 pt-32 pb-12 sm:px-6">
			<UnoPageHeader
				backHref="/uno"
				description={t('grids.description')}
				title={t('grids.title')}
			/>

			<UnoDateRangeForm action="/uno/grids" params={params} />

			<UnoFeedback
				isError={query.isError}
				isLoading={query.isPending}
				onRetry={() => void query.refetch()}
			>
				{items.length === 0 ? (
					<UnoEmpty>{t('grids.empty')}</UnoEmpty>
				) : (
					<div className="space-y-3">
						<div className="flex items-center gap-2 font-mono font-semibold text-muted-foreground text-xs">
							<Icon icon="lucide:layers-3" />
							{t('grids.total')}:{' '}
							{formatUnoValue(
								query.data?.total ?? items.length,
								locale
							)}
						</div>
						<GridsInfiniteGrid items={items} />
					</div>
				)}
			</UnoFeedback>
		</section>
	)
}
