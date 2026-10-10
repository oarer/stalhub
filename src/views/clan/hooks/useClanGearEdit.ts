'use client'

import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { clanQueries } from '@/queries/clan/clan.queries'
import { clanService } from '@/services/clan/clan.service'
import { loadoutService } from '@/services/loadout/loadout.service'
import type { BuildApi } from '@/types/build-api.type'
import type {
	ClanMember,
	SquadMap,
} from '@/types/clan/clan.type'
import type {
	LoadoutData,
	UserLoadout,
} from '@/types/loadout/loadout.type'
import { useClanGear } from './useClanGear'
import { useClanRoles } from './useClanRoles'

export interface GearEditTarget {
	squadId: number
	squadName: string
	map: SquadMap
	slot: number
	squadMemberId: number
}

/**
 * Shared gear editing: resolves where a member's gear lives
 * (personal loadout and/or squad gear overrides) and exposes
 * a picker + editor flow reusable from any player card.
 */
export function useClanGearEdit(clanId: string) {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const { data: squads } = useSuspenseQuery(clanQueries.getSquads(clanId))
	const { members, loadoutByUserId, weapons, armors, buildById } =
		useClanGear(clanId)
	const { profile, isOfficer, isLeader } = useClanRoles()
	const currentUserId = profile?.user_id
	const canManage = isOfficer || isLeader

	const [pickerMember, setPickerMember] = useState<ClanMember | null>(null)
	const [editingMemberId, setEditingMemberId] = useState<number | null>(null)
	const [editingTarget, setEditingTarget] =
		useState<GearEditTarget | null>(null)

	const invalidateSquads = () => {
		queryClient.invalidateQueries({ queryKey: ['clan', clanId, 'squads'] })
	}

	const setGearOverrideMutation = useMutation({
		mutationFn: ({
			squadId,
			slot,
			gear_override,
		}: {
			squadId: number
			slot: number
			gear_override: LoadoutData | null
		}) => clanService.setGearOverride(squadId, slot, gear_override),
		onSuccess: () => {
			toast.success(t('clan.squads.toasts.loadoutSaved'))
			invalidateSquads()
			setEditingMemberId(null)
			setEditingTarget(null)
		},
		onError: () => {
			toast.error(t('clan.squads.toasts.loadoutError'))
		},
	})

	const saveLoadoutMutation = useMutation({
		mutationFn: (data: LoadoutData) => loadoutService.upsert(data, true),
		onSuccess: () => {
			toast.success(t('clan.squads.toasts.loadoutSaved'))
			queryClient.invalidateQueries({ queryKey: ['loadout'] })
			setEditingMemberId(null)
			setEditingTarget(null)
		},
		onError: () => {
			toast.error(t('clan.squads.toasts.loadoutError'))
		},
	})

	const myBuilds = useMemo<BuildApi[]>(
		() =>
			[...buildById.values()].filter(
				(b) => b.author.id === currentUserId
			),
		[buildById, currentUserId]
	)

	const membershipsOf = (memberId: number): GearEditTarget[] => {
		const targets: GearEditTarget[] = []
		for (const squad of squads ?? []) {
			for (const sm of squad.members) {
				if (sm.member_id === memberId) {
					targets.push({
						squadId: squad.id,
						squadName: squad.name,
						map: squad.map,
						slot: sm.slot,
						squadMemberId: sm.id,
					})
				}
			}
		}
		return targets.sort((a, b) => a.squadId - b.squadId || a.slot - b.slot)
	}

	const editingMember =
		editingMemberId != null
			? (members.find((m) => m.id === editingMemberId) ?? null)
			: null

	const gearOverrideForEdit = useMemo<LoadoutData | null>(() => {
		if (!editingTarget) return null
		for (const squad of squads ?? []) {
			const sm = squad.members.find(
				(m) => m.id === editingTarget.squadMemberId
			)
			if (sm) return sm.gear_override
		}
		return null
	}, [editingTarget, squads])

	const editorLoadout = useMemo<UserLoadout | null>(() => {
		if (!editingMember) return null
		if (gearOverrideForEdit) {
			return {
				user_id: editingMember.user_id ?? 0,
				data: gearOverrideForEdit,
				is_public: false,
				updated_at: '',
			}
		}
		if (editingMember.user_id == null) return null
		return loadoutByUserId.get(editingMember.user_id) ?? null
	}, [editingMember, gearOverrideForEdit, loadoutByUserId])

	const canEditGear = (member: ClanMember): boolean => {
		if (member.user_id != null && member.user_id === currentUserId)
			return true
		if (!canManage) return false
		return membershipsOf(member.id).length > 0
	}

	const openGearEdit = (member: ClanMember) => {
		if (member.user_id != null && member.user_id === currentUserId) {
			setEditingMemberId(member.id)
			setEditingTarget(null)
			setPickerMember(null)
			return
		}
		if (!canManage) return
		const targets = membershipsOf(member.id)
		if (targets.length === 1) {
			setEditingMemberId(member.id)
			setEditingTarget(targets[0])
			setPickerMember(null)
		} else if (targets.length > 1) {
			setPickerMember(member)
		}
	}

	const pickTarget = (target: GearEditTarget) => {
		if (pickerMember) setEditingMemberId(pickerMember.id)
		setEditingTarget(target)
		setPickerMember(null)
	}

	const closePicker = () => setPickerMember(null)

	const closeEditor = () => {
		setEditingMemberId(null)
		setEditingTarget(null)
	}

	const handleSave = (loadout: LoadoutData) => {
		if (
			editingTarget &&
			canManage &&
			editingMember &&
			editingMember.user_id !== currentUserId
		) {
			setGearOverrideMutation.mutate({
				squadId: editingTarget.squadId,
				slot: editingTarget.slot,
				gear_override: loadout,
			})
		} else {
			saveLoadoutMutation.mutate(loadout)
		}
	}

	return {
		canManage,
		currentUserId,
		membershipsOf,
		canEditGear,
		openGearEdit,
		pickerMember,
		pickTarget,
		closePicker,
		editingMember,
		editorLoadout,
		hasOverride: gearOverrideForEdit != null,
		isPending:
			setGearOverrideMutation.isPending ||
			saveLoadoutMutation.isPending,
		handleSave,
		closeEditor,
		weapons,
		armors,
		myBuilds,
	}
}

export type ClanGearEdit = ReturnType<typeof useClanGearEdit>
