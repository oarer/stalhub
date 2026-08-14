'use client'

import { useMemo, useState } from 'react'
import type { ClanMember, ClanSquad, SquadMap } from '@/types/clan/clan.type'
import { SQUAD_MAPS } from '../components/squads/squads.const'

export function useClanSquadModals(
	squads: ClanSquad[] = [],
	members: ClanMember[] = []
) {
	const [activeMap, setActiveMap] = useState<SquadMap>(() => {
		const counts = new Map<SquadMap, number>()
		for (const s of squads) {
			counts.set(s.map, (counts.get(s.map) ?? 0) + 1)
		}
		let best: SquadMap = 'SMALL_BERDOVKA'
		let bestCount = -1
		for (const m of SQUAD_MAPS) {
			const c = counts.get(m.value) ?? 0
			if (c > bestCount) {
				best = m.value
				bestCount = c
			}
		}
		return best
	})
	const [createOpen, setCreateOpen] = useState(false)
	const [newName, setNewName] = useState('')
	const [newMap, setNewMap] = useState<SquadMap>('SMALL_BERDOVKA')
	const [assignSquadId, setAssignSquadId] = useState<number | null>(null)
	const [assignSlot, setAssignSlot] = useState<number | null>(null)
	const [leaderSquadId, setLeaderSquadId] = useState<number | null>(null)
	const [mapSquadId, setMapSquadId] = useState<number | null>(null)
	const [targetMap, setTargetMap] = useState<SquadMap>('SMALL_BERDOVKA')
	const [editingMemberId, setEditingMemberId] = useState<number | null>(null)

	const activeSquads = useMemo(
		() => squads.filter((s) => s.map === activeMap),
		[squads, activeMap]
	)
	const mapSquad = squads.find((s) => s.id === mapSquadId) ?? null
	const leaderSquad = squads.find((s) => s.id === leaderSquadId) ?? null
	const editingMember = members.find((m) => m.id === editingMemberId) ?? null

	return {
		activeMap,
		setActiveMap,
		activeSquads,
		createOpen,
		setCreateOpen,
		newName,
		setNewName,
		newMap,
		setNewMap,
		assignSquadId,
		setAssignSquadId,
		assignSlot,
		setAssignSlot,
		leaderSquadId,
		setLeaderSquadId,
		mapSquadId,
		setMapSquadId,
		targetMap,
		setTargetMap,
		editingMemberId,
		setEditingMemberId,
		mapSquad,
		leaderSquad,
		editingMember,
	}
}
