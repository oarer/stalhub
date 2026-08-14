import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { LoadoutData, UserLoadout } from '@/types/loadout/loadout.type'

class LoadoutService {
	async getMany(userIds: number[]): Promise<UserLoadout[]> {
		if (userIds.length === 0) return []
		const { data } = await apiClient.get<UserLoadout[]>('/api/v1/loadout', {
			params: { userIds: userIds.join(',') },
		})
		return data ?? []
	}

	async getOne(userId: number): Promise<UserLoadout | null> {
		try {
			const { data } = await apiClient.get<UserLoadout>(
				`/api/v1/loadout/${userId}`
			)
			return data ?? null
		} catch {
			return null
		}
	}

	async upsert(data: LoadoutData, isPublic = true): Promise<UserLoadout> {
		const { data: res } = await apiClient.put<UserLoadout>(
			'/api/v1/loadout',
			{ data, is_public: isPublic }
		)
		return res
	}
}

export const loadoutService = new LoadoutService()
