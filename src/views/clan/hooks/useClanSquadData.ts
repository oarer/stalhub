'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { mskDate } from '@/lib/date'
import { buildApiQueries } from '@/queries/build-api/build-api.queries'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { clanQueries } from '@/queries/clan/clan.queries'
import { loadoutQueries } from '@/queries/loadout/loadout.queries'
import type { UserLoadout } from '@/types/loadout/loadout.type'
import { useClanRoles } from './useClanRoles'

export function useClanSquadData(clanId: string, currentUserId?: number) {
	const { data: squads, isLoading } = useSuspenseQuery(
		clanQueries.getSquads(clanId)
	)
	const { members, myMember, myMemberId, isOfficer } = useClanRoles()
	const { data: todayAbsences } = useSuspenseQuery(
		clanQueries.getAbsences(clanId, mskDate())
	)
	const { data: weapons } = useSuspenseQuery(
		itemsQueries.get({ type: 'weapons' })
	)
	const { data: armors } = useSuspenseQuery(
		itemsQueries.get({ type: 'armor' })
	)
	const { data: builds } = useSuspenseQuery(
		buildApiQueries.list({ take: 500 })
	)

	const memberUserIds = useMemo(
		() =>
			(members ?? [])
				.filter((m) => m.user_id != null)
				.map((m) => m.user_id as number),
		[members]
	)
	const { data: loadouts } = useSuspenseQuery(
		loadoutQueries.getMany(memberUserIds)
	)

	const pendingRequest = useMemo(() => {
		const bySquad = new Map<number, boolean>()
		for (const squad of squads ?? []) {
			bySquad.set(
				squad.id,
				squad.requests.some((r) => r.member_id === myMember?.id)
			)
		}
		return bySquad
	}, [squads, myMember])
	const absentUserIds = useMemo(
		() => new Set((todayAbsences ?? []).map((a) => a.user_id)),
		[todayAbsences]
	)

	const buildById = useMemo(
		() => new Map((builds?.data ?? []).map((b) => [b.id, b])),
		[builds]
	)
	const myBuilds = useMemo(
		() => (builds?.data ?? []).filter((b) => b.author.id === currentUserId),
		[builds, currentUserId]
	)
	const loadoutByUserId = useMemo(() => {
		const map = new Map<number, UserLoadout>()
		for (const lo of loadouts ?? []) {
			map.set(lo.user_id, lo)
		}
		return map
	}, [loadouts])

	return {
		squads,
		isLoading,
		members,
		weapons: weapons ?? [],
		armors: armors ?? [],
		buildById,
		myBuilds,
		loadoutByUserId,
		isOfficer,
		myMemberId,
		pendingRequest,
		absentUserIds,
	}
}
