'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import type { SquadMap } from '@/types/clan/clan.type'
import { SQUAD_MAPS } from './squads.const'

interface MapTabsProps {
	activeMap: SquadMap
	squadCount: number
	isOfficer: boolean
	onActiveMapChange: (map: SquadMap) => void
	children: ReactNode
}

export function MapTabs({
	activeMap,
	squadCount,
	isOfficer,
	onActiveMapChange,
	children,
}: MapTabsProps) {
	const t = useTranslations()

	return (
		<Tabs.Root
			className="flex flex-col gap-4"
			onValueChange={(value) => onActiveMapChange(value as SquadMap)}
			value={activeMap}
		>
			<Tabs.List className="grid w-full grid-cols-3 gap-2 rounded-xl bg-background ring-transparent">
				{SQUAD_MAPS.map((map) => (
					<Tabs.Trigger
						className="gap-2 bg-accent/30"
						key={map.value}
						value={map.value}
					>
						<Icon
							className="text-lg text-neutral-400"
							icon={map.icon}
						/>
						{t(map.label)}
					</Tabs.Trigger>
				))}
			</Tabs.List>
			<div className="flex flex-col gap-3">{children}</div>
			{squadCount === 0 && (
				<div className="flex flex-col items-center gap-2 rounded-xl bg-background px-5 py-4">
					<Icon className="text-4xl" icon="lucide:map-pinned" />
					<h2 className="font-semibold text-lg">
						{t('clan.squads.noSquadsHere')}
					</h2>
					{isOfficer && (
						<p className="font-semibold text-sm text-text-accent">
							{t('clan.squads.createFirstHint')}
						</p>
					)}
				</div>
			)}
		</Tabs.Root>
	)
}
