'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { mskDate } from '@/lib/date'
import { buildApiQueries } from '@/queries/build-api/build-api.queries'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { clanQueries } from '@/queries/clan/clan.queries'
import { loadoutQueries } from '@/queries/loadout/loadout.queries'
import type { UserLoadout } from '@/types/loadout/loadout.type'
import { OFFICER_RANKS } from '../clan.const'

export function useClanSquadData(clanId: string, currentUserId?: number) {
	const { data: squads, isLoading } = useSuspenseQuery(
		clanQueries.getSquads(clanId)
	)
	const { data: members } = useSuspenseQuery(clanQueries.getMembers(clanId))
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
				.filter((m) => m.userId != null)
				.map((m) => m.userId as number),
		[members]
	)
	const { data: loadouts } = useSuspenseQuery(
		loadoutQueries.getMany(memberUserIds)
	)

	const myMember = members?.find((m) => m.userId === currentUserId)
	const isOfficer = myMember != null && OFFICER_RANKS.has(myMember.rank)
	const pendingRequest = useMemo(() => {
		const bySquad = new Map<number, boolean>()
		for (const squad of squads ?? []) {
			bySquad.set(
				squad.id,
				squad.requests.some((r) => r.memberId === myMember?.id)
			)
		}
		return bySquad
	}, [squads, myMember])
	const absentUserIds = useMemo(
		() => new Set((todayAbsences ?? []).map((a) => a.userId)),
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
			map.set(lo.userId, lo)
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
		myMemberId: myMember?.id ?? null,
		pendingRequest,
		absentUserIds,
	}
}
