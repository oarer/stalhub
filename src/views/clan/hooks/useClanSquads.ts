'use client'

import { useClanSquadData } from './useClanSquadData'
import { useClanSquadModals } from './useClanSquadModals'
import { useClanSquadMutations } from './useClanSquadMutations'
import { useClanSquadPng } from './useClanSquadPng'

export function useClanSquads(clanId: string, currentUserId?: number) {
	const data = useClanSquadData(clanId, currentUserId)
	const modals = useClanSquadModals(data.squads ?? [], data.members ?? [])
	const mutations = useClanSquadMutations({
		clanId,
		squads: data.squads ?? [],
		members: data.members ?? [],
		setCreateOpen: modals.setCreateOpen,
		setNewName: modals.setNewName,
		setAssignSquadId: modals.setAssignSquadId,
		setAssignSlot: modals.setAssignSlot,
		setLeaderSquadId: modals.setLeaderSquadId,
		setMapSquadId: modals.setMapSquadId,
		setEditingMemberId: modals.setEditingMemberId,
	})
	const png = useClanSquadPng(modals.activeSquads, modals.activeMap)

	return { data, modals, mutations, png }
}
