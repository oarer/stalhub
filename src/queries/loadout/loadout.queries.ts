import { queryOptions } from '@tanstack/react-query'
import { loadoutService } from '@/services/loadout/loadout.service'
import type { UserLoadout } from '@/types/loadout/loadout.type'

class LoadoutQueries {
	getMany(userIds: number[]) {
		return queryOptions<UserLoadout[]>({
			queryKey: ['loadout', 'many', userIds],
			queryFn: () => loadoutService.getMany(userIds),
			staleTime: 1000 * 30,
			retry: false,
		})
	}

	getOne(userId: number) {
		return queryOptions<UserLoadout | null>({
			queryKey: ['loadout', 'one', userId],
			queryFn: () => loadoutService.getOne(userId),
			staleTime: 1000 * 30,
			retry: false,
		})
	}
}

export const loadoutQueries = new LoadoutQueries()
