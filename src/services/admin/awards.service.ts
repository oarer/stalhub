import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	AdminAwardCampaign,
	AdminAwardCampaignList,
	AdminAwardCategory,
	AdminAwardCategoryInput,
	AdminAwardCreateCampaignInput,
	AdminAwardNominee,
	AdminAwardNomineeInput,
	AdminAwardPage,
	AdminAwardPlaceBulkInput,
	AdminAwardPlaceInput,
	AdminAwardResults,
	AdminAwardUpdateCampaignInput,
	AdminAwardVote,
	AdminAwardVoteParams,
	AdminAwardVoteUpdateInput,
} from '@/types/admin.type'

class AdminAwardsService {
	async list(): Promise<AdminAwardCampaignList> {
		const { data } = await apiClient.get('/api/v1/admin/awards')
		return data
	}

	async listCategories(
		campaignId: string
	): Promise<{ items: AdminAwardCategory[] }> {
		const { data } = await apiClient.get(
			`/api/v1/admin/awards/${campaignId}/categories`
		)
		return data
	}

	async listNominees(
		campaignId: string,
		categoryId: string
	): Promise<{ items: AdminAwardNominee[] }> {
		const { data } = await apiClient.get(
			`/api/v1/admin/awards/${campaignId}/categories/${categoryId}/nominees`
		)
		return data
	}

	async create(
		input: AdminAwardCreateCampaignInput
	): Promise<AdminAwardCampaign> {
		const { data } = await apiClient.post('/api/v1/admin/awards', input)
		return data
	}

	async update(
		id: string,
		input: AdminAwardUpdateCampaignInput
	): Promise<AdminAwardCampaign> {
		const { data } = await apiClient.patch(
			`/api/v1/admin/awards/${id}`,
			input
		)
		return data
	}

	async createCategory(
		campaignId: string,
		input: AdminAwardCategoryInput
	): Promise<AdminAwardCategory> {
		const { data } = await apiClient.post(
			`/api/v1/admin/awards/${campaignId}/categories`,
			input
		)
		return data
	}

	async updateCategory(
		campaignId: string,
		id: string,
		input: Partial<AdminAwardCategoryInput>
	): Promise<AdminAwardCategory> {
		const { data } = await apiClient.patch(
			`/api/v1/admin/awards/${campaignId}/categories/${id}`,
			input
		)
		return data
	}

	async deleteCategory(campaignId: string, id: string): Promise<void> {
		await apiClient.delete(
			`/api/v1/admin/awards/${campaignId}/categories/${id}`
		)
	}

	async createNominee(
		campaignId: string,
		categoryId: string,
		input: AdminAwardNomineeInput
	): Promise<AdminAwardNominee> {
		const { data } = await apiClient.post(
			`/api/v1/admin/awards/${campaignId}/categories/${categoryId}/nominees`,
			input
		)
		return data
	}

	async updateNominee(
		campaignId: string,
		categoryId: string,
		id: string,
		input: Partial<AdminAwardNomineeInput>
	): Promise<AdminAwardNominee> {
		const { data } = await apiClient.patch(
			`/api/v1/admin/awards/${campaignId}/categories/${categoryId}/nominees/${id}`,
			input
		)
		return data
	}

	async deleteNominee(
		campaignId: string,
		categoryId: string,
		id: string
	): Promise<void> {
		await apiClient.delete(
			`/api/v1/admin/awards/${campaignId}/categories/${categoryId}/nominees/${id}`
		)
	}

	async uploadAvatar(file: File): Promise<{ url: string }> {
		const form = new FormData()
		form.append('file', file)
		const { data } = await apiClient.post(
			'/api/v1/admin/awards/nominees/avatar',
			form,
			{
				headers: { 'Content-Type': 'multipart/form-data' },
				timeout: 0,
			}
		)
		return data
	}

	async uploadCategoryImage(file: File): Promise<{ url: string }> {
		const form = new FormData()
		form.append('file', file)
		const { data } = await apiClient.post(
			'/api/v1/admin/awards/categories/image',
			form,
			{
				headers: { 'Content-Type': 'multipart/form-data' },
				timeout: 0,
			}
		)
		return data
	}

	async place(
		campaignId: string,
		categoryId: string,
		nomineeId: string,
		input: AdminAwardPlaceInput
	): Promise<AdminAwardResults> {
		const { data } = await apiClient.patch(
			`/api/v1/admin/awards/${campaignId}/categories/${categoryId}/nominees/${nomineeId}/place`,
			input
		)
		return data
	}

	async placeMany(
		campaignId: string,
		places: AdminAwardPlaceBulkInput[]
	): Promise<{ ok: boolean }> {
		const { data } = await apiClient.patch(
			`/api/v1/admin/awards/${campaignId}/places`,
			{ places }
		)
		return data
	}

	async votes(
		campaignId: string,
		params: AdminAwardVoteParams = {}
	): Promise<AdminAwardPage<AdminAwardVote>> {
		const { data } = await apiClient.get(
			`/api/v1/admin/awards/${campaignId}/votes`,
			{ params }
		)
		return data
	}

	async updateVote(
		campaignId: string,
		voteId: string,
		input: AdminAwardVoteUpdateInput
	): Promise<AdminAwardVote> {
		const { data } = await apiClient.patch(
			`/api/v1/admin/awards/${campaignId}/votes/${voteId}`,
			input
		)
		return data
	}

	async stats(campaignId: string) {
		const { data } = await apiClient.get(
			`/api/v1/admin/awards/${campaignId}/stats`
		)
		return data
	}

	async results(campaignId: string): Promise<AdminAwardResults> {
		const { data } = await apiClient.get(
			`/api/v1/admin/awards/${campaignId}/results`
		)
		return data
	}
}

export const adminAwardsService = new AdminAwardsService()
