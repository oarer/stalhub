import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { ArsenalResponse } from '@/types/arsenal.type'

class ArsenalService {
	async get() {
		const { data } = await apiClient.get<ArsenalResponse>(`/api/v1/arsenal`)
		return data
	}
}

export const arsenalService = new ArsenalService()
