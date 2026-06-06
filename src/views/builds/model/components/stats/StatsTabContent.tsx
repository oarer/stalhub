'use client'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { StatRow } from './StatRow'

interface StatsTabContentProps {
	stats: [string, number][]
	displayNamesMap: Record<string, string>
	hasContainer?: boolean
}

export function StatsTabContent({
	stats,
	displayNamesMap,
	hasContainer = true,
}: StatsTabContentProps) {
	const t = useTranslations()

	return (
		<Card.Root>
			<Card.Content className="flex flex-col gap-2 text-sm">
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
	displayNamesMap: Record<string, string>
}

export function AllStatsTabContent({
	prime,
	hps,
	sortedStats,
	displayNamesMap,
}: AllStatsTabContentProps) {
	const t = useTranslations()

	return (
		<Card.Root>
			<Card.Content className="flex flex-col gap-2 text-sm">
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
