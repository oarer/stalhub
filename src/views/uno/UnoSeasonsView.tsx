'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { unoQueries } from '@/queries/uno/uno.queries'
import { SeasonCard } from './components/seasons/SeasonCard'
import { buildSeasonTimeline } from './components/seasons/seasons.utils'
import { UnoEmpty } from './components/UnoEmpty'
import { UnoFeedback } from './components/UnoFeedback'
import { UnoPageHeader } from './components/UnoPageHeader'

export default function UnoSeasonsView() {
	const t = useTranslations('uno')
	const query = useQuery(unoQueries.seasons())
	const seasons = buildSeasonTimeline(query.data?.items ?? [])

	return (
		<section className="mx-auto max-w-380 space-y-8 px-4 pt-32 pb-12 sm:px-6">
			<UnoPageHeader
				backHref="/uno"
				description={t('seasons.description')}
				title={t('seasons.title')}
			/>
			<UnoFeedback
				isError={query.isError}
				isLoading={query.isPending}
				onRetry={() => void query.refetch()}
			>
				{seasons.length === 0 ? (
					<UnoEmpty>{t('seasons.empty')}</UnoEmpty>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{seasons.map((season) => (
							<SeasonCard key={season.id} season={season} />
						))}
					</div>
				)}
			</UnoFeedback>
		</section>
	)
}
