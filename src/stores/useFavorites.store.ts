'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FavoriteType =
	| 'artefact'
	| 'container'
	| 'boost'
	| 'armor'
	| 'weapon'
	| 'ammo'

type FavoriteItem = {
	id: string
	type: FavoriteType
	itemId: string
	addedAt: number
}

type FavoritesState = {
	favorites: FavoriteItem[]

	addFavorite: (type: FavoriteType, itemId: string) => void
	removeFavorite: (type: FavoriteType, itemId: string) => void
	toggleFavorite: (type: FavoriteType, itemId: string) => void
	isFavorite: (type: FavoriteType, itemId: string) => boolean
	getFavoritesByType: (type: FavoriteType) => FavoriteItem[]
	clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
	persist(
		(set, get) => ({
			favorites: [],

			addFavorite: (type, itemId) => {
				const { favorites } = get()
				const exists = favorites.some(
					(f) => f.type === type && f.itemId === itemId
				)
				if (exists) return

				set({
					favorites: [
						...favorites,
						{
							id: crypto.randomUUID(),
							type,
							itemId,
							addedAt: Date.now(),
						},
					],
				})
			},

			removeFavorite: (type, itemId) => {
				const { favorites } = get()
				set({
					favorites: favorites.filter(
						(f) => !(f.type === type && f.itemId === itemId)
					),
				})
			},

			toggleFavorite: (type, itemId) => {
				const { favorites } = get()
				const exists = favorites.some(
					(f) => f.type === type && f.itemId === itemId
				)
				if (exists) {
					get().removeFavorite(type, itemId)
				} else {
					get().addFavorite(type, itemId)
				}
			},

			isFavorite: (type, itemId) => {
				const { favorites } = get()
				return favorites.some(
					(f) => f.type === type && f.itemId === itemId
				)
			},

			getFavoritesByType: (type) => {
				const { favorites } = get()
				return favorites.filter((f) => f.type === type)
			},

			clearFavorites: () => set({ favorites: [] }),
		}),
		{
			name: 'favorites-storage',
			version: 1,
		}
	)
)
