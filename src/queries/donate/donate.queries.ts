import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { Message } from '@/types/item.type'

export type DonateItem = {
	key: string
	id: string
	amount: number
	stalcoins: number
	name: Message
	icon: string | null
	has_market: boolean
	price: number
	price_per_coin: number
}

export type DonateResponse = {
	computed_at: string
	total: number
	items: DonateItem[]
	missing: string[]
}

class DonateQueries {
	get() {
		return queryOptions<DonateResponse>({
			queryKey: ['donate-calculator'],
			queryFn: async () => {
				const { data } = await apiClient.get<DonateResponse>(
					'/api/v1/donate-calculator'
				)
				return data
			},
			staleTime: 1000 * 60 * 10,
		})
	}
}

export const donateQueries = new DonateQueries()
