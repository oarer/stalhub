import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	AdminClan,
	AdminClanMember,
	AdminClanStage,
	AdminClanStageUpdate,
	AdminClanUpdate,
} from '@/types/admin.type'
import type { PaginatedResponse } from '@/types/user.type'

class AdminClanService {
	async list({
		take = 20,
		page = 1,
		search,
	}: {
		take?: number
		page?: number
		search?: string
	} = {}): Promise<PaginatedResponse<AdminClan>> {
		const { data } = await apiClient.get<PaginatedResponse<AdminClan>>(
			'/api/v1/admin/clans',
			{ params: { take, page, search } }
		)
		return data
	}

	async get(clanId: string): Promise<AdminClan> {
		const { data } = await apiClient.get<AdminClan>(
			`/api/v1/admin/clans/${clanId}`
		)
		return data
	}

	async getMembers(clanId: string): Promise<AdminClanMember[]> {
		const { data } = await apiClient.get<AdminClanMember[]>(
			`/api/v1/admin/clans/${clanId}/members`
		)
		return data
	}

	async update(clanId: string, update: AdminClanUpdate): Promise<AdminClan> {
		const { data } = await apiClient.patch<AdminClan>(
			`/api/v1/admin/clans/${clanId}`,
			update
		)
		return data
	}

	async block(clanId: string, reason?: string): Promise<AdminClan> {
		const { data } = await apiClient.post<AdminClan>(
			`/api/v1/admin/clans/${clanId}/block`,
			{ reason }
		)
		return data
	}

	async unblock(clanId: string): Promise<AdminClan> {
		const { data } = await apiClient.delete<AdminClan>(
			`/api/v1/admin/clans/${clanId}/block`
		)
		return data
	}

	async delete(clanId: string): Promise<void> {
		await apiClient.delete(`/api/v1/admin/clans/${clanId}`)
	}

	async sync(
		clanId: string
	): Promise<{ clan_id: string; member_count: number }> {
		const { data } = await apiClient.post<{
			clan_id: string
			member_count: number
		}>(`/api/v1/admin/clans/${clanId}/sync`)
		return data
	}

	async getStages(clanId: string): Promise<AdminClanStage[]> {
		const { data } = await apiClient.get<AdminClanStage[]>(
			`/api/v1/admin/clans/${clanId}/sessions`
		)
		return data
	}

	async updateStage(
		stageId: number,
		update: AdminClanStageUpdate
	): Promise<AdminClanStage> {
		const { data } = await apiClient.patch<AdminClanStage>(
			`/api/v1/admin/clans/sessions/${stageId}`,
			update
		)
		return data
	}

	async deleteStage(stageId: number): Promise<void> {
		await apiClient.delete(`/api/v1/admin/clans/sessions/${stageId}`)
	}
}

export const adminClanService = new AdminClanService()
