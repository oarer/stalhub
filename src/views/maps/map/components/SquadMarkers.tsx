'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { clanQueries } from '@/queries/clan/clan.queries'
import type { ClanSquad, SquadMap } from '@/types/clan/clan.type'

const SQUAD_MAP_TO_TILE: Record<SquadMap, string> = {
	SMALL_BERDOVKA: 'small-berdovka',
	KHVOUINOY: 'khvoinyi',
	NIZINA: 'nizina',
}

const SQUAD_COLORS = [
	'#3b82f6',
	'#ef4444',
	'#22c55e',
	'#f59e0b',
	'#8b5cf6',
	'#ec4899',
	'#06b6d4',
	'#f97316',
]

function getSquadColor(index: number) {
	return SQUAD_COLORS[index % SQUAD_COLORS.length]
}

interface SquadMarkersProps {
	mapName: string
}

export default function SquadMarkers({ mapName }: SquadMarkersProps) {
	const t = useTranslations()
	const { data: profile } = useQuery(clanQueries.getMe())
	const clanId = profile?.clan_id

	const { data: squads } = useQuery({
		...clanQueries.getSquads(clanId!),
		enabled: Boolean(clanId),
	})

	const matchingSquads = (squads ?? []).filter(
		(squad) => SQUAD_MAP_TO_TILE[squad.map] === mapName
	)

	if (!clanId || matchingSquads.length === 0) return null

	return (
		<div className="bg-card/80 ring-primary/30 pointer-events-auto absolute right-4 bottom-4 z-999 max-h-[60vh] w-64 overflow-y-auto rounded-lg p-3 shadow-lg ring-1 backdrop-blur-md">
			<div className="border-primary/20 mb-2 flex items-center gap-2 border-b pb-2">
				<Icon className="text-primary text-base" icon="lucide:users" />
				<span className="text-sm font-semibold">
					{t('map.squads.title')}
				</span>
				<span className="bg-primary/20 ml-auto rounded-full px-2 py-0.5 text-xs font-medium">
					{matchingSquads.length}
				</span>
			</div>

			<div className="flex flex-col gap-2">
				{matchingSquads.map((squad, idx) => (
					<SquadCard
						color={getSquadColor(idx)}
						key={squad.id}
						squad={squad}
					/>
				))}
			</div>
		</div>
	)
}

function SquadCard({ squad, color }: { squad: ClanSquad; color: string }) {
	const t = useTranslations()
	const memberCount = squad.members.length
	const leaderName = squad.leader?.member.name ?? '—'

	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="bg-muted/30 flex flex-col gap-1 rounded-md p-2"
			initial={{ opacity: 0, y: 5 }}
			transition={{ duration: 0.2 }}
		>
			<div className="flex items-center gap-2">
				<span
					className="inline-block h-2.5 w-2.5 rounded-full"
					style={{ backgroundColor: color }}
				/>
				<span className="text-sm font-medium">{squad.name}</span>
			</div>

			<div className="text-muted-foreground flex items-center gap-1 text-xs">
				<Icon className="text-xs" icon="lucide:crown" />
				<span>{leaderName}</span>
			</div>

			<div className="text-muted-foreground flex items-center gap-1 text-xs">
				<Icon className="text-xs" icon="lucide:user" />
				<span>
					{t('map.squads.memberCount', { count: memberCount })}
				</span>
			</div>

			{squad.members.length > 0 && (
				<div className="mt-1 flex flex-wrap gap-1">
					{squad.members.map((m) => (
						<span
							className="bg-muted/50 rounded px-1.5 py-0.5 text-xs"
							key={m.id}
						>
							{m.member.name}
						</span>
					))}
				</div>
			)}
		</motion.div>
	)
}
