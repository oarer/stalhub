'use client'

import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import type { BuildStats } from '../hooks/buildStatsUtils'
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
					{name} — будет наносить урон персонажу
				</p>
			))}
		</div>
	)
}

interface StatsTabContentProps {
	stats: [string, number][]
	statsMap: BuildStats
	displayNamesMap: Record<string, string>
	hasContainer?: boolean
}

export function StatsTabContent({
	stats,
	statsMap,
	displayNamesMap,
	hasContainer = true,
}: StatsTabContentProps) {
	const t = useTranslations()

	return (
		<Card.Root>
			<Card.Content className="flex flex-col gap-2 text-sm">
				<AccumulationWarnings
					displayNamesMap={displayNamesMap}
					statsMap={statsMap}
				/>
				{stats.length === 0 ? (
					<p className="text-neutral-500">
						{hasContainer
							? t('build.stats.no_stats')
							: t('build.stats.no_container')}
					</p>
				) : (
					stats.map(([key, val]) => (
						<StatRow
							key={key}
							keyName={key}
							name={displayNamesMap[key] ?? key}
							value={val}
						/>
					))
				)}
			</Card.Content>
		</Card.Root>
	)
}

interface AllStatsTabContentProps {
	prime?: string
	hps?: string
	sortedStats: [string, number][]
	statsMap: BuildStats
	displayNamesMap: Record<string, string>
}

export function AllStatsTabContent({
	prime,
	hps,
	sortedStats,
	statsMap,
	displayNamesMap,
}: AllStatsTabContentProps) {
	const t = useTranslations()

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
						<span className="text-yellow-400">{prime}</span>
					</p>
				)}
				{hps && (
					<p className="flex justify-between">
						<span>{t('build.stats.regen')}</span>
						<span className="text-yellow-400">{hps}%</span>
					</p>
				)}
				<div className="flex flex-col gap-2 border-neutral-700 border-t pt-2">
					{sortedStats.length === 0 ? (
						<p className="text-neutral-500">
							{t('build.stats.no_stats')}
						</p>
					) : (
						sortedStats.map(([key, val]) => (
							<StatRow
								key={key}
								keyName={key}
								name={displayNamesMap[key] ?? key}
								value={val}
							/>
						))
					)}
				</div>
			</Card.Content>
		</Card.Root>
	)
}
