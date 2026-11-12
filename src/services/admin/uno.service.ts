import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	AdminUnoBan,
	AdminUnoBanInput,
	AdminUnoBanList,
	AdminUnoIpStats,
} from '@/types/admin.type'

class AdminUnoService {
	async ipStats(take = 50): Promise<AdminUnoIpStats> {
		const { data } = await apiClient.get<AdminUnoIpStats>(
			'/api/v1/admin/uno/ip-stats',
			{ params: { take } }
		)
		return data
	}

	async bans(): Promise<AdminUnoBanList> {
		const { data } = await apiClient.get<AdminUnoBanList>(
			'/api/v1/admin/uno/bans'
		)
		return data
	}

	async ban({ ip, reason }: AdminUnoBanInput): Promise<AdminUnoBan> {
		const { data } = await apiClient.post<AdminUnoBan>(
			'/api/v1/admin/uno/bans',
			{ ip, reason }
		)
		return data
	}

	async unban(ip: string): Promise<{ ok: boolean }> {
		const { data } = await apiClient.delete<{ ok: boolean }>(
			`/api/v1/admin/uno/bans/${encodeURIComponent(ip)}`
		)
		return data
	}
}

export const adminUnoService = new AdminUnoService()
