import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	AdminDispute,
	AdminDisputeDetail,
	AdminDisputeListParams,
	AdminDisputeMessagePage,
	AdminDisputeStats,
} from '@/types/admin.type'
import type { CaseCommand, CommissionFile } from '@/types/commission.type'
import type { PaginatedResponse } from '@/types/user.type'

const root = '/api/v1/admin/disputes'
const privateRequest = { noServerCache: true }

class AdminDisputeService {
	async list({
		take = 24,
		page = 1,
		status,
		kind,
		assigned,
		search,
	}: AdminDisputeListParams = {}): Promise<PaginatedResponse<AdminDispute>> {
		const { data } = await apiClient.get<PaginatedResponse<AdminDispute>>(
			root,
			{ params: { take, page, status, kind, assigned, search } }
		)
		return data
	}

	async stats(): Promise<AdminDisputeStats> {
		const { data } = await apiClient.get<AdminDisputeStats>(`${root}/stats`)
		return data
	}

	async get(id: string): Promise<AdminDisputeDetail> {
		const { data } = await apiClient.get<AdminDisputeDetail>(
			`${root}/${id}`,
			privateRequest
		)
		return data
	}

	async messages(
		id: string,
		cursor: { after?: number; before?: number } = {}
	): Promise<AdminDisputeMessagePage> {
		const { data } = await apiClient.get<AdminDisputeMessagePage>(
			`${root}/${id}/messages`,
			{ ...privateRequest, params: cursor }
		)
		return data
	}

	async command(id: string, input: CaseCommand): Promise<{ id: string }> {
		const { data } = await apiClient.post<{ id: string }>(
			`${root}/${id}/actions`,
			input
		)
		return data
	}

	async download(id: string, file: CommissionFile): Promise<void> {
		const response = await apiClient.get<Blob>(
			`${root}/${id}/files/${file.id}`,
			{ ...privateRequest, responseType: 'blob' }
		)
		const url = URL.createObjectURL(response.data)
		const link = document.createElement('a')
		link.href = url
		link.download = file.name
		link.click()
		setTimeout(() => URL.revokeObjectURL(url), 10000)
	}
}

export const adminDisputeService = new AdminDisputeService()
