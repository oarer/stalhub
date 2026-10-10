'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import type { SquadMap } from '@/types/clan/clan.type'
import { MAX_SQUADS_PER_MAP, SQUAD_MAPS } from './squads.const'

interface MapTabsProps {
	activeMap: SquadMap
	squadCount: number
	squadsByMap: Record<SquadMap, number>
	isOfficer: boolean
	isCreating: boolean
	onActiveMapChange: (map: SquadMap) => void
	onCreateSquad: (map: SquadMap) => void
	children: ReactNode
}

export function MapTabs({
	activeMap,
	squadCount,
	squadsByMap,
	isOfficer,
	isCreating,
	onActiveMapChange,
	onCreateSquad,
	children,
}: MapTabsProps) {
	const t = useTranslations()
	const remaining = MAX_SQUADS_PER_MAP - squadCount
	const placeholderCount = isOfficer ? Math.min(2, Math.max(remaining, 0)) : 0

	return (
		<Tabs.Root
			className="flex flex-col gap-4"
			onValueChange={(value) => onActiveMapChange(value as SquadMap)}
			value={activeMap}
		>
			<div className="flex items-center gap-2">
				<Tabs.List className="grid w-full flex-1 grid-cols-1 gap-2 rounded-xl ring-transparent sm:grid-cols-3">
					{SQUAD_MAPS.map((map) => (
						<Tabs.Trigger
							className="min-w-0 flex-1 gap-2"
							key={map.value}
							value={map.value}
						>
							<Icon
								className="shrink-0 text-lg"
								icon={map.icon}
							/>
							<span className="truncate">{t(map.label)}</span>
							{(squadsByMap[map.value] ?? 0) > 0 && (
								<span className="rounded-md bg-accent px-1.5 py-0.5 font-mono font-semibold text-xs">
									{squadsByMap[map.value]}
								</span>
							)}
						</Tabs.Trigger>
					))}
				</Tabs.List>
				<Badge
					className="shrink-0 font-mono"
					title={t('clan.squads.squadCountHint')}
					variant="secondary"
				>
					{t('clan.squads.squadCount', {
						count: squadCount,
						max: MAX_SQUADS_PER_MAP,
					})}
				</Badge>
			</div>
			<div className="grid grid-cols-1 items-start gap-3 2xl:grid-cols-2">
				{children}
				{Array.from({ length: placeholderCount }, (_, i) => (
					<button
						className="flex min-h-44 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-primary/50 border-dashed bg-card/50 px-5 py-8 text-primary transition-colors hover:border-primary hover:bg-primary/5"
						disabled={isCreating}
						key={`${activeMap}-new-${squadCount + i}`}
						onClick={() => onCreateSquad(activeMap)}
						type="button"
					>
						<Icon className="text-2xl" icon="lucide:plus" />
						<span className="font-semibold text-sm">
							{t('clan.squads.newSquad')}
						</span>
						<span className="font-mono font-semibold text-muted-foreground text-xs">
							{t('clan.squads.squadSlot', {
								n: squadCount + i + 1,
								max: MAX_SQUADS_PER_MAP,
							})}
						</span>
					</button>
				))}
			</div>
			{squadCount === 0 && (
				<div className="flex flex-col items-center gap-1 rounded-xl bg-card px-5 py-4 text-center">
					<Icon className="text-4xl" icon="lucide:map-pinned" />
					<h2 className="font-semibold text-lg">
						{t('clan.squads.noSquadsHere')}
					</h2>
					{isOfficer && (
						<p className="font-semibold text-foreground text-sm">
							{t('clan.squads.createFirstHint')}
						</p>
					)}
				</div>
			)}
		</Tabs.Root>
	)
}
