import axios from 'axios'

import { GITHUB_RAW_BASE } from '@/constants/github.const'
import type { ItemsParams, ItemsResponse } from '@/types/build.type'

class ItemsService {
	async get({ type }: ItemsParams) {
		const { data } = await axios.get<ItemsResponse>(
			`${GITHUB_RAW_BASE}/listing/${type}.json`
		)
		return data
	}
}

export const itemsService = new ItemsService()
