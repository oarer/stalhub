'use client'

import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { buildApiQueries } from '@/queries/build-api/build-api.queries'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { clanQueries } from '@/queries/clan/clan.queries'
import { loadoutQueries } from '@/queries/loadout/loadout.queries'
import type { BuildApi } from '@/types/build-api.type'
import type { Item } from '@/types/item.type'
import type { UserLoadout } from '@/types/loadout/loadout.type'

export interface GearLookups {
	weapons: Item[]
	armors: Item[]
	buildById: Map<string, BuildApi>
}

const EMPTY_LOOKUPS: GearLookups = {
	weapons: [],
	armors: [],
	buildById: new Map(),
}

/** Item/build dictionaries for resolving loadout ids to names. Safe to call anywhere (non-suspense). */
export function useGearLookups(): GearLookups {
	const { data: weapons } = useQuery(itemsQueries.get({ type: 'weapons' }))
	const { data: armors } = useQuery(itemsQueries.get({ type: 'armor' }))
	const { data: builds } = useQuery(buildApiQueries.list({ take: 500 }))

	return useMemo<GearLookups>(
		() => ({
			weapons: weapons ?? EMPTY_LOOKUPS.weapons,
			armors: armors ?? EMPTY_LOOKUPS.armors,
			buildById: new Map(
				(builds?.data ?? []).map((b) => [b.id, b] as const)
			),
		}),
		[weapons, armors, builds]
	)
}

/** Full gear data for a clan: members + their loadouts + item dictionaries. */
export function useClanGear(clanId: string) {
	const { data: members } = useSuspenseQuery(clanQueries.getMembers(clanId))

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
	const lookups = useGearLookups()

	const loadoutByUserId = useMemo(() => {
		const map = new Map<number, UserLoadout>()
		for (const lo of loadouts ?? []) {
			map.set(lo.user_id, lo)
		}
		return map
	}, [loadouts])

	return {
		members: members ?? [],
		loadoutByUserId,
		...lookups,
	}
}
