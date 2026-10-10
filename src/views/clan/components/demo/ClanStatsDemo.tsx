'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { Alert } from '@/components/ui/Alert'
import { ClanStatsBody } from '../stats/ClanStatsBody'
import { buildClanDemoData } from './demoStats'

export function ClanStatsDemo({ seed }: { seed?: number }) {
	const t = useTranslations()
	const demo = useMemo(() => buildClanDemoData(seed ?? 42), [seed])

	return (
		<div className="flex flex-col gap-4">
			<Alert.Root variant="default">
				<Alert.Title className="flex items-center gap-2">
					{t('clan.layout.frozen.demoTitle')}
				</Alert.Title>
				<Alert.Description>
					{t('clan.layout.frozen.demoDesc')}
				</Alert.Description>
			</Alert.Root>

			<div aria-hidden={false} className="flex flex-col gap-4">
				<ClanStatsBody
					grenadeAllTime={demo.grenadeAllTime}
					grenadeStages={demo.grenadeStages}
					members={demo.members}
					stats={demo.stats}
				/>
			</div>
		</div>
	)
}
