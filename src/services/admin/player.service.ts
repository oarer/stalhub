import { apiClient } from '@/app/api/interceptors/root.interceptor'

interface PlayerRoleEntry {
	uuid: string
	role: string
	description: string
}

interface BlacklistEntry {
	uuid: string
}

class AdminPlayerService {
	async getByRole(role: string): Promise<PlayerRoleEntry[]> {
		const { data } = await apiClient.get<PlayerRoleEntry[]>(
			'/api/v1/player/all',
			{ params: { role } }
		)
		return data
	}

	async create(data: {
		uuid: string
		description: string
		role: string
	}): Promise<void> {
		await apiClient.post('/api/v1/player', data)
	}

	async update(data: {
		uuid: string
		description?: string
		role?: string
	}): Promise<void> {
		await apiClient.patch('/api/v1/player', data)
	}

	async getBlacklist(): Promise<BlacklistEntry[]> {
		const { data } = await apiClient.get<BlacklistEntry[]>(
			'/api/v1/player/blacklist'
		)
		return data
	}

	async addToBlacklist(uuid: string): Promise<void> {
		await apiClient.post('/api/v1/player/blacklist', { uuid })
	}

	async removeFromBlacklist(uuid: string): Promise<void> {
		await apiClient.delete('/api/v1/player/blacklist', {
			data: { uuid },
		})
	}
}

export const adminPlayerService = new AdminPlayerService()
