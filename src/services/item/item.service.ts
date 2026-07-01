import axios, { type AxiosError } from 'axios'
import { apiClient } from '@/app/api/interceptors/root.interceptor'
import { GITHUB_RAW_BASE } from '@/constants/github.const'
import type { BarterResponse } from '@/types/barter.type'
import type { Item } from '@/types/item.type'

class ItemService {
	async getByGithubUrl(githubUrl: string) {
		const { data } = await axios.get<Item>(
			`${GITHUB_RAW_BASE}/items/${githubUrl}`
		)
		return data
	}

	async getBarter(id: string) {
		try {
			const { data } = await apiClient.get<BarterResponse>(
				`/api/v1/barter/${id}`
			)
			return data
		} catch (e) {
			const err = e as AxiosError

			if (err.response?.status === 404) {
				return null
			}

			throw e
		}
	}
}

export const itemService = new ItemService()
