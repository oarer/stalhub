import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { Hideout } from '@/types/hideout.type'

class HideoutService {
	async get() {
		const { data } = await apiClient.get<Hideout>(`/api/v1/hideout`)
		return data
	}
}

export const hideoutService = new HideoutService()
