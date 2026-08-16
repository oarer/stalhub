'use client'

import { useTranslations } from 'next-intl'
import { memo, useMemo } from 'react'
import { montserrat } from '@/app/fonts'
import { Accordion } from '@/components/ui/Accordion'
import { Card } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/Tooltip'
import type { BuildStats } from '../hooks/buildStatsUtils'
import { BUILD_STAT_COLORS } from '../hooks/itemStatsUtils'
import { StatRow } from './StatRow'
import { groupStatsByCategory, type StatCategoryGroup } from './statsCategories'

// у холода лимит выше
const ACCUMULATION_THRESHOLDS: { key: string; threshold: number }[] = [
	{
		key: 'stalker.artefact_properties.factor.frost_accumulation',
		threshold: 1,
	},
]
const DEFAULT_ACCUMULATION_THRESHOLD = 0.5

interface StatCategoryListProps {
	groups: StatCategoryGroup[]
	displayNamesMap: Record<string, string>
	isPercentMap?: Record<string, boolean>
}

const StatCategoryList = memo(function StatCategoryList({
	groups,
	displayNamesMap,
	isPercentMap,
}: StatCategoryListProps) {
	const t = useTranslations()

	const items = useMemo(
		() =>
			groups.map((group) => ({
				key: group.key,
				title: t(`build.stats.categories.${group.key}`),
				content: group.rows.map(([key, val]) => (
					<StatRow
						color={BUILD_STAT_COLORS[key]}
						isPercent={isPercentMap?.[key]}
						key={key}
						keyName={key}
						name={displayNamesMap[key] ?? key}
						value={val}
					/>
				)),
			})),
		[groups, displayNamesMap, isPercentMap, t]
	)

	const defaultExpandedKeys = useMemo(
		() => groups.map((group) => group.key),
		[groups]
	)

	return (
		<Accordion
			className="flex flex-col gap-1"
			defaultExpandedKeys={defaultExpandedKeys}
			disableEntranceAnimation
			items={items}
			selectionMode="multiple"
			size="sm"
			titleClass="px-0 py-0"
			variant={'ghost'}
		/>
	)
})

function AccumulationWarnings({
	statsMap,
	displayNamesMap,
}: {
	statsMap: BuildStats
	displayNamesMap: Record<string, string>
}) {
	const warnings: { name: string; value: number }[] = []
	const t = useTranslations()

	for (const [key, val] of Object.entries(statsMap)) {
		if (!key.includes('accumulation')) continue
		const custom = ACCUMULATION_THRESHOLDS.find((t) => t.key === key)
		const threshold = custom
			? custom.threshold
			: DEFAULT_ACCUMULATION_THRESHOLD
		if (val > threshold) {
			warnings.push({ name: displayNamesMap[key] ?? key, value: val })
		}
	}

	if (warnings.length === 0) return null

	return (
		<div className="flex flex-col gap-1 border-border-secondary border-b pb-2 text-red-400">
			{warnings.map(({ name }) => (
				<p className="text-sm" key={name}>
					{name} — {t('build.damaged')}
				</p>
			))}
		</div>
	)
}

interface StatsTabContentProps {
	stats: [string, number][]
	statsMap: BuildStats
	displayNamesMap: Record<string, string>
	isPercentMap?: Record<string, boolean>
	hasContainer?: boolean
	hps?: number
	stopping?: number
}

export const StatsTabContent = memo(function StatsTabContent({
	stats,
	statsMap,
	displayNamesMap,
	isPercentMap,
	hasContainer = true,
	hps,
	stopping,
}: StatsTabContentProps) {
	const t = useTranslations()

	const groups = useMemo(() => groupStatsByCategory(stats), [stats])

	return (
		<Card.Root>
			<Card.Content className="flex flex-col gap-2 text-sm">
				<AccumulationWarnings
					displayNamesMap={displayNamesMap}
					statsMap={statsMap}
				/>
				<div className="flex w-full justify-between">
					<span>{t('build.stats.regen')}</span>
					<span className={`${montserrat.className} text-border`}>
						{hps}%
					</span>
				</div>
				{stopping !== null && (
					<p className="flex justify-between">
						<span>{t('build.stats.stopping')}</span>
						<span className={`${montserrat.className} text-border`}>
							{stopping}%
						</span>
					</p>
				)}
				<div className="flex flex-col gap-2 border-neutral-700 border-t pt-2">
					{stats.length === 0 ? (
						<p className="font-semibold text-text-accent">
							{hasContainer
								? t('build.stats.no_stats')
								: t('build.stats.no_container')}
						</p>
					) : (
						<StatCategoryList
							displayNamesMap={displayNamesMap}
							groups={groups}
							isPercentMap={isPercentMap}
						/>
					)}
				</div>
			</Card.Content>
		</Card.Root>
	)
})

interface AllStatsTabContentProps {
	prime?: number
	hps?: number
	stopping?: number
	sortedStats: [string, number][]
	statsMap: BuildStats
	displayNamesMap: Record<string, string>
	isPercentMap?: Record<string, boolean>
}

export const AllStatsTabContent = memo(function AllStatsTabContent({
	prime = 100,
	hps,
	stopping,
	sortedStats,
	statsMap,
	displayNamesMap,
	isPercentMap,
}: AllStatsTabContentProps) {
	const t = useTranslations()

	const groups = useMemo(
		() => groupStatsByCategory(sortedStats),
		[sortedStats]
	)

	return (
		<Card.Root>
			<Card.Content className="flex flex-col gap-2 text-sm">
				<AccumulationWarnings
					displayNamesMap={displayNamesMap}
					statsMap={statsMap}
				/>
				{prime && (
					<p className="flex justify-between">
						<span>{t('build.stats.prime')}</span>
						<span className={`${montserrat.className} text-border`}>
							{prime}
						</span>
					</p>
				)}
				{hps && (
					<Tooltip.Root>
						<Tooltip.Trigger asChild>
							<div className="flex w-full justify-between">
								<span>{t('build.stats.regen')}</span>
								<span
									className={`${montserrat.className} text-border`}
								>
									{hps}%
								</span>
							</div>
						</Tooltip.Trigger>
						<Tooltip.Content>
							{t('build.stats.hps')}:{' '}
							<span className={`${montserrat.className}`}>
								{(prime * (hps / 100)).toFixed(2)}
							</span>
						</Tooltip.Content>
					</Tooltip.Root>
				)}
				{stopping !== null && (
					<p className="flex justify-between">
						<span>{t('build.stats.stopping')}</span>
						<span className={`${montserrat.className} text-border`}>
							{stopping}%
						</span>
					</p>
				)}
				<div className="flex flex-col gap-2 border-neutral-700 border-t pt-2">
					{sortedStats.length === 0 ? (
						<p className="font-semibold text-text-accent">
							{t('build.stats.no_stats')}
						</p>
					) : (
						<StatCategoryList
							displayNamesMap={displayNamesMap}
							groups={groups}
							isPercentMap={isPercentMap}
						/>
					)}
				</div>
			</Card.Content>
		</Card.Root>
	)
})
