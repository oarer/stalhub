import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { ItemListing } from '@/types/api.type'

export interface BuyListItem {
	key: string
	item: ItemListing
	price: number
}

export const buyItemKey = (item: ItemListing): string =>
	`${item.data}::${item.icon}`

interface BuyState {
	title: string
	discord: string
	items: BuyListItem[]

	setTitle: (title: string) => void
	setDiscord: (discord: string) => void
	setPrice: (key: string, price: number) => void
	addItem: (item: ItemListing) => void
	removeItem: (key: string) => void
	clearItems: () => void
}

export const useBuyStore = create<BuyState>()(
	persist(
		(set) => ({
			title: 'Скупка',
			discord: '',
			items: [],

			setTitle: (title) => set({ title }),
			setDiscord: (discord) => set({ discord }),
			setPrice: (key, price) =>
				set((state) => ({
					items: state.items.map((entry) =>
						entry.key === key ? { ...entry, price } : entry
					),
				})),
			addItem: (item) =>
				set((state) => {
					const key = buyItemKey(item)
					if (state.items.some((entry) => entry.key === key)) {
						return state
					}
					return {
						items: [...state.items, { key, item, price: 0 }],
					}
				}),
			removeItem: (key) =>
				set((state) => ({
					items: state.items.filter((entry) => entry.key !== key),
				})),
			clearItems: () => set({ items: [] }),
		}),
		{
			name: 'buy-storage',
			version: 1,
		}
	)
)
