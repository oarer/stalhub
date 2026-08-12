'use client'

import { useTranslations } from 'next-intl'
import { memo, useMemo } from 'react'
import { montserrat } from '@/app/fonts'
import { Card } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/Tooltip'
import type { BuildStats } from '../hooks/buildStatsUtils'
import { BUILD_STAT_COLORS } from '../hooks/itemStatsUtils'
import { StatRow } from './StatRow'

// у холода лимит выше
const ACCUMULATION_THRESHOLDS: { key: string; threshold: number }[] = [
	{
		key: 'stalker.artefact_properties.factor.frost_accumulation',
		threshold: 1,
	},
]
const DEFAULT_ACCUMULATION_THRESHOLD = 0.5

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

	const rows = useMemo(() => {
		const colored: [string, number][] = []
		const nonColored: [string, number][] = []
		for (const entry of stats) {
			if (BUILD_STAT_COLORS[entry[0]]) {
				colored.push(entry)
			} else {
				nonColored.push(entry)
			}
		}
		return [...nonColored, ...colored].map(([key, val]) => (
			<StatRow
				color={BUILD_STAT_COLORS[key]}
				isPercent={isPercentMap?.[key]}
				key={key}
				keyName={key}
				name={displayNamesMap[key] ?? key}
				value={val}
			/>
		))
	}, [stats, displayNamesMap, isPercentMap])

	return (
		<Card.Root>
			<Card.Content className="flex flex-col gap-2 text-sm">
				<AccumulationWarnings
					displayNamesMap={displayNamesMap}
					statsMap={statsMap}
				/>
				{hps && (
					<Tooltip.Root>
						<Tooltip.Trigger asChild>
							<div className="flex w-full justify-between">
								<span>{t('build.stats.regen')}</span>
								<span className="text-yellow-400">{hps}%</span>
							</div>
						</Tooltip.Trigger>
						<Tooltip.Content>
							{t('build.stats.hp')}:
						</Tooltip.Content>
					</Tooltip.Root>
				)}
				{stopping && (
					<p className="flex justify-between">
						<span>{t('build.stats.stopping')}</span>
						<span className="text-yellow-400">{stopping}%</span>
					</p>
				)}
				{stats.length === 0 ? (
					<p className="text-neutral-500">
						{hasContainer
							? t('build.stats.no_stats')
							: t('build.stats.no_container')}
					</p>
				) : (
					rows
				)}
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

	const rows = useMemo(() => {
		const colored: [string, number][] = []
		const nonColored: [string, number][] = []
		for (const entry of sortedStats) {
			if (BUILD_STAT_COLORS[entry[0]]) {
				colored.push(entry)
			} else {
				nonColored.push(entry)
			}
		}
		return [...nonColored, ...colored].map(([key, val]) => (
			<StatRow
				color={BUILD_STAT_COLORS[key]}
				isPercent={isPercentMap?.[key]}
				key={key}
				keyName={key}
				name={displayNamesMap[key] ?? key}
				value={val}
			/>
		))
	}, [sortedStats, displayNamesMap, isPercentMap])

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
				{stopping && (
					<p className="flex justify-between">
						<span>{t('build.stats.stopping')}</span>
						<span className={`${montserrat.className} text-border`}>
							{stopping}%
						</span>
					</p>
				)}
				<div className="flex flex-col gap-2 border-neutral-700 border-t pt-2">
					{sortedStats.length === 0 ? (
						<p className="text-neutral-500">
							{t('build.stats.no_stats')}
						</p>
					) : (
						rows
					)}
				</div>
			</Card.Content>
		</Card.Root>
	)
})
