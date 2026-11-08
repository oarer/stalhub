'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { CLink } from '@/components/ui/Link'
import { cn } from '@/lib/cn'
import { unoQueries } from '@/queries/uno/uno.queries'
import { allianceColors } from '@/types/player.type'
import { BreakdownList } from './components/clan/BreakdownList'
import { ClanHistory } from './components/clan/ClanHistory'
import { MetricGrid } from './components/clan/MetricGrid'
import { UnoEmpty } from './components/UnoEmpty'
import { UnoFeedback } from './components/UnoFeedback'
import { UnoPageHeader } from './components/UnoPageHeader'
import { UnoStat } from './components/UnoStat'
import { useUnoLocale } from './hooks/useUnoLocale'
import {
	UNO_METRIC_KEYS,
	UNO_MODE_KEYS,
	UNO_SUMMARY_METRIC_KEYS,
} from './utils/uno.const'
import {
	formatUnoPercent,
	formatUnoValue,
	normalizeUnoFaction,
	normalizeUnoMap,
} from './utils/uno.utils'

export default function UnoClanView({ clanId }: { clanId: string }) {
	const t = useTranslations('uno')
	const locale = useUnoLocale()
	const clanQuery = useQuery(unoQueries.clan(clanId))
	const analyticsQuery = useQuery(unoQueries.analytics(clanId))
	const clan = clanQuery.data?.clan
	const analytics = analyticsQuery.data
	const metrics = analytics?.metrics ?? clanQuery.data?.metrics ?? []
	const modes = analytics?.modes ?? []
	const maps = analytics?.maps ?? []
	const isError = clanQuery.isError || analyticsQuery.isError
	const isLoading = clanQuery.isPending || analyticsQuery.isPending

	const faction = normalizeUnoFaction(clan?.faction || undefined)
	const factionColor = faction ? allianceColors[faction] : undefined

	const localizedMetrics = useMemo(
		() =>
			metrics
				.filter((metric) => !UNO_SUMMARY_METRIC_KEYS.has(metric.key))
				.map((metric) => {
					const key = UNO_METRIC_KEYS[metric.key]
					return key ? { ...metric, label: t(key) } : metric
				}),
		[metrics, t]
	)

	const localizedModes = useMemo(
		() =>
			modes.map((mode) => {
				const key = UNO_MODE_KEYS[mode.key]
				return key ? { ...mode, label: t(key) } : mode
			}),
		[modes, t]
	)

	const localizedMaps = useMemo(
		() =>
			maps.map((map) => {
				const key = normalizeUnoMap(map.key)
				return key ? { ...map, label: t(`grids.maps.${key}`) } : map
			}),
		[maps, t]
	)

	return (
		<section className="mx-auto max-w-380 space-y-8 px-4 pt-32 pb-12 sm:px-6">
			<UnoFeedback
				isError={isError}
				isLoading={isLoading}
				onRetry={() => {
					void clanQuery.refetch()
					void analyticsQuery.refetch()
				}}
			>
				{!clan?.id ? (
					<UnoEmpty>{t('clan.empty')}</UnoEmpty>
				) : (
					<>
						<UnoPageHeader
							actions={
								<CLink
									className="w-fit gap-2"
									href={`/uno/compare?left=${encodeURIComponent(clan.id)}`}
									size="sm"
								>
									{t('compare.open')}
									<Icon icon="lucide:arrow-up-right" />
								</CLink>
							}
							backHref="/uno"
							title={
								<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
									<p
										className={cn(
											'block truncate',
											factionColor
										)}
									>
										{clan.tag && (
											<span className="shrink-0 font-semibold">
												[{clan.tag}]{' '}
											</span>
										)}
										{clan.name}
									</p>
								</div>
							}
						/>

						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
							<UnoStat
								accent
								label={t('stats.rating')}
								value={formatUnoValue(clan.rating, locale)}
							/>
							<UnoStat
								label={t('stats.rank')}
								value={formatUnoValue(clan.position, locale)}
							/>
							<UnoStat
								label={t('stats.winRate')}
								value={formatUnoPercent(
									analytics?.stats.winRate,
									locale
								)}
							/>
							<UnoStat
								label={t('stats.matches')}
								value={formatUnoValue(
									analytics?.stats.fights ?? null,
									locale
								)}
							/>
						</div>

						<MetricGrid metrics={localizedMetrics} />
						<div className="grid gap-4 lg:grid-cols-2">
							<BreakdownList
								items={localizedModes}
								title={t('analytics.modes')}
							/>
							<BreakdownList
								items={localizedMaps}
								title={t('analytics.maps')}
							/>
						</div>
						<ClanHistory clanId={clanId} />
					</>
				)}
			</UnoFeedback>
		</section>
	)
}
