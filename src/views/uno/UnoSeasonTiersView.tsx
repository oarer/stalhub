'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { PngPreviewModal } from '@/components/ui/PngPreviewModal'
import { formatDate } from '@/lib/date'
import { unoQueries } from '@/queries/uno/uno.queries'
import { SeasonTiersPngTemplate } from './components/season-tiers/SeasonTiersPngTemplate'
import { SeasonTierTable } from './components/season-tiers/SeasonTierTable'
import { UnoEmpty } from './components/UnoEmpty'
import { UnoFeedback } from './components/UnoFeedback'
import { UnoPageHeader } from './components/UnoPageHeader'
import { useUnoLocale } from './hooks/useUnoLocale'
import { useUnoSeasonTiersPng } from './hooks/useUnoSeasonTiersPng'

export default function UnoSeasonTiersView({ season }: { season?: string }) {
	const t = useTranslations('uno')
	const locale = useUnoLocale()
	const seasonsQuery = useQuery(unoQueries.seasons())
	const seasonEntry = seasonsQuery.data?.items.find(
		(item) => item.id === season
	)
	const title = seasonEntry
		? t.has(seasonEntry.title)
			? t(seasonEntry.title)
			: seasonEntry.title
		: t('seasons.tiers')

	const query = useQuery({
		...unoQueries.seasonTiers(season ?? ''),
		enabled: Boolean(season),
	})

	const tiers =
		query.data?.tiers.filter((tier) => tier.subtiers.length > 0) ?? []
	const hasClans = tiers.some((tier) => tier.count > 0)
	const period = seasonEntry?.period ?? []
	const periodLabel =
		period[0] && period[1]
			? `${formatDate(period[0], 'date', locale)} — ${formatDate(period[1], 'date', locale)}`
			: null
	const total = tiers.reduce((sum, tier) => sum + tier.count, 0)

	const png = useUnoSeasonTiersPng(
		`uno-tiers-${(season ?? 'season').replaceAll('/', '-')}.png`
	)

	return (
		<section className="relative mx-auto max-w-380 space-y-8 px-4 pt-32 pb-12 sm:px-6">
			<UnoPageHeader
				backHref="/uno/seasons"
				backLabel={t('nav.seasons')}
				description={
					<div className="space-y-1">
						<p>{t('seasons.tiersDescription')}</p>
						{periodLabel && (
							<p className="font-medium text-foreground">
								{periodLabel}
							</p>
						)}
					</div>
				}
				title={
					<div className="flex w-full justify-between">
						{title}
						<Button
							className="gap-2"
							disabled={png.isSavingPng}
							loading={png.isSavingPng}
							onClick={() => void png.handleSavePng()}
							size="sm"
							variant="secondary"
						>
							<Icon className="size-4" icon="lucide:image-down" />
							{t('seasons.downloadPng')}
						</Button>
					</div>
				}
			/>

			<UnoFeedback
				isError={query.isError}
				isLoading={Boolean(season) && query.isPending}
				onRetry={() => void query.refetch()}
			>
				{!season ? (
					<UnoEmpty>{t('seasons.tiersSelect')}</UnoEmpty>
				) : !hasClans ? (
					<UnoEmpty>{t('seasons.tiersEmpty')}</UnoEmpty>
				) : (
					<div className="space-y-8">
						{tiers.map((tier) => (
							<SeasonTierTable key={tier.rank} tier={tier} />
						))}
					</div>
				)}
			</UnoFeedback>

			{hasClans && (
				<div className="pointer-events-none absolute top-0 left-[-9999px]">
					<SeasonTiersPngTemplate
						periodLabel={periodLabel}
						ref={png.pngTemplateRef}
						seasonTitle={title}
						tierLabel={t('seasons.tiers')}
						tiers={tiers}
						totalLabel={
							total > 0
								? t('seasons.totalClans', { count: total })
								: null
						}
					/>
				</div>
			)}

			<PngPreviewModal
				alt={t('seasons.pngAlt')}
				closeLabel={t('seasons.pngClose')}
				copyLabel={t('seasons.pngCopy')}
				downloadLabel={t('seasons.pngDownload')}
				imageClassName="w-full rounded-lg"
				onCopy={() => void png.handleCopyPng()}
				onDownload={png.handleDownloadPng}
				onOpenChange={png.setShowPngModal}
				open={png.showPngModal}
				previewUrl={png.pngPreviewUrl}
				title={t('seasons.pngTitle')}
			/>
		</section>
	)
}
