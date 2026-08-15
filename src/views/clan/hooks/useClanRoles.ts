'use client'

import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { clanQueries } from '@/queries/clan/clan.queries'
import { exboQueries } from '@/queries/exbo/exbo.queries'
import { Regions } from '@/types/api.type'
import { OFFICER_RANKS, RANK_ORDER } from '../clan.const'

export function useClanRoles() {
	const { data: profile } = useSuspenseQuery(clanQueries.getMe())
	const clan = profile?.clan ?? null
	const clanId = profile?.clanId ?? null

	const { data: characters } = useQuery({
		...exboQueries.getCharacters((clan?.region as Regions) ?? Regions.RU),
		enabled: Boolean(clan),
	})
	const { data: members } = useSuspenseQuery(clanQueries.getMembers(clanId!))

	const characterNames = useMemo(
		() =>
			new Set(
				(characters ?? []).map((c) => c.username.trim().toLowerCase())
			),
		[characters]
	)

	const myMembers = useMemo(() => {
		if (!profile) return []
		return [...(members ?? [])]
			.filter(
				(m) =>
					(m.userId != null && m.userId === profile.userId) ||
					characterNames.has(m.name.trim().toLowerCase())
			)
			.sort(
				(a, b) =>
					(RANK_ORDER[a.rank] ?? 99) - (RANK_ORDER[b.rank] ?? 99)
			)
	}, [members, profile, characterNames])

	const myMember = myMembers[0] ?? null

	const isLeader =
		myMembers.some((m) => m.rank === 'LEADER') ||
		(clan != null &&
			characterNames.has(clan.leader.trim().toLowerCase()))
	const isOfficer = myMembers.some((m) => OFFICER_RANKS.has(m.rank))

	return {
		profile,
		clan,
		clanId,
		members: members ?? [],
		myMembers,
		myMember,
		myMemberId: myMember?.id ?? null,
		isLeader,
		isOfficer,
	}
}
