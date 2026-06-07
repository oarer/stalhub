'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Tabs } from '@/components/ui/Tabs'
import { useBuildStats } from '@/views/calcs/builds/model/components/hooks/useBuildStats'
import {
	AllStatsTabContent,
	StatsTabContent,
} from '@/views/calcs/builds/model/components/stats'

export default function StatsTabs() {
	const {
		sortedStats,
		sortedContainerStats,
		displayNamesMap,
		prime,
		hps,
		hasContainer,
		stats,
		containerStats,
	} = useBuildStats()

	const t = useTranslations()

	return (
		<Tabs.Root className="w-full" defaultValue="statsAll">
			<Tabs.List className="grid w-full grid-cols-2">
				<Tabs.Trigger value="statsAll">
					<Icon className="text-lg" icon="lucide:bar-chart-3" />
					{t('build.stats.all')}
				</Tabs.Trigger>
				<Tabs.Trigger value="statsCont">
					<Icon className="text-lg" icon="lucide:box" />
					{t('build.stats.container')}
				</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="statsAll">
				<AllStatsTabContent
					displayNamesMap={displayNamesMap}
					hps={hps}
					prime={prime}
					sortedStats={sortedStats}
					statsMap={stats}
				/>
			</Tabs.Content>
			<Tabs.Content value="statsCont">
				<StatsTabContent
					displayNamesMap={displayNamesMap}
					hasContainer={hasContainer}
					stats={sortedContainerStats}
					statsMap={containerStats}
				/>
			</Tabs.Content>
		</Tabs.Root>
	)
}
