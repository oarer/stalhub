'use client'

import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { clanService } from '@/services/clan/clan.service'
import { loadoutService } from '@/services/loadout/loadout.service'
import type { ClanMember, ClanSquad, SquadMap } from '@/types/clan/clan.type'
import type { LoadoutData } from '@/types/loadout/loadout.type'
import type { DragSource } from '../components/squads/SquadDnd'

interface UseClanSquadMutationsParams {
	clanId: string
	squads: ClanSquad[]
	members: ClanMember[]
	setCreateOpen: (open: boolean) => void
	setNewName: (name: string) => void
	setAssignSquadId: (id: number | null) => void
	setAssignSlot: (slot: number | null) => void
	setLeaderSquadId: (id: number | null) => void
	setMapSquadId: (id: number | null) => void
	setEditingMemberId: (id: number | null) => void
}

export function useClanSquadMutations({
	clanId,
	squads,
	members,
	setCreateOpen,
	setNewName,
	setAssignSquadId,
	setAssignSlot,
	setLeaderSquadId,
	setMapSquadId,
	setEditingMemberId,
}: UseClanSquadMutationsParams) {
	const t = useTranslations()
	const queryClient = getQueryClient()

	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ['clan', clanId, 'squads'] })
		queryClient.invalidateQueries({
			queryKey: ['clan', clanId, 'absences'],
		})
	}

	const createMutation = useMutation({
		mutationFn: ({ name, map }: { name: string; map: SquadMap }) =>
			clanService.createSquad(name, map),
		onSuccess: () => {
			setCreateOpen(false)
			setNewName('')
			invalidate()
		},
		onError: () => {
			toast.error(t('clan.squads.toasts.createError'))
		},
	})

	const joinMutation = useMutation({
		mutationFn: (squadId: number) => clanService.requestJoinSquad(squadId),
		onSuccess: () => {
			toast.success(t('clan.squads.toasts.requestSent'))
			invalidate()
		},
		onError: () => {
			toast.error(t('clan.squads.toasts.requestError'))
		},
	})

	const approveMutation = useMutation({
		mutationFn: (requestId: number) =>
			clanService.approveSquadRequest(requestId),
		onSuccess: () => {
			toast.success(t('clan.squads.toasts.approved'))
			invalidate()
		},
		onError: () => {
			toast.error(t('clan.squads.toasts.approveError'))
		},
	})

	const rejectMutation = useMutation({
		mutationFn: (requestId: number) =>
			clanService.rejectSquadRequest(requestId),
		onSuccess: () => {
			toast.success(t('clan.squads.toasts.rejected'))
			invalidate()
		},
		onError: () => {
			toast.error(t('clan.squads.toasts.rejectError'))
		},
	})

	const assignMutation = useMutation({
		mutationFn: ({
			squadId,
			member_id,
			slot,
		}: {
			squadId: number
			member_id: number
			slot: number
		}) => clanService.assignSquadMember(squadId, member_id, slot),
		onSuccess: () => {
			setAssignSquadId(null)
			setAssignSlot(null)
			invalidate()
		},
	})

	const removeMutation = useMutation({
		mutationFn: ({ squadId, slot }: { squadId: number; slot: number }) =>
			clanService.removeSquadMember(squadId, slot),
		onSuccess: () => invalidate(),
	})

	const leaderMutation = useMutation({
		mutationFn: ({
			squadId,
			member_id,
		}: {
			squadId: number
			member_id: number | null
		}) => clanService.setSquadLeader(squadId, member_id),
		onSuccess: () => {
			setLeaderSquadId(null)
			invalidate()
		},
	})

	const deleteMutation = useMutation({
		mutationFn: (squadId: number) => clanService.deleteSquad(squadId),
		onSuccess: () => invalidate(),
	})

	const mapMutation = useMutation({
		mutationFn: ({ squadId, map }: { squadId: number; map: SquadMap }) =>
			clanService.updateSquadMap(squadId, map),
		onSuccess: () => {
			setMapSquadId(null)
			invalidate()
		},
		onError: () => {
			toast.error(t('clan.squads.toasts.mapError'))
		},
	})

	const saveLoadoutMutation = useMutation({
		mutationFn: (data: LoadoutData) => loadoutService.upsert(data, true),
		onSuccess: () => {
			toast.success(t('clan.squads.toasts.loadoutSaved'))
			queryClient.invalidateQueries({ queryKey: ['loadout'] })
			setEditingMemberId(null)
		},
		onError: () => {
			toast.error(t('clan.squads.toasts.loadoutError'))
		},
	})

	const unassignedMembers = (map?: SquadMap) => {
		const assignedIds = new Set(
			squads
				.filter((s) => !map || s.map === map)
				.flatMap((s) => s.members.map((m) => m.member_id))
		)
		return members.filter((m) => !assignedIds.has(m.id))
	}

	const moveMember = async (
		source: DragSource,
		target: { squadId: number; slot: number }
	) => {
		if (source.squadId === target.squadId && source.slot === target.slot)
			return
		const targetSquad = squads.find((s) => s.id === target.squadId)
		const occupant = targetSquad?.members.find(
			(m) => m.slot === target.slot
		)
		try {
			if (occupant) {
				await assignMutation.mutateAsync({
					squadId: source.squadId,
					member_id: occupant.member_id,
					slot: source.slot,
				})
			}
			await assignMutation.mutateAsync({
				squadId: target.squadId,
				member_id: source.memberId,
				slot: target.slot,
			})
		} catch {
			toast.error(t('clan.squads.toasts.moveError'))
		}
	}

	return {
		createMutation,
		joinMutation,
		approveMutation,
		rejectMutation,
		assignMutation,
		removeMutation,
		leaderMutation,
		deleteMutation,
		mapMutation,
		saveLoadoutMutation,
		moveMember,
		unassignedMembers,
	}
}
