'use client'

import { Icon } from '@iconify/react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { adminAwardsQueries } from '@/queries/admin/awards.queries'
import ResultsPresentation from '@/views/awards/components/ResultsPresentation'
import { toAwardResults } from './utils'

export default function AwardsCeremonyAdminView({
	campaignId,
	categorySlug,
}: {
	campaignId?: string
	categorySlug?: string
}) {
	const t = useTranslations()
	const locale = useLocale()
	const router = useRouter()
	const { data } = useSuspenseQuery(adminAwardsQueries.list())
	const campaign =
		data.items.find((item) => item.id === campaignId) ??
		data.items.find((item) => item.status === 'ended') ??
		data.items.find((item) => item.status === 'voting') ??
		data.items[0] ??
		null
	const resultsQuery = useQuery({
		...adminAwardsQueries.results(campaign?.id ?? ''),
		enabled: !!campaign,
	})
	const categoriesQuery = useQuery({
		...adminAwardsQueries.listCategories(campaign?.id ?? ''),
		enabled: !!campaign,
	})
	const results = useMemo(
		() =>
			campaign && resultsQuery.data
				? toAwardResults(
						campaign,
						resultsQuery.data,
						categoriesQuery.data?.items,
						locale
					)
				: null,
		[campaign, categoriesQuery.data?.items, locale, resultsQuery.data]
	)

	const back = () => router.push('/admin/awards')

	if (!campaign) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
				<Icon className="text-primary text-4xl" icon="lucide:trophy" />
				<p className="text-muted-foreground">
					{t('admin.awards.selectCampaign')}
				</p>
				<Button onClick={back} variant="secondary">
					{t('awards.results.back')}
				</Button>
			</div>
		)
	}

	if (resultsQuery.isPending || categoriesQuery.isPending) {
		return (
			<div className="text-muted-foreground flex min-h-[60vh] items-center justify-center gap-3">
				<Icon
					className="text-primary animate-spin text-2xl"
					icon="lucide:loader-circle"
				/>
				{t('awards.loading')}
			</div>
		)
	}

	if (resultsQuery.isError || !results) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
				<Icon className="text-primary text-4xl" icon="lucide:trophy" />
				<p className="text-muted-foreground">{t('awards.loadError')}</p>
				<Button onClick={back} variant="secondary">
					{t('awards.results.back')}
				</Button>
			</div>
		)
	}

	return (
		<ResultsPresentation
			initialSlug={categorySlug}
			mode="page"
			onOpenChange={(open) => {
				if (!open) back()
			}}
			open
			pageTitle={results.title}
			results={results}
		/>
	)
}
