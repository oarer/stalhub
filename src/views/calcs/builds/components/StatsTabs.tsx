'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { memo } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { useBuildStats } from '@/views/calcs/builds/model/components/hooks/useBuildStats'
import {
	AllStatsTabContent,
	StatsTabContent,
} from '@/views/calcs/builds/model/components/stats'
import { useStatDeltas } from '@/views/calcs/builds/model/components/stats/useStatDeltas'

export default memo(function StatsTabs() {
	const {
		sortedStats,
		sortedContainerStats,
		displayNamesMap,
		isPercentMap,
		prime,
		hps,
		stopping,
		hasContainer,
		stats,
		containerStats,
		availableReactions,
		selectedReaction,
	} = useBuildStats()

	const deltaMap = useStatDeltas(stats)

	const t = useTranslations()

	const reactionProps = {
		availableReactions,
		selectedReaction,
		displayNamesMap,
	}

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
					deltaMap={deltaMap}
					displayNamesMap={displayNamesMap}
					hps={hps}
					isPercentMap={isPercentMap}
					prime={prime}
					reactionProps={reactionProps}
					sortedStats={sortedStats}
					statsMap={stats}
					stopping={stopping}
				/>
			</Tabs.Content>
			<Tabs.Content value="statsCont">
				<StatsTabContent
					deltaMap={deltaMap}
					displayNamesMap={displayNamesMap}
					hasContainer={hasContainer}
					hps={hps}
					isPercentMap={isPercentMap}
					reactionProps={reactionProps}
					stats={sortedContainerStats}
					statsMap={containerStats}
					stopping={stopping}
				/>
			</Tabs.Content>
		</Tabs.Root>
	)
})
